"""
Steam Show — генератор адаптивных копий фото (responsive images).

Для мобильных: рядом с каждым галерейным `assets/web/<...>/<name>.jpg`
кладём уменьшенную копию `<name>-640.jpg` (длинная сторона ≤ 640) и пишем
манифест `assets/js/srcset.js` (window.SS_SRCSET), из которого responsive.js
навешивает srcset/sizes на ленивые <img> уже после рендера.

Рядом с мелкой копией кладём ещё и `<name>-640.avif` — на фото AVIF даёт
примерно вдвое меньший вес при том же качестве. Браузерам без поддержки AVIF
(старые Safari/iOS) responsive.js отдаёт прежний JPEG, так что ничего не
ломается.

Полный размер тоже дублируем в AVIF (`<name>.avif`). Он нужен не только
лайтбоксу: в srcset это второй кандидат, и браузер берёт именно его на крупных
слотах (обложка шоу, первое фото темы, карточки .world) и на экранах с высокой
плотностью, где мелкой копии не хватает. JPEG остаётся рядом как запасной.

В манифесте на каждый файл — [ширина_мелкой, ширина_оригинала, высота_оригинала,
есть_ли_avif_мелкой, есть_ли_avif_полной]. Высота нужна responsive.js, чтобы
проставить width/height и браузер заранее знал пропорции: иначе масонри-галерея
скачет по мере загрузки.

Уже существующие `-640.jpg` НЕ перезаписываются (иначе каждый запуск давал бы
бинарно другие файлы и раздувал историю git) — из них только читаются размеры.
То же и для обоих AVIF.

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
Q_AVIF_FULL = 58   # полный размер смотрят в лайтбокс во весь экран — чуть щедрее
OUT = "assets/js/srcset.js"


def is_gallery(path):
    p = path.replace("\\", "/")
    b = os.path.basename(p).lower()
    if b.endswith("-640.jpg"):        # уже сгенерированная копия
        return False
    if b.endswith("-poster.jpg"):     # постеры видео
        return False
    if "hero" in p:                   # hero-poster и т.п.
        return False
    # Превью для мессенджеров: Facebook/WhatsApp/Telegram забирают ровно тот
    # адрес, что стоит в og:image, и ни srcset, ни AVIF не понимают. Копии
    # этих файлов — мёртвый вес.
    if "/og/" in p:
        return False
    return True


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    files = sorted(f.replace("\\", "/") for f in glob.glob(WEB + "/**/*.jpg", recursive=True))
    gal = [f for f in files if is_gallery(f)]
    manifest = {}
    made = kept = skipped = avif_made = avif_full_made = 0
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
            # AVIF полного размера: крупные слоты и retina берут из srcset
            # именно его, лайтбокс — тоже
            avf_path = f[:-4] + ".avif"
            has_avf = 1
            if not os.path.exists(avf_path):
                try:
                    im.convert("RGB").save(avf_path, "AVIF", quality=Q_AVIF_FULL)
                    avif_full_made += 1
                except Exception as e:
                    print("  ! avif(full) skip", f, e)
                    has_avf = 0
            # ключ — адрес от корня домена (страницы лежат на разной глубине,
            # относительный путь из /ru/fire-show/ не разрешился бы)
            manifest["/" + f] = [sw, ow, oh, has_av, has_avf]
        except Exception as e:
            print("  ! skip", f, e)
    with open(OUT, "w", encoding="utf-8") as out:
        out.write("/* АВТОГЕНЕРАЦИЯ: python scripts/gen_srcset.py — руками не править.\n")
        out.write("   Карта адаптивных копий: путь ->\n")
        out.write("   [ширина_мелкой, ширина_оригинала, высота_оригинала,\n")
        out.write("    есть_avif_мелкой, есть_avif_полной]. */\n")
        out.write("window.SS_SRCSET = " + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("gallery imgs:", len(gal), " new jpg:", made, " existing:", kept,
          " new avif:", avif_made, " new avif(full):", avif_full_made,
          " skipped(small):", skipped)
    print("written:", OUT)


if __name__ == "__main__":
    main()
