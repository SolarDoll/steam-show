"""
Steam Show — генератор адаптивных копий фото (responsive images).

Для мобильных: рядом с каждым галерейным `assets/web/<...>/<name>.jpg`
кладём уменьшенную копию `<name>-640.jpg` (длинная сторона ≤ 640) и пишем
манифест `assets/js/srcset.js` (window.SS_SRCSET), из которого responsive.js
навешивает srcset/sizes на ленивые <img> уже после рендера.

Рядом с мелкой копией кладём ещё и `<name>-640.avif` — на фото AVIF даёт
примерно вдвое меньший вес при том же качестве. Браузерам без поддержки AVIF
(старые Safari/iOS) responsive.js отдаёт прежний JPEG, так что ничего не
ломается. Полноразмерные копии остаются JPEG: они нужны только в лайтбоксе,
по клику, и не влияют на вес страницы.

В манифесте на каждый файл — [ширина_мелкой, ширина_оригинала, высота_оригинала,
есть_ли_avif]. Высота нужна responsive.js, чтобы проставить width/height и
браузер заранее знал пропорции: иначе масонри-галерея скачет по мере загрузки.

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
Q_AVIF = 55        # AVIF: на фото при 55 вес примерно вдвое ниже JPEG
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
    made = kept = skipped = avif_made = 0
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
            # AVIF-вариант мелкой копии (вдвое легче JPEG на фото)
            av_path = f[:-4] + "-640.avif"
            has_av = 1
            if not os.path.exists(av_path):
                try:
                    av = Image.open(sm_path).convert("RGB")
                    av.save(av_path, "AVIF", quality=Q_AVIF)
                    avif_made += 1
                except Exception as e:
                    print("  ! avif skip", f, e)
                    has_av = 0
            manifest[f] = [sw, ow, oh, has_av]
        except Exception as e:
            print("  ! skip", f, e)
    with open(OUT, "w", encoding="utf-8") as out:
        out.write("/* АВТОГЕНЕРАЦИЯ: python scripts/gen_srcset.py — руками не править.\n")
        out.write("   Карта адаптивных копий: путь ->\n")
        out.write("   [ширина_мелкой, ширина_оригинала, высота_оригинала, есть_avif]. */\n")
        out.write("window.SS_SRCSET = " + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("gallery imgs:", len(gal), " new jpg:", made, " existing:", kept,
          " new avif:", avif_made, " skipped(small):", skipped)
    print("written:", OUT)


if __name__ == "__main__":
    main()
