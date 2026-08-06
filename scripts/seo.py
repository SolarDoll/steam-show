"""
Steam Show — SEO-автоматика: sitemap, видео-разметка, проверки.

Что делает:
  1. sitemap.xml       — пересобирает целиком. lastmod считается сам: дата
                         последнего коммита страницы (и общих источников
                         контента — content.js / media.js), а если файл правлен
                         и не закоммичен — сегодняшняя дата. Руками не править.
  2. VideoObject       — в каждую страницу шоу вписывает ItemList из VideoObject
                         по её роликам (YouTube-ID берутся из content.js).
                         Блок стоит между маркерами VIDEO-LD:start/end.
                         Название, дата загрузки, длительность и превью —
                         настоящие, с YouTube; кэш: scripts/yt-meta.json.
  3. Проверки          — og:image совпадает с реальным размером файла, на месте
                         twitter:title/description, og:image:alt, hreflang,
                         canonical на своём домене, все страницы в sitemap.

Запуск:
  python scripts/seo.py             всё; недостающие ролики добираются из сети
  python scripts/seo.py --offline   без сети (только кэш yt-meta.json)
  python scripts/seo.py --check     ничего не пишет, только проверки
  python scripts/seo.py --refresh   перезабрать метаданные всех роликов заново

Новое шоу: дописать страницу в PAGES и id в SHOW_PAGES — и прогнать скрипт.
"""
import argparse
import datetime
import html
import json
import os
import re
import subprocess
import sys
import urllib.request

# консоль Windows по умолчанию не в UTF-8 — русские сообщения иначе падают
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://steamshow.art"

CONTENT_JS = "assets/js/content.js"
YT_CACHE = "scripts/yt-meta.json"
SITEMAP = "sitemap.xml"

# Страницы сайта: (EN-файл, приоритет). RU-версия (<имя>-ru.html) добавляется
# автоматически с приоритетом на 0.1 ниже — она вторична по отношению к EN.
PAGES = [
    ("index.html", 1.0),
    ("dragon-fire-show.html", 0.9),
    ("fire-show.html", 0.9),
    ("led-fire-show.html", 0.8),
    ("led-show.html", 0.8),
    ("stilt-walkers.html", 0.8),
]
# id шоу -> EN-файл страницы (для видео-разметки; порядок = как в content.js)
SHOW_PAGES = [
    ("dragon", "dragon-fire-show.html"),
    ("fire", "fire-show.html"),
    ("ledfire", "led-fire-show.html"),
    ("led", "led-show.html"),
    ("stilts", "stilt-walkers.html"),
]
# Общие источники текста и медиа: правка в них меняет содержимое ВСЕХ страниц
# (текст подставляет JS), поэтому lastmod считаем и по ним.
SHARED = ["assets/js/content.js", "assets/js/media.js"]

# Картинки превью ссылки (og:image) — WhatsApp, Telegram, Facebook, LinkedIn.
# Им нужен ГОРИЗОНТАЛЬНЫЙ кадр 1200x630: вертикальный они показывают узкой
# полосой. Готовим отдельные файлы из подходящих кадров галереи:
#   ключ -> (исходник, куда тянуть кроп по вертикали: top | center | bottom)
# Поменять кадр в превью = поменять здесь имя файла и прогнать скрипт.
OG_W, OG_H = 1200, 630
OG_IMAGES = {
    "home": ("assets/web/dragon/dragon-025.jpg", "top"),   # главная (обе языковые версии)
    "fire": ("assets/web/fire/fire-007.jpg", "top"),
    "ledfire": ("assets/web/ledfire/ledfire-011.jpg", "center"),
    "stilts": ("assets/web/stilts/stilts-022.jpg", "top"),
}

LD_START = "<!-- VIDEO-LD:start — автогенерация: python scripts/seo.py. Руками не править. -->"
LD_END = "<!-- VIDEO-LD:end -->"

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept-Language": "en"}

P_YT_TITLE = re.compile(r'<meta name="title" content="([^"]*)"')
P_YT_UPLOAD = re.compile(r'"uploadDate":"([^"]+)"')
P_YT_LEN = re.compile(r'"lengthSeconds":"(\d+)"')

warnings = []


def warn(msg):
    warnings.append(msg)
    print("  ! " + msg)


def rel(p):
    return os.path.join(ROOT, p)


