"""
Steam Show — пре-рендер: текстовая версия страниц прямо в HTML.

ЗАЧЕМ. Содержимое рисует JS уже в браузере: в файлах страниц шоу лежит пустой
<main id="page">, на главной — пустые контейнеры списка шоу, гео, форматов и
контактов. Человеку всё равно, а роботы, которые не выполняют JS (Яндекс, Bing,
краулеры AI-поисковиков), видят пустую страницу и не понимают, о чём она.

Скрипт кладёт в эти контейнеры текстовую версию: заголовок, описание, спеки,
темы, ссылки на ролики и фото, контакты. При загрузке site.js/show.js
перетирают блок настоящей вёрсткой (оба делают innerHTML = ...), так что на
вид не меняется ничего; без JS остаётся читаемая текстовая страница.

ИСТОЧНИК ТЕКСТА — тот же, что у сайта: content.js + i18n.js + media.js, плюс
названия роликов из scripts/yt-meta.json. Расходиться им неоткуда: правится
по-прежнему только content.js, скрипт разносит правку по страницам.

ФОТО — ССЫЛКАМИ, а не <img>: браузер начал бы качать картинки, которые через
миг заменит настоящая галерея со своими srcset-вариантами (мелкие копии и
AVIF), то есть трафик ушёл бы впустую. Роботу ссылки видны так же.

Запуск:
  python scripts/prerender.py            вписать/обновить блоки
  python scripts/prerender.py --check    ничего не писать, только проверить,
                                         что блоки на месте и не устарели
"""
import argparse
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seo import ROOT, SHOW_PAGES, read, write, rel, ru  # общий список страниц

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

CONTENT_JS = "assets/js/content.js"
MEDIA_JS = "assets/js/media.js"
I18N_JS = "assets/js/i18n.js"
YT_CACHE = "scripts/yt-meta.json"

INDEX = "index.html"
PHOTO_LIMIT = 12          # сколько фото перечислять ссылками на страницу шоу
WARDROBE_LIMIT = 6        # сколько костюмов на тему в гардеробе ходулистов


# ------------------------------------------------------- разбор JS-литералов
class JsLiteral:
    """Маленький разборщик объектных литералов JS: одинарные кавычки,
       комментарии, незакавыченные ключи, висящие запятые. Нужен, чтобы читать
       content.js / i18n.js как данные, не дублируя тексты в Python."""

    ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "\\": "\\", "'": "'", '"': '"', "/": "/"}

    def __init__(self, src, i=0):
        self.s = src
        self.i = i

    def skip(self):
        while self.i < len(self.s):
            c = self.s[self.i]
            if c in " \t\r\n":
                self.i += 1
            elif self.s.startswith("/*", self.i):
                j = self.s.find("*/", self.i + 2)
                self.i = len(self.s) if j < 0 else j + 2
            elif self.s.startswith("//", self.i):
                j = self.s.find("\n", self.i)
                self.i = len(self.s) if j < 0 else j + 1
            else:
                return

    def string(self):
        quote = self.s[self.i]
        self.i += 1
        out = []
        while self.i < len(self.s):
            c = self.s[self.i]
            if c == "\\":
                nxt = self.s[self.i + 1]
                if nxt == "u":
                    out.append(chr(int(self.s[self.i + 2:self.i + 6], 16)))
                    self.i += 6
                else:
                    out.append(self.ESCAPES.get(nxt, nxt))
                    self.i += 2
                continue
            if c == quote:
                self.i += 1
                return "".join(out)
            out.append(c)
            self.i += 1
        raise ValueError("строка не закрыта")

    def key(self):
        self.skip()
        if self.s[self.i] in "\"'":
            return self.string()
        j = self.i
        while self.s[self.i] not in " \t\r\n:":
            self.i += 1
        return self.s[j:self.i]

    def value(self):
        self.skip()
        c = self.s[self.i]
        if c == "{":
            return self.obj()
        if c == "[":
            return self.arr()
        if c in "\"'":
            return self.string()
        j = self.i
        while self.i < len(self.s) and self.s[self.i] not in ",}]\r\n":
            self.i += 1
        tok = self.s[j:self.i].strip()
        if tok in ("true", "false", "null"):
            return {"true": True, "false": False, "null": None}[tok]
        try:
            return float(tok) if "." in tok else int(tok)
        except ValueError:
            return tok

    def obj(self):
        self.i += 1
        out = {}
        while True:
            self.skip()
            c = self.s[self.i]
            if c == "}":
                self.i += 1
                return out
            if c == ",":
                self.i += 1
                continue
            k = self.key()
            self.skip()
            self.i += 1                      # двоеточие
            out[k] = self.value()

    def arr(self):
        self.i += 1
        out = []
        while True:
            self.skip()
            c = self.s[self.i]
            if c == "]":
                self.i += 1
                return out
            if c == ",":
                self.i += 1
                continue
            out.append(self.value())


def load_literal(path, anchor):
    src = read(path)
    i = src.find(anchor)
    if i < 0:
        sys.exit("%s: не нашёл '%s'" % (path, anchor))
    return JsLiteral(src, src.index("{", i + len(anchor))).value()


