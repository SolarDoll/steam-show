"""
Оптимизирует медиа для веба и собирает манифест.
  Источник:  assets/media/<folder>/*   (оригиналы, в git НЕ коммитятся)
  Результат: assets/web/<folder>/<folder>-NNN.jpg  (ужатые, коммитятся)
             assets/web/hero/hero.mp4 + hero-poster.jpg
             _designs3/media.js  (window.SS_DATA -> ../assets/web/...)
Запуск: python scripts/build_media.py
"""
import os, json, subprocess
from PIL import Image, ImageOps

SRC = "assets/media"
WEB = "assets/web"
REL = "../assets/web"
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".JPG", ".JPEG", ".PNG")
MAXED = 1500      # макс. длинная сторона
Q = 80

YT = {
    "dragon": ["95Zx38TO_5Q"],
    "fire":   ["kUXyXDO6O7I", "5kWySEToST0", "Q4SIaQwPHLs"],
    "ledfire":["aq-PXZIlsyo", "NwEsu64rFzY"],
    "led":    ["v3MyA-lNGok", "U4-_8da2uuI", "Ain3sUrpU2w"],
    "stilts": ["epn4YnmNrQ8", "wogKA0crrt0"],
}
REEL = "a_CLhJkdnGg"
SHOW_FOLDERS = {
    "dragon":  {"photos": "dragon",  "costumes": None},
    "fire":    {"photos": "fire",    "costumes": None},
    "ledfire": {"photos": "ledfire", "costumes": None},
    "led":     {"photos": "led",     "costumes": "led-costumes"},
    "stilts":  {"photos": "stilts",  "costumes": "stilt-costumes"},
}

def optimize_folder(folder):
    """ужимает все картинки из SRC/folder -> WEB/folder, возвращает список web-путей"""
    sp = os.path.join(SRC, folder)
    if not os.path.isdir(sp):
        return []
    files = sorted(f for f in os.listdir(sp) if f.endswith(IMG_EXT) and not f.startswith("."))
    wp = os.path.join(WEB, folder)
    os.makedirs(wp, exist_ok=True)
    out = []
    n = 0
    for f in files:
        n += 1
        name = f"{folder}-{n:03d}.jpg"
        dst = os.path.join(wp, name)
        try:
            im = Image.open(os.path.join(sp, f))
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((MAXED, MAXED), Image.LANCZOS)
            im.save(dst, "JPEG", quality=Q, optimize=True, progressive=True)
            out.append(REL + "/" + folder + "/" + name)
        except Exception as e:
            print("  ! skip", f, e)
    return out

def build_video():
    sp = os.path.join(SRC, "hero")
    if not os.path.isdir(sp):
        return ""
    src = next((os.path.join(sp, f) for f in sorted(os.listdir(sp)) if f.lower().endswith(".mp4")), None)
    if not src:
        return ""
    wp = os.path.join(WEB, "hero")
    os.makedirs(wp, exist_ok=True)
    out = os.path.join(wp, "hero.mp4")
    poster = os.path.join(wp, "hero-poster.jpg")
    subprocess.run(["ffmpeg","-y","-i",src,"-vf","scale='min(1280,iw)':-2",
                    "-c:v","libx264","-crf","30","-preset","veryfast","-an","-movflags","+faststart",out],
                   check=True, capture_output=True)
    subprocess.run(["ffmpeg","-y","-ss","00:00:01","-i",src,"-vframes","1","-q:v","4",
                    "-vf","scale='min(1280,iw)':-2",poster], check=True, capture_output=True)
    return REL + "/hero/hero.mp4"

print("optimizing photos...")
shows = {}
for sid, fol in SHOW_FOLDERS.items():
    photos = optimize_folder(fol["photos"]) if fol["photos"] else []
    costumes = optimize_folder(fol["costumes"]) if fol["costumes"] else []
    shows[sid] = {"photos": photos, "costumes": costumes, "videos": YT.get(sid, [])}
    print(f"  {sid:8} photos={len(photos):3} costumes={len(costumes):3} videos={len(shows[sid]['videos'])}")

print("compressing hero video...")
hero = build_video()
print("  hero:", hero or "—")

data = {"shows": shows, "hero": hero, "heroPoster": (REL+"/hero/hero-poster.jpg") if hero else "", "reel": REEL}
out = "_designs3/media.js"
with open(out, "w", encoding="utf-8") as f:
    f.write("/* автогенерация: python scripts/build_media.py — не править руками */\n")
    f.write("window.SS_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
print("written:", out)