def read(p):
    with open(rel(p), encoding="utf-8") as f:
        return f.read()


def write(p, text):
    with open(rel(p), "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def ru(file):
    return file.replace(".html", "-ru.html")


def page_url(file):
    """адрес страницы: index.html — это корень сайта, остальное — /<файл>"""
    return SITE + "/" if file == "index.html" else SITE + "/" + file


# ---------------------------------------------------------------- content.js
def videos_by_show():
    """YouTube-ID роликов каждого шоу из content.js (единственный источник).
       Разметка автогенерится, поэтому расхождение — ошибка, а не предупреждение."""
    src = read(CONTENT_JS)
    out = {}
    for sid, _file in SHOW_PAGES:
        head = "\n    %s: {" % sid
        i = src.find(head)
        if i < 0:
            sys.exit("content.js: не нашёл шоу '%s' — поправьте SHOW_PAGES в seo.py" % sid)
        m = re.search(r"videos:\s*\[([^\]]*)\]", src[i:i + 4000])
        ids = re.findall(r"'([A-Za-z0-9_-]{8,})'", m.group(1)) if m else []
        if not ids:
            sys.exit("content.js: у шоу '%s' не разобрался список videos" % sid)
        out[sid] = ids
    return out


# ------------------------------------------------------------------- YouTube
def iso_duration(seconds):
    seconds = int(seconds)
    h, rest = divmod(seconds, 3600)
    m, s = divmod(rest, 60)
    out = "PT"
    if h:
        out += "%dH" % h
    if m:
        out += "%dM" % m
    if s or not (h or m):
        out += "%dS" % s
    return out


def head_ok(url):
    try:
        req = urllib.request.Request(url, method="HEAD", headers=UA)
        return urllib.request.urlopen(req, timeout=15).status == 200
    except Exception:
        return False


def fetch_yt(vid):
    """название, дата загрузки, длительность и лучшее превью одного ролика"""
    url = "https://www.youtube.com/watch?v=" + vid
    page = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) \
        .read().decode("utf-8", "ignore")
    title = P_YT_TITLE.search(page)
    upload = P_YT_UPLOAD.search(page)
    length = P_YT_LEN.search(page)
    if not (title and upload and length):
        raise RuntimeError("страница ролика разобралась не полностью")
    maxres = "https://i.ytimg.com/vi/%s/maxresdefault.jpg" % vid
    thumb = maxres if head_ok(maxres) else "https://i.ytimg.com/vi/%s/hqdefault.jpg" % vid
    return {
        "title": html.unescape(title.group(1)).strip(),
        "uploadDate": upload.group(1),
        "duration": iso_duration(length.group(1)),
        "thumb": thumb,
    }