# --------------------------------------------------------------- вспомогалки
def esc(v):
    return html.escape(str(v), quote=True)


def pick(v, lang):
    """{en, ru} -> строка нужного языка; всё остальное — как есть"""
    if isinstance(v, dict) and ("en" in v or "ru" in v):
        return v.get(lang) or v.get("en")
    return v


class Ctx:
    """всё, что нужно для рендера одной страницы: данные + язык"""

    def __init__(self, content, media, dict_, yt, lang):
        self.content = content
        self.media = media
        self.dict = dict_
        self.yt = yt
        self.lang = lang

    def t(self, key, **vars):
        s = pick(self.dict.get(key, key), self.lang)
        for k, v in vars.items():
            s = s.replace("{%s}" % k, str(v))
        return s

    def p(self, v):
        return pick(v, self.lang)


def ul(items):
    return "<ul>" + "".join("<li>%s</li>" % i for i in items) + "</ul>" if items else ""


def photo_links(ctx, photos, label, limit):
    """фото ссылками: адрес виден роботу, лишнего трафика нет"""
    shown = photos[:limit]
    items = ['<a href="%s">%s %d</a>' % (esc(p), esc(label), n)
             for n, p in enumerate(shown, 1)]
    tail = ""
    if len(photos) > len(shown):
        tail = " " + esc(ctx.t("show.shown", n="%d/%d" % (len(shown), len(photos))))
    return "<p>" + " · ".join(items) + tail + "</p>"


# ------------------------------------------------------------- блок страницы
def videos_html(ctx, show, name):
    vids = show.get("videos") or []
    if not vids:
        return ""
    items = []
    for vid in vids:
        meta = ctx.yt.get(vid) or {}
        label = meta.get("title") or "%s — %s" % (name, ctx.t("show.label.video"))
        items.append('<a href="https://www.youtube.com/watch?v=%s">%s</a>'
                     % (esc(vid), esc(label)))
    return ("<h2>%s</h2>" % esc(ctx.t("show.videos"))) + ul(items)


def variants_html(ctx, sid, detail):
    v = detail.get("variants")
    if not v:
        return ""
    # фаер: готовые концепции (у каждой своё название и описание)
    if v.get("kind") == "themes":
        out = ["<h2>%s</h2>" % esc(ctx.p(v["title"])), "<p>%s</p>" % esc(ctx.p(v["lead"]))]
        for item in v.get("items") or []:
            out.append("<h3>%s</h3><p>%s</p>" % (esc(ctx.p(item["h"])), esc(ctx.p(item["p"]))))
        return "".join(out)
    # ходулисты: гардероб — имена тем из content.js, фото к ним из media.js
    # (там themes — список {key, photos}, порядок задаёт пересборка медиа)
    if v.get("kind") == "stilts":
        st = ctx.content["stilts"]
        w = st["wardrobe"]
        by_key = {t["key"]: t.get("photos") or []
                  for t in ((ctx.media.get("stilts") or {}).get("themes") or [])}
        out = ["<h2>%s</h2>" % esc(ctx.p(w["title"])), "<p>%s</p>" % esc(ctx.p(w["lead"]))]
        for key, title in (st.get("themes") or {}).items():
            out.append("<h3>%s</h3>" % esc(ctx.p(title)))
            if by_key.get(key):
                out.append(photo_links(ctx, by_key[key], ctx.t("show.label.costume"), WARDROBE_LIMIT))
        return "".join(out)
    return ""


def addon_html(ctx, detail):
    a = detail.get("addon")
    if not a:
        return ""
    tags = [esc(ctx.p(t)) for t in a.get("tags") or []]
    return ("<h2>%s</h2><p>%s</p>" % (esc(ctx.p(a["title"])), esc(ctx.p(a["text"])))
            + ("<p>%s</p>" % " · ".join(tags) if tags else ""))


def contacts_html(ctx):
    rows = []
    for c in ctx.content["contact"]:
        label = esc(ctx.p(c["kicker"]))
        value = esc(c["value"])
        if c.get("href"):
            rows.append('%s: <a href="%s">%s</a>' % (label, esc(c["href"]), value))
            continue
        acts = " · ".join('<a href="%s">%s</a>' % (esc(a["href"]), esc(ctx.p(a["aria"])))
                          for a in c.get("actions") or [])
        rows.append("%s: %s%s" % (label, value, (" (" + acts + ")") if acts else ""))
    return ul(rows)


