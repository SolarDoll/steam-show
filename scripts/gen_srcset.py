"""
Steam Show — генератор адаптивных копий фото (responsive images).

Для мобильных: рядом с каждым галерейным `assets/web/<...>/<name>.jpg`
кладём уменьшенную копию `<name>-640.jpg` (длинная сторона ≤ 640) и пишем
манифест `assets/js/srcset.js` (window.SS_SRCSET), из которого responsive.js
навешивает srcset/sizes на ленивые <img> уже после рендера.

В манифесте на каждый файл — [ширина_мелкой, ширина_оригинала, высота_оригинала].
Высота нужна responsive.js, чтобы проставить width/height и браузер заранее
знал пропорции: иначе масонри-галерея скачет по мере загрузки картинок.

Уже существующие `-640.jpg` НЕ перезаписываются (иначе каждый запуск давал бы
бинарно другие файлы и раздувал историю git) — из них только читаются размеры.

Запуск НЕЗАВИСИМ от build.py: читает уже оптимизированные web-джейпеги
(исходники assets/media в git не коммитятся), поэтому его можно гонять
всегда. build.py делает то же самое при полной пересборке из исходников.

  python scripts/gen_srcset.py
"""
import os, glob, json
from PIL import Image

WEB = "assets/web"
SM = 640            # длинная сторона мелкой копии
ONLY_IF_LONG_OVER = 800   # мельче — не трогаем (уже маленькие)
Q = 78
OUT = "assets/js/srcset.js"


def is_gallery(path):
    b = os.path.basename(path).lower()
    if b.endswith("-640.jpg"):        # уже сгенерированная копия
        return False
    if b.endswith("-poster.jpg"):     # постеры видео
        return False
    if "hero" in path.replace("\\", "/"):  # hero-poster и т.п.
        return False
    return True


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    files = sorted(f.replace("\\", "/") for f in glob.glob(WEB + "/**/*.jpg", recursive=True))
    gal = [f for f in files if is_gallery(f)]
    manifest = {}
    made = kept = skipped = 0
    for f in gal:
        try:
            im = Image.open(f)
            ow, oh = im.size
            if max(ow, oh) <= ONLY_IF_LONG_OVER:
                skipped += 1
                continue
            sm_path = f[:-4] + "-640.jpg"
            if os.path.exists(sm_path):
                sw = Image.open(sm_path).size[0]     # готова — не трогаем
                kept += 1
            else:
                sm = im.convert("RGB")
                sm.thumbnail((SM, SM), Image.LANCZOS)
                sw = sm.size[0]
                sm.save(sm_path, "JPEG", quality=Q, optimize=True, progressive=True)
                made += 1
            manifest[f] = [sw, ow, oh]
        except Exception as e:
            print("  ! skip", f, e)
    with open(OUT, "w", encoding="utf-8") as out:
        out.write("/* АВТОГЕНЕРАЦИЯ: python scripts/gen_srcset.py — руками не править.\n")
        out.write("   Карта адаптивных копий: путь ->\n")
        out.write("   [ширина_мелкой, ширина_оригинала, высота_оригинала]. */\n")
        out.write("window.SS_SRCSET = " + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("gallery imgs:", len(gal), " new variants:", made, " existing:", kept, " skipped(small):", skipped)
    print("written:", OUT)


if __name__ == "__main__":
    main()
