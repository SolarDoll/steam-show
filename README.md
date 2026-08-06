# Steam Show

Статичный промо-сайт шоу-проекта **Steam Show** (огонь · LED · драконы · ходулисты).
Чистый HTML + CSS + vanilla JS, без фреймворков и сборки. Деплой — GitHub Pages.

Live: https://solardoll.github.io/steam-show/

## Структура

```
index.html            — главная (hero, программы, «как работаем», гео, контакты)

dragon-fire-show.html — страницы шоу: по файлу на шоу. Внутри только мета-теги
fire-show.html          (title/description/OG/canonical + JSON-LD) и строка
led-fire-show.html      window.SS_SHOW; всё содержимое рендерит show.js.
led-show.html           Лежат в корне, чтобы относительные пути к assets/
stilt-walkers.html      работали без изменений.

index-ru.html         — русские версии тех же страниц: <имя>-ru.html.
dragon-fire-show-ru.html  Отличаются только мета-тегами (русские
fire-show-ru.html         title/description/OG, свой canonical, JSON-LD
led-fire-show-ru.html     с inLanguage) и строкой window.SS_LANG_FORCE.
led-show-ru.html          Тексты берутся из тех же content.js / i18n.js.
stilt-walkers-ru.html     Лежат в корне (не в /ru/), иначе относительные
                          пути к assets/ пришлось бы переписывать.

show.html             — старый адрес шоу (?show=<id>). Рабочий ради уже
                        разосланных ссылок, но помечен noindex: в поиске
                        участвуют отдельные страницы выше.
404.html              — своя страница «не найдено» (GitHub Pages отдаёт её сам)
robots.txt            — для поисковиков (действует только на своём домене,
                        см. «Деплой»)
sitemap.xml           — карта сайта: главная + 5 страниц шоу. Добавили
                        страницу — дописать <url> руками.
llms.txt              — краткое описание шоу и контактов для AI-поисковиков
site.webmanifest      — иконки и цвета для «добавить на домашний экран»
assets/
  css/
    fonts.css          — self-host шрифты Anton + Manrope
    site.css           — стили главной
    show.css           — стили страницы шоу
  js/
    content.js         — ★ ВЕСЬ КОПИРАЙТ: имена, описания, спеки, теги,
                          YouTube-ID, контакты. Правится руками.
    media.js           — пути к медиа (АВТОГЕНЕРАЦИЯ, не править руками)
    data.js            — сшивает content + media в window.SS + хелперы
    site.js            — поведение главной (рендер рядов, jump-навигация, анимации)
    show.js            — рендер страницы шоу
    lightbox.js        — общий лайтбокс (фото / YouTube / видео)
  img/                 — logo.png, dragon-silhouette.png
  fonts/               — .woff2 (Anton + Manrope)
  web/                 — ужатые фото/видео для сайта (в git)
  media/               — ОРИГИНАЛЫ медиа (вне git, см. .gitignore)
scripts/build.py      — оптимизация media/ → web/ + генерация media.js
```

Единый источник правды о шоу — `assets/js/content.js`. И главная, и страница
шоу читают из `window.SS`, так что данные нигде не дублируются.

## Как редактировать

- **Тексты, имена, теги, контакты, ссылки на видео** → `assets/js/content.js`
  (обе языковые версии рядом: `{ en: '…', ru: '…' }`).
- **Подписи интерфейса и тексты секций главной** → `assets/js/i18n.js`.
- **Добавить/заменить фото** → положить оригиналы в `assets/media/<папка>/`
  и пересобрать (см. ниже). `assets/web/` и `media.js` перегенерируются.
- **Дизайн/вёрстка** → `assets/css/site.css` (главная) и `show.css` (страница шоу).

### Добавить новое шоу

1. Описание — в `content.js` (в том числе `detail.seo` для мета-тегов).
2. Адрес файла — в `PAGES` в `assets/js/data.js`.
3. Два файла страницы: `<имя>.html` и `<имя>-ru.html` (проще скопировать
   соседние и заменить мета-теги, `window.SS_SHOW` и `hreflang`).
4. Оба адреса дописать в `sitemap.xml`.

## Пересборка медиа

```bash
# нужны Python + Pillow (фото). Видео жмутся отдельно через ffmpeg.
python scripts/build.py
```
Скрипт ужимает картинки из `assets/media/` в `assets/web/` (1280px, JPEG Q80)
и переписывает `assets/js/media.js`. Правится только `content.js` — не `media.js`.

Мелкие копии для мобильных (`-640.jpg` + `-640.avif`) и манифест `srcset.js`
делает отдельный скрипт — его можно гонять без полной пересборки:

```bash
python scripts/gen_srcset.py
```

Видео для сайта готовятся вручную. Ориентир для фоновых роликов (проверено
на этом материале — огонь в темноте сжимается тяжело):

```bash
ffmpeg -t 12 -i исходник.mp4 -an -vf "hqdn3d=3:2:6:6,scale=1280:-2,fps=25" \
  -c:v libx264 -preset slow -crf 33 -pix_fmt yuv420p -movflags +faststart out.mp4
```

## Локальный запуск

Сборки нет. Для корректных относительных путей поднять локальный сервер:

```bash
python -m http.server 8000
# http://localhost:8000/index.html
```

## Деплой

Автоматически с ветки `main` (root) на GitHub Pages.

## Правила для AI-ассистентов

См. [AGENTS.md](AGENTS.md) и [CLAUDE.md](CLAUDE.md).