def show_block(ctx, sid, file):
    show = ctx.content["shows"][sid]
    detail = show["detail"]
    name = ctx.p(show["name"])
    specs = [
        (ctx.t("show.durationStilts" if sid == "stilts" else "show.duration"), ctx.p(detail["duration"])),
        (ctx.t("show.format"), ctx.p(detail["format"])),
        (ctx.t("show.cast"), ctx.p(detail["cast"])),
    ]
    chips = [esc(ctx.p(c)) for c in detail.get("chips") or []]
    photos = ((ctx.media.get("shows") or {}).get(sid) or {}).get("photos") or []

    out = ['<h1>%s</h1>' % esc(name), "<p>%s</p>" % esc(ctx.p(detail["desc"]))]
    out.append(ul(["<b>%s:</b> %s" % (esc(k), esc(v)) for k, v in specs]))
    if chips:
        out.append("<p>%s</p>" % " · ".join(chips))
    out.append(videos_html(ctx, show, name))
    if photos:
        out.append("<h2>%s</h2>" % esc(ctx.t("show.photos")))
        out.append(photo_links(ctx, photos, ctx.t("show.label.photo"), PHOTO_LIMIT))
    out.append(variants_html(ctx, sid, detail))
    out.append(addon_html(ctx, detail))
    out.append("<h2>%s</h2>" % esc(ctx.t("show.bookKicker")))
    out.append("<p>%s</p>" % esc(ctx.t("show.bookLead", name=name)))
    out.append(contacts_html(ctx))
    return '<div class="prerender">' + "".join(x for x in out if x) + "</div>"


# ------------------------------------------------------------ блоки главной
def index_blocks(ctx):
    """четыре пустых контейнера главной: список шоу, страны, форматы, контакты"""
    rows = []
    for sid in ctx.content["order"]:
        show = ctx.content["shows"][sid]
        card = show["card"]
        rows.append('<a href="%s">%s</a> — %s'
                    % (esc(PAGE_OF[sid] if ctx.lang == "en" else ru(PAGE_OF[sid])),
                       esc(ctx.p(show["name"])), esc(ctx.p(card["desc"]))))
    shows = '<div class="prerender">%s</div>' % ul(rows)

    geo = '<div class="prerender"><p>%s%s</p></div>' % (
        " · ".join(esc(c) for c in ctx.p(ctx.dict["world.countries"])),
        " " + esc(ctx.p(ctx.dict["world.geo.more"])))
    fmt = '<div class="prerender"><p>%s</p></div>' % (
        " · ".join(esc(f) for f in ctx.p(ctx.dict["world.formats"])))
    contacts = '<div class="prerender">%s</div>' % contacts_html(ctx)
    return {"progList": shows, "geoList": geo, "fmtList": fmt, "contactGrid": contacts}


PAGE_OF = {sid: file for sid, file in SHOW_PAGES}


# -------------------------------------------------------------- вписывание
def markers(key):
    return ("<!-- PRERENDER:%s:start — автогенерация: python scripts/prerender.py. "
            "Руками не править. Текст правится в content.js / i18n.js. -->" % key,
            "<!-- PRERENDER:%s:end -->" % key)


def inject(file, tag, elem_id, block, check=False):
    """вписать блок внутрь пустого контейнера или обновить уже вписанный"""
    src = read(file)
    start, end = markers(elem_id)
    body = start + "\n" + block + "\n" + end
    if start in src and end in src:
        out = re.sub(re.escape(start) + r".*?" + re.escape(end), lambda _m: body, src, flags=re.S)
    else:
        pat = re.compile(r'(<%s[^>]*id="%s"[^>]*>)\s*</%s>' % (tag, elem_id, tag))
        if not pat.search(src):
            print("  ! %s: не нашёл пустой <%s id=\"%s\">" % (file, tag, elem_id))
            return None
        out = pat.sub(lambda m: m.group(1) + "\n" + body + "\n</%s>" % tag, src, count=1)
    if out == src:
        return False
    if not check:
        write(file, out)
    return True


def main():
    ap = argparse.ArgumentParser(description="пре-рендер текстовой версии страниц")
    ap.add_argument("--check", action="store_true", help="ничего не писать, только проверить")
    a = ap.parse_args()

    content = load_literal(CONTENT_JS, "window.SS_CONTENT")
    media = load_literal(MEDIA_JS, "window.SS_MEDIA")
    dict_ = load_literal(I18N_JS, "var DICT")
    yt = json.loads(read(YT_CACHE)) if os.path.isfile(rel(YT_CACHE)) else {}

    stale, written = [], 0
    for lang in ("en", "ru"):
        ctx = Ctx(content, media, dict_, yt, lang)
        for sid, en_file in SHOW_PAGES:
            file = en_file if lang == "en" else ru(en_file)
            if not os.path.isfile(rel(file)):
                continue
            r = inject(file, "main", "page", show_block(ctx, sid, file), check=a.check)
            if r:
                written += 1
                if a.check:
                    stale.append(file)
                else:
                    print("  prerender %-26s %s" % (file, lang))
        index = INDEX if lang == "en" else ru(INDEX)
        if os.path.isfile(rel(index)):
            for elem_id, block in index_blocks(ctx).items():
                r = inject(index, "div", elem_id, block, check=a.check)
                if r:
                    written += 1
                    if a.check:
                        stale.append("%s #%s" % (index, elem_id))
                    else:
                        print("  prerender %-26s #%s" % (index, elem_id))

    if a.check:
        for s in sorted(set(stale)):
            print("  ! устарело или отсутствует: %s" % s)
        print("проверка: всё свежее" if not stale else "проверка: %d блоков надо пересобрать" % len(stale))
        return 1 if stale else 0
    print("prerender: обновлено блоков —", written)
    return 0


if __name__ == "__main__":
    sys.exit(main())
