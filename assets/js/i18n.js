/* ============================================================
   STEAM SHOW — i18n.js (локализация EN / RU)
   ЗАГРУЖАТЬ ПЕРВЫМ, до content.js / data.js / site.js / show.js.

   Что делает:
   • определяет язык: ?lang= → localStorage → 'en';
   • отдаёт window.SS_LANG и хелперы window.PICK() / window.T();
   • подставляет UI-микрокопирайт в статику по [data-i18n*];
   • строит и обслуживает переключатель языка EN|RU (перезагрузкой).

   EN — база (мировой рынок). RU — локальный акцент (Минск, РБ;
   упор на форматы мероприятий). Контент шоу — в content.js
   ({en,ru}); здесь только интерфейс и тексты секций главной.
   ============================================================ */
(function () {
  var STORE = 'ss_lang', SUPPORTED = ['en', 'ru'], DEFAULT = 'en';

  /* ---- определить язык ----
     Приоритет: ?lang= (явное намерение, поддержка старых ссылок) →
     язык самой страницы (window.SS_LANG_FORCE проставлен в каждом файле:
     русские версии лежат под /ru/) → запомненный выбор → EN.
     Язык страницы важнее запомненного: иначе на английский адрес лёг бы
     русский текст, и страница разошлась бы со своими мета-тегами. */
  var qs, urlLang = null;
  try { qs = new URLSearchParams(location.search); urlLang = qs.get('lang'); } catch (e) {}
  var pageLang = window.SS_LANG_FORCE;
  var stored = null; try { stored = localStorage.getItem(STORE); } catch (e) {}
  var lang = DEFAULT;
  if (urlLang && SUPPORTED.indexOf(urlLang) >= 0) { lang = urlLang; try { localStorage.setItem(STORE, lang); } catch (e) {} }
  else if (pageLang && SUPPORTED.indexOf(pageLang) >= 0) { lang = pageLang; }
  else if (stored && SUPPORTED.indexOf(stored) >= 0) { lang = stored; }

  window.SS_LANG = lang;
  document.documentElement.setAttribute('lang', lang);

  /* ---- хелперы ---- */
  function pick(v) {
    if (v && typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'ru' in v)) {
      return v[lang] != null ? v[lang] : v.en;
    }
    return v;
  }
  window.PICK = pick;

  /* ============================================================
     СЛОВАРЬ UI (микрокопирайт интерфейса + тексты секций главной)
     Плейсхолдеры {n}, {name} подставляются через T(key, {...}).
     ============================================================ */
  var DICT = {
    /* -- мета/SEO -- */
    'meta.title':   { en: 'Steam Show · Fire, LED & Dragon Performances Worldwide',
                      ru: 'Заказать фаер-шоу и световое шоу в Минске — Steam Show' },
    'meta.desc':    { en: 'Steam Show · large-scale fire, LED and stilt-walking performances for festivals, weddings and corporate events worldwide. Dragon fire shows, flame cannons, LED costumes and giant stilt characters.',
                      ru: 'Steam Show — фаер-шоу, световое шоу, шоу с драконом и ходулисты. Заказать выступление на свадьбу, корпоратив, открытие или городской праздник. Минск, Беларусь.' },

    /* -- шапка / навигация -- */
    'nav.dragon':   { en: 'Dragon',    ru: 'Дракон' },
    'nav.fire':     { en: 'Fire',      ru: 'Огонь' },
    'nav.ledfire':  { en: 'LED Fire',  ru: 'LED-огонь' },
    'nav.led':      { en: 'LED',       ru: 'LED' },
    'nav.stilts':   { en: 'Stilts',    ru: 'Ходули' },
    'nav.about':    { en: 'About us',  ru: 'О нас' },
    'cta.book':     { en: 'Book the show', ru: 'Заказать шоу' },

    /* -- hero -- */
    'hero.eyebrow': { en: 'Fire · LED · Dragons · Stilts · worldwide',
                      ru: 'Огонь · LED · Драконы · Ходулисты<br class="mbr">Минск, Беларусь' },
    'hero.tag':     { en: 'We bring the fire, light & dragons.',
                      ru: 'Когда на сцену выходят драконы, начинается магия' },
    'hero.cta':     { en: 'Choose a show', ru: 'Выбрать шоу' },
    'hero.scroll':  { en: 'Scroll', ru: '' },

    /* -- бегущая строка -- */
    'ticker': { en: ['Flamethrowers','Fire cannons','Pixel props','LED costumes','Pyrotechnics','Fire cubes','Sparkle props','Confetti','Paper show','Stilts'],
                ru: ['Огнемёты','Огненные пушки','Пиксельный реквизит','LED-костюмы','Пиротехника','Огненные кубы','Искрящий реквизит','Конфетти','Бумажное шоу','Ходули'] },

    /* -- секция «Наши шоу» -- */
    'prog.kicker':  { en: 'Our Shows', ru: 'Наши шоу' },
    'prog.big':     { en: 'Our <span class="grad">shows.</span>', ru: 'Наши <span class="grad">шоу.</span>' },
    'prog.lead':    { en: 'Book a full show programme, or drop any act into go-mode (a live set that runs to your event flow or a DJ’s beat). Take one show, or stack several into a single night. Tap any block to open the show.',
                      ru: 'Каждое шоу можно заказать отдельно или объединить несколько выступлений в одну программу. Мы адаптируем формат и продолжительность под ваше мероприятие — будь то полноценное шоу или яркий номер в рамках диджей-сета. Нажмите на карточку, чтобы посмотреть описание.' },
    'prog.jump':    { en: 'Jump to a show', ru: 'Перейти к шоу' },

    /* -- секция «Как мы работаем» -- */
    'howwe.kicker': { en: 'How we work', ru: 'Как мы работаем' },
    'howwe.big':    { en: 'Our shows.<br><span class="grad">Your stage.</span>', ru: 'Наши шоу.<br><span class="grad">Ваша сцена.</span>' },
    'howwe.lead':   { en: 'Five signature shows, ready to book and tour. We bring our own crew, costumes and equipment. For large-scale events we can also build something bespoke, on request.',
                      ru: 'Пять готовых шоу-программ для ярких событий. Мы приезжаем с командой артистов, костюмами и всем необходимым оборудованием. А для крупных мероприятий создаем уникальные постановки, которые превращают идею в яркое шоу.' },
    'howwe.1h':     { en: 'Made in-house', ru: 'Создаем всё сами' },
    'howwe.1p':     { en: 'Every costume and prop is designed and built in our own workshop. Full control over quality and look.',
                      ru: 'Каждый костюм, персонаж и элемент реквизита рождается в нашей мастерской. Мы контролируем весь процесс от идеи до выхода на площадку.' },
    'howwe.2h':     { en: 'Adaptable', ru: 'Шоу под ваше событие' },
    'howwe.2p':     { en: 'Each show flexes to your venue, theme, timing and audience, indoor or outdoor, tuned to your run of show.',
                      ru: 'Каждая программа подстраивается под формат площадки, сценарий, тайминг и аудиторию, будь то помещение, открытая площадка или масштабное мероприятие.' },
    'howwe.3h':     { en: 'Custom on request', ru: 'Уникальные решения' },
    'howwe.3p':     { en: 'For large-scale events we can develop costumes and concepts, an optional add-on, built to your brief.',
                      ru: 'Для крупных событий при необходимости разрабатываем специальные костюмы, персонажей и концепции под вашу идею и задачу.' },
    /* RU: в заголовке карточки называем город — на локальном рынке важно,
       что мы свои; EN остаётся про мировые гастроли */
    'howwe.4h':     { en: 'Touring', ru: 'Из Минска — по всему миру' },
    'howwe.4p':     { en: 'We travel worldwide with our own crew and equipment, ready wherever the stage is.',
                      ru: 'Привозим свою команду, костюмы и оборудование. Работаем на площадках по Беларуси, в регионе и за рубежом.' },

    /* -- секция форматов / география (бывш. Worldwide) -- */
    'world.kicker': { en: 'On tour', ru: 'Любая площадка' },
    'world.big':    { en: 'We perform <span class="grad">anywhere</span>', ru: 'Любой <span class="grad">формат</span> события' },
    'world.lead':   { en: 'From intimate weddings to festival main stages: parades, grand openings, galas and corporate nights. If there’s a crowd, we light it up. Anywhere on the map.',
                      ru: 'Наши шоу легко вписываются в любой формат, от частных событий до крупных фестивалей. Свадьбы, корпоративы, открытия, городские и детские праздники, гала-шоу — мы создаем впечатления там, где собираются люди.' },
    'world.formats.label': { en: 'Any stage, day or night', ru: 'Любая площадка, днём и ночью' },
    'world.formats': { en: ['Festivals','Parades','Grand openings','Weddings','Corporate','Galas'],
                       ru: ['Свадьбы','Корпоративы','Открытия','Фестивали','Городские праздники','Торговые центры','Парады','Гала-шоу'] },
    'world.geo.label': { en: 'Booked across', ru: 'И гастролируем по миру' },
    'world.countries': { en: ['UAE','Qatar','Oman','Jordan','Saudi Arabia','Turkey','Egypt','Cyprus'],
                         ru: ['ОАЭ','Катар','Оман','Иордания','Саудовская Аравия','Турция','Египет','Кипр'] },
    'world.geo.more':  { en: '+ Europe & beyond', ru: '+ Европа и дальше' },
    'world.board.foot': { en: 'One show, tuned to your event', ru: 'Пусть ваше событие станет запоминающимся' },

    /* -- статы -- */
    'stats.1v': { en: '12+',    ru: '12+' },     'stats.1k': { en: 'Years on stage',   ru: 'лет на сцене' },
    'stats.2v': { en: '15+',    ru: '15+' },     'stats.2k': { en: 'Countries',        ru: 'стран' },
    'stats.3v': { en: '5',      ru: '5' },       'stats.3k': { en: 'Signature shows',  ru: 'фирменных шоу' },
    'stats.4v': { en: 'Dozens', ru: 'Десятки' }, 'stats.4k': { en: 'of costumes',      ru: 'костюмов' },

    /* -- контакт -- */
    'contact.kicker': { en: 'Book the Steam Show', ru: 'Заказать Steam Show' },
    'contact.h':      { en: 'Let’s <span class="grad">light it up</span>', ru: 'Давайте <span class="grad">зажжём!</span>' },
    'contact.lead':   { en: 'Tell us the date, the venue and the vibe, and we’ll bring the fire. Or the light. Or the giants. Or all of it at once. You get the idea.',
                        ru: 'Расскажите о событии: дата, площадка и формат, а мы предложим идеальное шоу и привезем всё необходимое: артистов, костюмы и оборудование.' },

    /* -- футер -- */
    'footer.tagline': { en: 'Steam Show · fire · LED · dragons · stilts', ru: 'Steam Show · огонь · LED · драконы · ходулисты' },

    /* ============================================================
       МИКРОКОПИРАЙТ, рендерится из JS (site.js / show.js)
       ============================================================ */
    'ui.viewMore':      { en: 'View more', ru: 'Подробнее' },
    'ui.viewMoreArrow': { en: 'View more →', ru: 'Подробнее →' },
    'ui.open':          { en: 'Open', ru: 'Открыть' },

    /* страница шоу */
    'show.duration': { en: 'Duration', ru: 'Длительность' },
    'show.durationStilts': { en: 'Duration', ru: 'Формат' },   /* у ходулистов слот длительности = «Формат» (RU) */
    'show.format':   { en: 'Format',   ru: 'Площадка' },
    'show.cast':     { en: 'Cast',     ru: 'Состав' },
    'show.watchCta': { en: 'Watch the show', ru: 'Смотреть шоу' },
    'show.top':      { en: 'Top',      ru: 'Наверх' },
    'show.videos':   { en: 'Videos',   ru: 'Видео' },
    'show.photos':   { en: 'Photos',   ru: 'Фото' },
    'show.addons':   { en: 'Add-ons',  ru: 'Дополнения' },
    'show.book':     { en: 'Book',     ru: 'Заказать' },
    'show.watchKicker': { en: 'Watch', ru: 'Смотрите' },
    'show.programsKicker': { en: 'Programs', ru: 'Программы' },
    'show.costumesKicker': { en: 'Costumes', ru: 'Костюмы' },
    'show.videosBlurb': { en: '{n} · highlights.', ru: '{n} · хайлайты.' },
    'show.videosCount': { en: '{n} clips', ru: '{n} видео' },
    'show.galleryKicker': { en: 'Gallery', ru: 'Галерея' },
    'show.photosBlurb': { en: '{n} shots from real events.', ru: '{n} кадров с реальных мероприятий.' },
    'show.browsePhotos': { en: 'Browse all photos', ru: 'Все фото' },
    'show.browseCostumes': { en: 'Browse all costumes', ru: 'Все костюмы' },
    'show.shown':    { en: '{n} shown', ru: 'показано: {n}' },
    'show.clear':    { en: 'Clear', ru: 'Сбросить' },
    'show.emptyPhotos':   { en: 'No photos match those themes. Try clearing a filter.', ru: 'Нет фото по этим темам. Сбросьте фильтр.' },
    'show.emptyCostumes': { en: 'No costumes match those themes. Try clearing a filter.', ru: 'Нет костюмов по этим темам. Сбросьте фильтр.' },
    'show.viewMorePhotos': { en: 'View more photos →', ru: 'Ещё фото →' },
    'show.bookKicker': { en: 'Book the show', ru: 'Заказать шоу' },
    'show.bookLead':   { en: 'Tell us the date, the venue and the vibe, and we’ll tailor {name} to your run of show. Reach us on whatever’s fastest.',
                         ru: 'Расскажите дату, площадку и настроение — и мы подстроим «{name}» под сценарий вашего вечера. Пишите удобным способом.' },
    'show.label.photo':   { en: 'photo', ru: 'фото' },
    'show.label.video':   { en: 'video', ru: 'видео' },
    'show.label.film':    { en: 'film', ru: 'фильм' },
    'show.label.costume': { en: 'Costume', ru: 'Костюм' },
    'show.label.character': { en: 'Character', ru: 'Персонаж' },

    /* метки спецификаций в карточках/рядах (ключи specs) */
    'spec.format':   { en: 'Format',   ru: 'Площадка' },
    'spec.duration': { en: 'Duration', ru: 'Длительность' },
    'spec.cast':     { en: 'Cast',     ru: 'Состав' },
    'spec.style':    { en: 'Style',    ru: 'Стиль' },
    'spec.look':     { en: 'Look',     ru: 'Вид' },
    'spec.looks':    { en: 'Looks',    ru: 'Образы' },
    'spec.mode':     { en: 'Mode',     ru: 'Режим' },
    'spec.costumes': { en: 'Costumes', ru: 'Костюмы' },

    /* переключатель */
    'lang.aria': { en: 'Language', ru: 'Язык' }
  };
  window.SS_DICT = DICT;

  function fmt(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  function T(key, vars) {
    var e = DICT[key];
    var v = e ? pick(e) : key;
    return fmt(v, vars);
  }
  window.T = T;

  /* ---- подстановка в статику ---- */
  function applyStatic(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = T(el.getAttribute('data-i18n-html')); });
    root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var kv = pair.split(':'); if (kv.length === 2) el.setAttribute(kv[0].trim(), T(kv[1].trim()));
      });
    });
  }
  window.SS_applyStatic = applyStatic;

  /* ---- переключатель языка ---- */
  /* адрес этой же страницы на другом языке; null — если пары нет
     (например, у старого show.html?show=) */
  function pageForLang(next) {
    /* адрес приводим к «английской» форме: снимаем префикс /ru, старое плоское
       имя (/fire-show-ru.html) и явный index.html сводим к виду /fire-show/ */
    var base = location.pathname.replace(/^\/ru(?=\/|$)/, '');
    base = base.replace(/-ru\.html$/, '.html').replace(/index\.html$/, '').replace(/\.html$/, '/');
    if (!base || base.charAt(base.length - 1) !== '/') base += '/';
    if (base.charAt(0) !== '/') base = '/' + base;
    var known = ['/'];
    if (window.SS && window.SS.pages) {
      for (var k in window.SS.pages) known.push(window.SS.pages[k]);
    }
    if (known.indexOf(base) < 0) return null;
    return next === 'ru' ? '/ru' + base : base;
  }

  function setLang(next) {
    if (SUPPORTED.indexOf(next) < 0 || next === lang) return;
    try { localStorage.setItem(STORE, next); } catch (e) {}
    /* у русской версии свой адрес под /ru/ — переключение языка это переход
       на него (место на странице сохраняем через хеш) */
    var target = pageForLang(next);
    if (target) { location.href = target + location.hash; return; }
    var u = new URL(location.href);          /* страница без пары — по-старому */
    u.searchParams.set('lang', next);
    location.href = u.toString();   /* перезагрузка: data.js пересоберёт SS на новом языке */
  }
  window.SS_setLang = setLang;

  function buildToggle() {
    document.querySelectorAll('[data-langsw]').forEach(function (box) {
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', T('lang.aria'));
      box.innerHTML = SUPPORTED.map(function (l) {
        return '<button type="button" class="langsw__b' + (l === lang ? ' on' : '') + '" data-setlang="' + l +
          '" aria-pressed="' + (l === lang) + '">' + l.toUpperCase() + '</button>';
      }).join('');
      box.querySelectorAll('[data-setlang]').forEach(function (b) {
        b.addEventListener('click', function () { setLang(b.getAttribute('data-setlang')); });
      });
    });
  }

  function init() { applyStatic(document); buildToggle(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
