# Steam Show

Статичный промо-сайт шоу-проекта **Steam Show** (огонь · LED · драконы · ходулисты).
Чистый HTML + CSS + vanilla JS, без фреймворков и сборки. Деплой — GitHub Pages.

Live: https://steamshow.art/

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
CNAME                 — свой домен steamshow.art. Файл читает GitHub Pages,
                        удалить = вернуться на адрес *.github.io
robots.txt            — для поисковиков
sitemap.xml           — карта сайта (АВТОГЕНЕРАЦИЯ: scripts/seo.py, не править
                        руками) — главная + 5 страниц шоу × два языка
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
scripts/seo.py        — sitemap (lastmod сам), видео-разметка страниц шоу,
                        проверки мета-тегов. Вызывается из build.py.
scripts/yt-meta.json  — кэш метаданных роликов с YouTube (название, дата
                        загрузки, длительность, превью). Заполняет seo.py.
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
   Не забыть блок `.morelinks` внизу — там ссылки на соседние шоу.
4. Дописать страницу в `PAGES` и `SHOW_PAGES` в `scripts/seo.py`
   (и кадр для превью ссылки в `OG_IMAGES`). Остальное скрипт сделает сам —
   при деплое или по `python scripts/seo.py`: карта сайта, видео-разметка,
   превью 1200×630 и список недостающих мета-тегов.

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

## SEO-обвязка

```bash
python scripts/seo.py             # sitemap + видео-разметка (метаданные роликов из сети)
python scripts/seo.py --check     # ничего не пишет, только проверки
python scripts/seo.py --refresh   # перезабрать метаданные всех роликов заново
```

Что делает скрипт (`scripts/seo.py`):

- **`sitemap.xml`** пересобирает целиком. `lastmod` считается сам: дата
  последнего коммита страницы и общих источников контента (`content.js`,
  `media.js`), а для незакоммиченных правок — сегодняшняя. Руками не править;
  список страниц и приоритеты — в `PAGES` внутри скрипта.
- **`VideoObject`** — в каждую страницу шоу вписывает `ItemList` из
  `VideoObject` по её роликам (ID берутся из `content.js`) между маркерами
  `VIDEO-LD:start/end`. Название, дата загрузки, длительность и превью —
  настоящие, с YouTube; кэш в `scripts/yt-meta.json` (в git, чтобы сборка
  работала без сети). Заменили ролики в `content.js` — прогнать с сетью.
- **Превью ссылки** — собирает `assets/web/og/<шоу>.jpg` 1200×630 из кадра
  галереи (мессенджеры показывают вертикальную картинку узкой полосой).
  Какой кадр берём — таблица `OG_IMAGES` внутри скрипта.
- **Проверки** — `og:image` совпадает с реальным размером файла, на месте
  `og:image:alt`, `twitter:title/description`, `hreflang`, canonical на своём
  домене, все страницы есть в карте сайта.

Запускать вручную не обязательно: тот же скрипт прогоняется при каждом деплое
(шаг «SEO» в `.github/workflows/pages.yml`), так что карта сайта и видео-разметка
на сайте свежие всегда. Локальный прогон нужен, только если хочется увидеть
результат в репозитории до пуша (og-картинки собираются лишь локально —
в CI нет Pillow).

Что остаётся руками (в самих `.html`): `title`, `description`, OG/Twitter,
`og:image:alt`, JSON-LD шоу и блок перелинковки `.morelinks` внизу страницы.
Русские страницы — с локальной привязкой (`areaServed` Минск/Беларусь,
`address`), английские — нейтрально по миру, происхождение не светим.

## Локальный запуск

Сборки нет. Для корректных относительных путей поднять локальный сервер:

```bash
python -m http.server 8000
# http://localhost:8000/index.html
```

## Деплой

Автоматически с ветки `main` (root) на GitHub Pages.

Домен — `steamshow.art` (регистратор Porkbun), подключён файлом `CNAME`.
DNS: четыре A и четыре AAAA записи на IP GitHub Pages для корня домена плюс
CNAME `www` → `solardoll.github.io` (GitHub сам редиректит www на корень).
Старый адрес `solardoll.github.io/steam-show/` редиректится на домен, но все
абсолютные ссылки (canonical, hreflang, OG, JSON-LD, sitemap, robots, llms)
уже переписаны на `https://steamshow.art/` — при смене домена искать по нему.

## Правила для AI-ассистентов

См. [AGENTS.md](AGENTS.md) и [CLAUDE.md](CLAUDE.md).
