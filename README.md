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

- **Тексты, имена, теги, контакты, ссылки на видео** → `assets/js/content.js`.
- **Добавить/заменить фото** → положить оригиналы в `assets/media/<папка>/`
  и пересобрать (см. ниже). `assets/web/` и `media.js` перегенерируются.
- **Дизайн/вёрстка** → `assets/css/site.css` (главная) и `show.css` (страница шоу).

## Пересборка медиа

```bash
# нужны Python + Pillow (фото). Видео (hero/led-hero) жмутся отдельно через ffmpeg.
python scripts/build.py
```
Скрипт ужимает картинки из `assets/media/` в `assets/web/` (1280px, JPEG Q80)
и переписывает `assets/js/media.js`. Правится только `content.js` — не `media.js`.

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
