"""
Steam Show — сборка веб-медиа + манифест (единый скрипт).

  Источник:  assets/media/<folder>/*        (оригиналы, в git НЕ коммитятся)
  Результат: assets/web/<key>/<key>-NNN.jpg   (ужатые, коммитятся)
             assets/js/media.js  ->  window.SS_MEDIA  (ТОЛЬКО пути, root-relative)

Один костюм может лежать в нескольких папках-темах — так задаётся
принадлежность к нескольким темам ходулистов. Раздел может собираться из
НЕСКОЛЬКИХ папок-источников (см. STILT_THEMES) — дубли по имени файла
отбрасываются.

Обложка раздела: файл с именем `main.*` в любой из папок-источников идёт
первым (photos[0]). Нет `main` — первым идёт файл по алфавиту.

Весь копирайт (имена, описания, YouTube-ID, контакты) живёт в
assets/js/content.js и здесь НЕ трогается.

Видео (hero, превью шоу, видео тем) оптимизируются отдельно (ffmpeg) и
кладутся в assets/web/. Скрипт лишь подставляет их пути в манифест, если
файлы существуют, и авто-генерит постер темы из её обложки.

Запуск:  python scripts/build.py
"""
import os, json, shutil, subprocess, sys
from PIL import Image, ImageOps

MEDIA = "assets/media"
WEB = "assets/web"
MAXED = 1280          # макс. длинная сторона
SM = 640              # длинная сторона адаптивной мелкой копии (для мобильных)
SM_MIN_LONG = 800     # мельче оригинала — мелкую копию не делаем
Q = 80                # качество JPEG
Q_SM = 78             # качество мелкой копии
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp")

# карта адаптивных копий: web-путь -> [ширина_sm, ширина_оригинала,
# высота_оригинала] -> assets/js/srcset.js (высота нужна, чтобы responsive.js
# проставил width/height и галерея не скакала при загрузке)
SRCSET = {}

# шоу: (id, папка-фото, папка-костюмы|None)
SHOWS = [
    ("dragon",  "dragon",  None),
    ("fire",    "fire",    None),
    ("ledfire", "ledfire", None),
    ("led",     "led",     "led-costumes"),
    ("stilts",  "stilts",  None),
]
# видео-превью шоу (root-relative путь в assets/web); подставляется, если файл есть
SHOW_VIDEO = {
    "dragon":  "assets/web/dragon/dragon-preview.mp4",
    "fire":    "assets/web/fire/fire-preview.mp4",
    "ledfire": "assets/web/ledfire/ledfire-preview.mp4",
    "led":     "assets/web/led/led-hero.mp4",
    "stilts":  "assets/web/stilts/stilts-preview.mp4",
}
# отдельное видео-фон для HERO страницы шоу (если отличается от превью)
SHOW_HERO_VIDEO = {
    "stilts":  "assets/web/stilts/stilts-hero.mp4",
}

# fire — тематические миры: (ключ-вывода, [папки-источники])
# порядок = порядок карточек; имена/блёрбы — в content.js (fire.detail.variants.items, поле key)
FIRE_THEMES = [
    ("fire-rock",      ["fire-rock"]),
    ("fire-fantasy",   ["fire-fantasy"]),
    ("fire-postapoc",  ["fire-postapoc"]),
    ("fire-steampunk", ["fire-steampunk"]),
    ("fire-slavic",    ["fire-slavic"]),
]

# гардероб ходулистов — темы: (ключ-вывода, [папки-источники])
# порядок = порядок показа; имена — в content.js (stilts.themes)
STILT_THEMES = [
    ("stilts-fairy-garden", ["stilts-fairy-garden"]),
    ("stilts-circus",       ["stilts-circus"]),
    ("stilts-pirates",      ["stilts-pirates"]),
    ("stilts-classics",     ["stilts-classics"]),
    ("stilts-trees",        ["stilts-trees"]),
    ("stilts-christmas",    ["stilts-christmas"]),
    ("stilts-shamans",      ["stilts-shamans", "stilts-star-dragons"]),
    ("stilts-star-giraffe", ["stilts-star-giraffe"]),
    ("stilts-led",          ["stilts-led"]),
]
OTHER = "stilts-other"

HERO_VIDEO  = "assets/web/hero/hero.mp4"
HERO_POSTER = "assets/web/hero/hero-poster.jpg"


def _sortkey(name):
    """порядок в папке: чисто-числовые имена первыми по возрастанию
       (1.jpg, 2.jpg, … 10.jpg — обложка = 1.jpg), затем всё остальное по алфавиту.
       main.* обрабатывается отдельно (в _sorted_sources) — уходит в самое начало."""
    base = os.path.splitext(name)[0].lower()
    if base.isdigit():
        return (0, int(base), base)
    return (1, 0, base)


def _sorted_sources(folders):
    """(folder, filename) по всем папкам; дубли по basename отбрасываются.
       Порядок: main.* — первым, затем нумерованные (1,2,…), затем прочие."""
    picked, seen = [], set()
    for folder in folders:
        sp = os.path.join(MEDIA, folder)
        if not os.path.isdir(sp):
            continue
        for f in sorted((x for x in os.listdir(sp)
                         if x.lower().endswith(IMG_EXT) and not x.startswith(".")),
                        key=_sortkey):
            key = f.lower()
            if key in seen:
                continue
            seen.add(key)
            picked.append((folder, f))
    picked.sort(key=lambda t: (0 if os.path.splitext(t[1])[0].lower() == "main" else 1))
    return picked


