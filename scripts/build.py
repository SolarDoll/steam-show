"""
Steam Show — сборка веб-медиа + манифест (единый скрипт).

  Источник:  assets/media/<folder>/*        (оригиналы, в git НЕ коммитятся)
  Результат: assets/web/<folder>/<folder>-NNN.jpg   (ужатые, коммитятся)
             assets/js/media.js  ->  window.SS_MEDIA  (ТОЛЬКО пути, root-relative)

Один костюм может лежать в нескольких папках-темах — так задаётся
принадлежность к нескольким темам ходулистов.

Весь копирайт (имена, описания, YouTube-ID, контакты) живёт в
assets/js/content.js и здесь НЕ трогается.

Видео (hero.mp4, led-hero.mp4) оптимизируются отдельно (ffmpeg) и здесь
не перекодируются — скрипт лишь подставляет их пути в манифест, если файлы
существуют в assets/web/.

Запуск:  python scripts/build.py
"""
import os, json
from PIL import Image, ImageOps

MEDIA = "assets/media"
WEB = "assets/web"
MAXED = 1280          # макс. длинная сторона (было 1500)
Q = 80                # качество JPEG
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp")

# шоу: (id, папка-фото, папка-костюмы|None)
SHOWS = [
    ("dragon",  "dragon",  None),
    ("fire",    "fire",    None),
    ("ledfire", "ledfire", None),
    ("led",     "led",     "led-costumes"),
    ("stilts",  "stilts",  None),
]
# видео шоу (root-relative путь в assets/web); подставляется, если файл есть
SHOW_VIDEO = {"led": "assets/web/led/led-hero.mp4"}

# гардероб ходулистов (порядок = порядок показа); имена/блёрбы — в content.js
STARS  = ["stilts-star-dragons", "stilts-star-giraffe", "stilts-star-trees"]
THEMES = ["stilts-fairy-garden", "stilts-circus", "stilts-pirates", "stilts-classics",
          "stilts-trees", "stilts-christmas", "stilts-shamans", "stilts-led"]
OTHER  = "stilts-other"

HERO_VIDEO  = "assets/web/hero/hero.mp4"
HERO_POSTER = "assets/web/hero/hero-poster.jpg"


def optimize(folder):
    """ужимает media/<folder>/* -> web/<folder>/<folder>-NNN.jpg; возвращает root-relative пути"""
    sp = os.path.join(MEDIA, folder)
    if not os.path.isdir(sp):
        return []
    files = sorted(f for f in os.listdir(sp)
                   if f.lower().endswith(IMG_EXT) and not f.startswith("."))
    wp = os.path.join(WEB, folder)
    os.makedirs(wp, exist_ok=True)
    out = []
    for n, f in enumerate(files, 1):
        name = f"{folder}-{n:03d}.jpg"
        try:
            im = ImageOps.exif_transpose(Image.open(os.path.join(sp, f))).convert("RGB")
            im.thumbnail((MAXED, MAXED), Image.LANCZOS)
            im.save(os.path.join(wp, name), "JPEG", quality=Q, optimize=True, progressive=True)
            out.append(f"{WEB}/{folder}/{name}")
        except Exception as e:
            print("  ! skip", f, e)
    return out


def theme_video(folder):
    """путь к <folder>.mp4/-poster.jpg в web, если оба существуют (иначе None, None)"""
    v = f"{WEB}/{folder}/{folder}.mp4"
    p = f"{WEB}/{folder}/{folder}-poster.jpg"
    if os.path.isfile(v) and os.path.isfile(p):
        return v, p
    return None, None


print("optimizing shows...")
shows = {}
for sid, pf, cf in SHOWS:
    photos = optimize(pf)
    costumes = optimize(cf) if cf else []
    shows[sid] = {
        "video": SHOW_VIDEO.get(sid) if (sid in SHOW_VIDEO and os.path.isfile(SHOW_VIDEO[sid])) else None,
        "photos": photos,
        "costumes": costumes,
    }
    print(f"  {sid:8} photos={len(photos):3} costumes={len(costumes):3}")

print("optimizing stilt wardrobe...")
stars = []
for folder in STARS:
    photos = optimize(folder)
    if photos:
        stars.append({"key": folder, "photos": photos})
        print(f"  star  {folder:22} {len(photos)}")
themes = []
for folder in THEMES:
    photos = optimize(folder)
    if not photos:
        continue
    v, p = theme_video(folder)
    themes.append({"key": folder, "video": v, "poster": p, "photos": photos})
    print(f"  theme {folder:22} {len(photos)}" + ("  +video" if v else ""))
other = optimize(OTHER)
print(f"  other {OTHER:22} {len(other)}")

data = {
    "hero": {
        "video":  HERO_VIDEO if os.path.isfile(HERO_VIDEO) else None,
        "poster": HERO_POSTER if os.path.isfile(HERO_POSTER) else None,
    },
    "shows": shows,
    "stilts": {"stars": stars, "themes": themes, "other": other},
}

out = "assets/js/media.js"
with open(out, "w", encoding="utf-8") as f:
    f.write("/* АВТОГЕНЕРАЦИЯ: python scripts/build.py — руками не править.\n")
    f.write("   Только пути к медиа. Весь копирайт/имена/YouTube-ID — в content.js. */\n")
    f.write("window.SS_MEDIA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
print("written:", out)