def yt_meta(all_ids, offline=False, refresh=False):
    """кэш метаданных роликов: читаем, добираем недостающие из сети, сохраняем"""
    cache = {}
    if os.path.isfile(rel(YT_CACHE)) and not refresh:
        cache = json.loads(read(YT_CACHE))
    missing = [v for v in all_ids if v not in cache]
    if missing and offline:
        warn("нет метаданных для %d роликов, а сеть отключена (--offline): "
             "разметка для них не будет обновлена" % len(missing))
    elif missing:
        print("fetching youtube meta (%d)..." % len(missing))
        for vid in missing:
            try:
                cache[vid] = fetch_yt(vid)
                print("  %s  %s  %s" % (vid, cache[vid]["duration"], cache[vid]["title"][:60]))
            except Exception as e:
                warn("YouTube %s: %s" % (vid, e))
        write(YT_CACHE, json.dumps(cache, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
        print("written:", YT_CACHE)
    return cache


# -------------------------------------------------------------- видео-JSON-LD
def meta_content(src, key, prop=False):
    attr = "property" if prop else "name"
    m = re.search(r'<meta %s="%s" content="([^"]*)"' % (attr, re.escape(key)), src)
    return html.unescape(m.group(1)) if m else None


def video_ld(file, ids, cache):
    """ItemList из VideoObject для одной страницы шоу.
       description берём из мета-описания самой страницы — оно уже на нужном
       языке и правится там же, где остальные мета-теги."""
    src = read(file)
    desc = meta_content(src, "description") or ""
    items = []
    for n, vid in enumerate([v for v in ids if v in cache], 1):
        m = cache[vid]
        items.append(json.dumps({
            "@type": "ListItem", "position": n,
            "item": {
                "@type": "VideoObject",
                "name": m["title"],
                "description": desc,
                "thumbnailUrl": [m["thumb"]],
                "uploadDate": m["uploadDate"],
                "duration": m["duration"],
                "embedUrl": "https://www.youtube.com/embed/" + vid,
                "url": page_url(file) + "#videos",
                "publisher": {"@type": "Organization", "name": "Steam Show",
                              "logo": {"@type": "ImageObject", "url": SITE + "/assets/img/logo.png"}},
            },
        }, ensure_ascii=False, separators=(",", ":")))
    if not items:
        return None
    return ('<script type="application/ld+json">\n'
            '{"@context":"https://schema.org","@type":"ItemList","itemListElement":[\n'
            + ",\n".join(items) + "\n]}\n</script>")


def patch_video_ld(file, block):
    """вписать/обновить блок между маркерами (первый раз — перед SS_SHOW)"""
    src = read(file)
    new = LD_START + "\n" + block + "\n" + LD_END
    if LD_START in src and LD_END in src:
        out = re.sub(re.escape(LD_START) + r".*?" + re.escape(LD_END), lambda _m: new, src, flags=re.S)
    else:
        anchor = "\n<script>window.SS_SHOW"
        if anchor not in src:
            warn("%s: не нашёл, куда вставить видео-разметку" % file)
            return False
        out = src.replace(anchor, "\n" + new + anchor, 1)
    if out == src:
        return False
    write(file, out)
    return True


def build_video_ld(cache):
    vids = videos_by_show()
    changed = 0
    for sid, en_file in SHOW_PAGES:
        for file in (en_file, ru(en_file)):
            block = video_ld(file, vids[sid], cache)
            if not block:
                warn("%s: нет метаданных роликов — разметка не вписана" % file)
                continue
            if patch_video_ld(file, block):
                changed += 1
                print("  video-ld %-26s %d роликов" % (file, block.count('"VideoObject"')))
    print("video-ld: обновлено страниц —", changed)


# ------------------------------------------------------------- og-превью 1200x630
def build_og_images():
    """собрать assets/web/og/<ключ>.jpg — горизонтальные превью для мессенджеров"""
    try:
        from PIL import Image
    except ImportError:
        warn("нет Pillow — og-превью не пересобраны")
        return
    out_dir = rel("assets/web/og")
    os.makedirs(out_dir, exist_ok=True)
    for key, (src, anchor) in OG_IMAGES.items():
        dst = "assets/web/og/%s.jpg" % key
        if not os.path.isfile(rel(src)):
            warn("og-превью %s: нет исходника %s" % (key, src))
            continue
        if os.path.isfile(rel(dst)) and os.path.getmtime(rel(dst)) >= os.path.getmtime(rel(src)):
            continue                                   # уже собрано и не устарело
        im = Image.open(rel(src)).convert("RGB")
        w, h = im.size
        need_h = int(round(w * OG_H / OG_W))
        if need_h <= h:                                 # режем по высоте
            top = {"top": 0, "center": (h - need_h) // 2, "bottom": h - need_h}[anchor]
            im = im.crop((0, top, w, top + need_h))
        else:                                           # исходник слишком «широкий»
            need_w = int(round(h * OG_W / OG_H))
            left = (w - need_w) // 2
            im = im.crop((left, 0, left + need_w, h))
        im = im.resize((OG_W, OG_H), Image.LANCZOS)
        im.save(rel(dst), "JPEG", quality=82, optimize=True, progressive=True)
        print("  og-превью", dst, "из", src)


# -------------------------------------------------------------------- sitemap
def git_out(args):
    try:
        r = subprocess.run(["git"] + args, cwd=ROOT, capture_output=True, text=True, timeout=25)
        return r.stdout if r.returncode == 0 else ""
    except Exception:
        return ""


def file_date(path):
    """дата последнего изменения файла: коммит, а для незакоммиченных правок —
       сегодня (страница уже отдаётся с новым содержимым после пуша)"""
    today = datetime.date.today().isoformat()
    if git_out(["status", "--porcelain", "--", path]).strip():
        return today
    d = git_out(["log", "-1", "--date=short", "--format=%cd", "--", path]).strip()
    return d or today


def lastmod(paths):
    return max(file_date(p) for p in paths)


def build_sitemap():
    shared_dates = [file_date(p) for p in SHARED]
    rows = []
    for group, files in (("", [(f, p) for f, p in PAGES]),
                         ("\n  <!-- русская версия -->", [(ru(f), round(p - 0.1, 1)) for f, p in PAGES])):
        if group:
            rows.append(group)
        for file, prio in files:
            if not os.path.isfile(rel(file)):
                warn("sitemap: нет файла %s — страница пропущена" % file)
                continue
            date = max([file_date(file)] + shared_dates)
            rows.append("  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n"
                        "    <changefreq>monthly</changefreq>\n    <priority>%s</priority>\n  </url>"
                        % (page_url(file), date, prio))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           "<!-- АВТОГЕНЕРАЦИЯ: python scripts/seo.py — руками не править.\n"
           "     Список страниц и приоритеты — в PAGES внутри скрипта; lastmod\n"
           "     считается по датам коммитов страницы и общих источников контента.\n"
           "     Отправляется в Google Search Console / Яндекс.Вебмастер. Русские\n"
           "     версии — отдельные файлы <имя>-ru.html; связь языков объявлена\n"
           "     тегами hreflang в самих страницах. -->\n"
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(rows) + "\n</urlset>\n")
    old = read(SITEMAP) if os.path.isfile(rel(SITEMAP)) else ""
    write(SITEMAP, xml)
    print("written:", SITEMAP, "(без изменений)" if xml == old else "(обновлён)")


# -------------------------------------------------------------------- проверки
def check_pages():
    """мелочи, которые легко забыть при правке страницы руками"""
    try:
        from PIL import Image
    except ImportError:
        Image = None
    files = [f for f, _ in PAGES] + [ru(f) for f, _ in PAGES]
    for file in files:
        if not os.path.isfile(rel(file)):
            continue
        src = read(file)
        for key, prop in (("og:title", True), ("og:description", True), ("og:image", True),
                          ("og:image:alt", True), ("og:image:width", True), ("og:image:height", True),
                          ("twitter:title", False), ("twitter:description", False),
                          ("twitter:image", False), ("twitter:image:alt", False)):
            if meta_content(src, key, prop) is None:
                warn("%s: нет %s" % (file, key))
        img = meta_content(src, "og:image", True)
        if img and Image:
            local = img.replace(SITE + "/", "")
            if os.path.isfile(rel(local)):
                w, h = Image.open(rel(local)).size
                for key, real in (("og:image:width", w), ("og:image:height", h)):
                    got = meta_content(src, key, True)
                    if got and got != str(real):
                        warn("%s: %s=%s, а у файла %s" % (file, key, got, real))
            else:
                warn("%s: og:image ведёт на несуществующий файл %s" % (file, local))
        canon = re.search(r'<link rel="canonical" href="([^"]*)"', src)
        if not canon:
            warn("%s: нет canonical" % file)
        elif not canon.group(1).startswith(SITE):
            warn("%s: canonical на чужом домене — %s" % (file, canon.group(1)))
        for hl in ("en", "ru", "x-default"):
            if 'hreflang="%s"' % hl not in src:
                warn("%s: нет hreflang=%s" % (file, hl))
    # все страницы должны быть в sitemap
    sm = read(SITEMAP) if os.path.isfile(rel(SITEMAP)) else ""
    for file in files:
        if os.path.isfile(rel(file)) and ("<loc>%s</loc>" % page_url(file)) not in sm:
            warn("sitemap: страницы %s нет в карте" % file)


# ----------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description="SEO: sitemap, видео-разметка, проверки")
    ap.add_argument("--offline", action="store_true", help="не ходить в сеть за метаданными YouTube")
    ap.add_argument("--check", action="store_true", help="ничего не писать, только проверки")
    ap.add_argument("--refresh", action="store_true", help="перезабрать метаданные всех роликов")
    a = ap.parse_args()

    if not a.check:
        ids = [v for sid, ids in videos_by_show().items() for v in ids]
        cache = yt_meta(ids, offline=a.offline, refresh=a.refresh)
        build_video_ld(cache)
        build_og_images()
        build_sitemap()
    check_pages()
    print("проверки: %d замечаний" % len(warnings) if warnings else "проверки: всё чисто")
    return 1 if (a.check and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