def optimize(out_key, folders):
    """ужимает media/<folders...>/* -> web/<out_key>/<out_key>-NNN.jpg; root-relative пути"""
    src = _sorted_sources(folders)
    if not src:
        return []
    wp = os.path.join(WEB, out_key)
    os.makedirs(wp, exist_ok=True)
    out = []
    for n, (folder, f) in enumerate(src, 1):
        name = f"{out_key}-{n:03d}.jpg"
        try:
            im = ImageOps.exif_transpose(Image.open(os.path.join(MEDIA, folder, f))).convert("RGB")
            im.thumbnail((MAXED, MAXED), Image.LANCZOS)
            im.save(os.path.join(wp, name), "JPEG", quality=Q, optimize=True, progressive=True)
            web_path = f"{WEB}/{out_key}/{name}"
            out.append(web_path)
            # адаптивная мелкая копия <name>-640.jpg (для мобильных грид-превью)
            ow, oh = im.size
            if max(im.size) > SM_MIN_LONG:
                sm = im.copy()
                sm.thumbnail((SM, SM), Image.LANCZOS)
                sm.save(os.path.join(wp, name[:-4] + "-640.jpg"), "JPEG", quality=Q_SM, optimize=True, progressive=True)
                SRCSET[web_path] = [sm.size[0], ow, oh]
        except Exception as e:
            print("  ! skip", f, e)
    return out


def theme_video(out_key, photos):
    """видео темы = web/<key>/<key>.mp4, если положено вручную. Постер авто из обложки.
       Возвращает (video|None, poster|None)."""
    v = f"{WEB}/{out_key}/{out_key}.mp4"
    if not os.path.isfile(v) or not photos:
        return None, None
    poster = f"{WEB}/{out_key}/{out_key}-poster.jpg"
    try:
        shutil.copyfile(photos[0], poster)     # обложка (photos[0]) -> постер
    except Exception as e:
        print("  ! poster", out_key, e)
        return v, None
    return v, poster


print("optimizing shows...")
shows = {}
for sid, pf, cf in SHOWS:
    photos = optimize(pf, [pf])
    costumes = optimize(cf, [cf]) if cf else []
    entry = {
        "video": SHOW_VIDEO.get(sid) if (sid in SHOW_VIDEO and os.path.isfile(SHOW_VIDEO[sid])) else None,
        "photos": photos,
        "costumes": costumes,
    }
    hv = SHOW_HERO_VIDEO.get(sid)
    if hv and os.path.isfile(hv):
        entry["heroVideo"] = hv
    shows[sid] = entry
    print(f"  {sid:8} photos={len(photos):3} costumes={len(costumes):3}" +
          ("  +hero" if entry.get("heroVideo") else ""))

print("optimizing fire themes...")
fire_themes = []
for out_key, folders in FIRE_THEMES:
    photos = optimize(out_key, folders)
    if not photos:
        continue
    fire_themes.append({"key": out_key, "photos": photos})
    print(f"  theme {out_key:16} {len(photos)}")
shows["fire"]["themes"] = fire_themes

print("optimizing stilt wardrobe...")
themes = []
for out_key, folders in STILT_THEMES:
    photos = optimize(out_key, folders)
    if not photos:
        continue
    v, p = theme_video(out_key, photos)
    themes.append({"key": out_key, "video": v, "poster": p, "photos": photos})
    print(f"  theme {out_key:22} {len(photos)}" + ("  +video" if v else ""))
other = optimize(OTHER, [OTHER])
print(f"  other {OTHER:22} {len(other)}")

data = {
    "hero": {
        "video":  HERO_VIDEO if os.path.isfile(HERO_VIDEO) else None,
        "poster": HERO_POSTER if os.path.isfile(HERO_POSTER) else None,
    },
    "shows": shows,
    "stilts": {"stars": [], "themes": themes, "other": other},
}

# Внутри скрипта пути к медиа — файловые (assets/web/...): по ним читаем и
# копируем файлы. В манифест они уходят адресами от корня домена (/assets/...),
# потому что страницы лежат на разной глубине (/ru/fire-show/) и относительный
# путь из них не разрешился бы.
def as_url(node):
    if isinstance(node, str):
        return "/" + node if node.startswith(WEB) else node
    if isinstance(node, list):
        return [as_url(x) for x in node]
    if isinstance(node, dict):
        # ключи тоже переводим: в манифесте адаптивных копий путь — это ключ
        return {as_url(k): as_url(v) for k, v in node.items()}
    return node


out = "assets/js/media.js"
with open(out, "w", encoding="utf-8") as f:
    f.write("/* АВТОГЕНЕРАЦИЯ: python scripts/build.py — руками не править.\n")
    f.write("   Только пути к медиа (от корня домена). Копирайт/имена/YouTube-ID — в content.js. */\n")
    f.write("window.SS_MEDIA = " + json.dumps(as_url(data), ensure_ascii=False, indent=2) + ";\n")
print("written:", out)

# манифест адаптивных копий (для responsive.js)
srcset_out = "assets/js/srcset.js"
with open(srcset_out, "w", encoding="utf-8") as f:
    f.write("/* АВТОГЕНЕРАЦИЯ: python scripts/build.py (или gen_srcset.py) — руками не править.\n")
    f.write("   Карта адаптивных копий: адрес -> [ширина_мелкой, ширина_оригинала]. */\n")
    f.write("window.SS_SRCSET = " + json.dumps(as_url(SRCSET), ensure_ascii=False, separators=(",", ":")) + ";\n")
print("written:", srcset_out, "(", len(SRCSET), "variants )")

# SEO: карта сайта (lastmod считается сам) + видео-разметка страниц шоу.
# --offline: за метаданными роликов в сеть не ходим, берём кэш scripts/yt-meta.json.
# Новые ролики в content.js — прогнать `python scripts/seo.py` отдельно, с сетью.
print("seo (sitemap + video-ld)...")
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "seo.py"),
                "--offline"], check=False)
