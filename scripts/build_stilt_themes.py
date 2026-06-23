"""
Собирает тематические разделы ХОДУЛИСТОВ из папок-тем (folders = themes).
  Источник:  assets/media/stilts-<theme>/*        (оригиналы, в git НЕ коммитятся)
  Результат: assets/web/stilts-<theme>/stilts-<theme>-NNN.jpg  (ужатые, коммитятся)
             assets/web/stilts-<theme>/stilts-<theme>.mp4 + -poster.jpg  (если в папке есть mp4)
             _pitch5/media-stilts.js  ->  window.SS_STILTS

Один костюм может лежать в нескольких папках-темах — так задаётся принадлежность к нескольким темам.
Запуск:  python scripts/build_stilt_themes.py

⚙️  Имя темы шаманов меняется в SHAMANS_NAME ниже.
"""
import os, json, subprocess
from PIL import Image, ImageOps

SRC = "assets/media"
WEB = "assets/web"
REL = "../assets/web"
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".JPG", ".JPEG", ".PNG")
MAXED = 1500
Q = 80

SHAMANS_NAME = "Shamans"   # ← поменяй при желании: "Spirits & Shamans" / "Dark Fantasy" / "Ritual"

# звёзды-гиганты (фишечные костюмы) — порядок = порядок показа
STARS = [
    ("stilts-star-dragons", "Dragons", "Towering dragons on stilts — our signature giants. A guaranteed showstopper."),
    ("stilts-star-giraffe", "Giraffe", "A friendly 4-metre giraffe that roams the crowd. Kids and cameras love it."),
    ("stilts-star-trees",   "Trees",   "Living walking trees — ethereal, photogenic and great for nature themes."),
]
# темы костюмов — порядок = порядок показа
THEMES = [
    ("stilts-fairy-garden", "Fairy Garden"),
    ("stilts-circus",       "Circus"),
    ("stilts-pirates",      "Pirates"),
    ("stilts-classics",     "Classics"),
    ("stilts-trees",        "Trees"),
    ("stilts-christmas",    "Christmas"),
    ("stilts-shamans",      SHAMANS_NAME),
    ("stilts-led",          "LED on stilts"),
]
OTHER = ("stilts-other", "More characters")


def optimize_folder(folder):
    sp = os.path.join(SRC, folder)
    if not os.path.isdir(sp):
        return []
    files = sorted(f for f in os.listdir(sp) if f.endswith(IMG_EXT) and not f.startswith("."))
    wp = os.path.join(WEB, folder)
    os.makedirs(wp, exist_ok=True)
    out, n = [], 0
    for f in files:
        n += 1
        name = f"{folder}-{n:03d}.jpg"
        try:
            im = Image.open(os.path.join(sp, f))
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((MAXED, MAXED), Image.LANCZOS)
            im.save(os.path.join(wp, name), "JPEG", quality=Q, optimize=True, progressive=True)
            out.append(f"{REL}/{folder}/{name}")
        except Exception as e:
            print("  ! skip", f, e)
    return out


def build_theme_video(folder):
    """если в папке есть mp4 — ужимает его как главное видео темы, возвращает (video, poster) или (None, None)"""
    sp = os.path.join(SRC, folder)
    if not os.path.isdir(sp):
        return None, None
    src = next((os.path.join(sp, f) for f in sorted(os.listdir(sp)) if f.lower().endswith(".mp4")), None)
    if not src:
        return None, None
    wp = os.path.join(WEB, folder)
    os.makedirs(wp, exist_ok=True)
    out = os.path.join(wp, f"{folder}.mp4")
    poster = os.path.join(wp, f"{folder}-poster.jpg")
    try:
        subprocess.run(["ffmpeg", "-y", "-i", src, "-vf", "scale='min(1280,iw)':-2",
                        "-c:v", "libx264", "-crf", "28", "-preset", "veryfast",
                        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out],
                       check=True, capture_output=True)
        subprocess.run(["ffmpeg", "-y", "-ss", "00:00:01", "-i", src, "-vframes", "1",
                        "-q:v", "4", "-vf", "scale='min(1280,iw)':-2", poster],
                       check=True, capture_output=True)
        return f"{REL}/{folder}/{folder}.mp4", f"{REL}/{folder}/{folder}-poster.jpg"
    except Exception as e:
        print("  ! video skip", folder, e)
        return None, None


print("stilt themes — optimizing...")

stars = []
for folder, name, blurb in STARS:
    photos = optimize_folder(folder)
    if photos:
        stars.append({"key": folder, "name": name, "blurb": blurb, "photos": photos})
        print(f"  star  {name:14} {len(photos)} photos")

themes = []
for folder, name in THEMES:
    photos = optimize_folder(folder)
    if not photos:
        continue
    video, poster = build_theme_video(folder)
    themes.append({"key": folder, "name": name, "photos": photos, "video": video, "poster": poster})
    print(f"  theme {name:14} {len(photos)} photos" + ("  + video" if video else ""))

other = optimize_folder(OTHER[0])
if other:
    print(f"  other {OTHER[1]:14} {len(other)} photos")

data = {"stars": stars, "themes": themes, "other": other}
out = "_pitch5/media-stilts.js"
with open(out, "w", encoding="utf-8") as f:
    f.write("/* автогенерация: python scripts/build_stilt_themes.py — не править руками */\n")
    f.write("window.SS_STILTS = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
print("written:", out)
