/* ============================================================
   STEAM SHOW — DATA (сшивка + единый API)
   Объединяет content.js (копирайт) и media.js (пути) в один
   объект window.SS. Всё остальное (site.js, show.js) читает
   только отсюда — единственный источник правды.
   Подключать ПОСЛЕ content.js и media.js.
   ============================================================ */
(function () {
  var C0 = window.SS_CONTENT, M = window.SS_MEDIA;
  if (!C0 || !M) { console.error('[SS] content.js / media.js не загружены'); return; }

  /* ---- локализация: развернуть {en,ru}-листья по текущему языку ----
     Строки в content.js вида {en:'…', ru:'…'} схлопываются в строку
     нужного языка. Всё остальное (ключи, hex-цвета, id, пути) —
     как есть. Источник языка — window.SS_LANG (i18n.js). */
  var LANG = window.SS_LANG || 'en';
  function isLeaf(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
    var ks = Object.keys(o); if (!ks.length) return false;
    for (var i = 0; i < ks.length; i++) if (ks[i] !== 'en' && ks[i] !== 'ru') return false;
    return true;
  }
  function loc(node) {
    if (Array.isArray(node)) return node.map(loc);
    if (node && typeof node === 'object') {
      if (isLeaf(node)) return node[LANG] != null ? node[LANG] : node.en;
      var out = {}; for (var k in node) if (Object.prototype.hasOwnProperty.call(node, k)) out[k] = loc(node[k]);
      return out;
    }
    return node;
  }
  var C = loc(C0);

  /* ---- адреса страниц шоу ------------------------------------------
     У каждого шоу свой файл в корне (не ?show=), чтобы поисковики и
     мессенджеры видели отдельную страницу с собственными мета-тегами.
     Файлы лежат рядом с index.html — относительные пути к assets/
     работают из них без изменений. Единственный источник правды:
     и меню, и карточки, и canonical берут адрес отсюда.
     Старый show.html?show=<id> остаётся рабочим (разосланные ссылки),
     canonical с него ведёт на новый адрес. ------------------------- */
  var PAGES = {
    dragon:  'dragon-fire-show.html',
    fire:    'fire-show.html',
    ledfire: 'led-fire-show.html',
    led:     'led-show.html',
    stilts:  'stilt-walkers.html'
  };
  /* файл шоу без параметров — для canonical и sitemap */
  function page(id) { return PAGES[id] || 'index.html'; }
  /* ссылка для навигации: тот же файл + текущий язык, чтобы переход
     между шоу не сбрасывал RU (canonical всегда без ?lang) */
  function url(id) { return page(id) + (LANG !== 'en' ? '?lang=' + LANG : ''); }
  /* обратный разбор: файл → id шоу (popstate, определение стартового шоу) */
  function idByPage(path) {
    var file = String(path || '').split('/').pop();
    for (var k in PAGES) if (PAGES[k] === file) return k;
    return null;
  }

  var YT_THUMB = function (id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; };
  var YT_EMBED = function (id) {
    return 'https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
  };

  /* ---- шоу: content + media, keyed by id ---- */
  var shows = {};
  C.order.forEach(function (id) {
    var c = C.shows[id] || {}, m = M.shows[id] || { photos: [], costumes: [], video: null };
    shows[id] = {
      id: id,
      name: c.name, nav: c.nav,
      color: C.colors[id],
      videos: c.videos || [],
      card: c.card,
      detail: c.detail,
      media: { photos: m.photos || [], costumes: m.costumes || [], video: m.video || null, heroVideo: m.heroVideo || null, themes: m.themes || [] }
    };
  });

  /* ---- гардероб ходулистов: media (пути) + content (имена/блёрбы) ---- */
  var stilts = {
    intro: C.stilts.wardrobe,
    otherLabel: C.stilts.otherLabel,
    stars: (M.stilts.stars || []).map(function (s) {
      var meta = (C.stilts.stars || {})[s.key] || {};
      return { key: s.key, name: meta.name || s.key, blurb: meta.blurb || '', photos: s.photos || [] };
    }),
    themes: (M.stilts.themes || []).map(function (t) {
      return {
        key: t.key, name: (C.stilts.themes || {})[t.key] || t.key,
        photos: t.photos || [], video: t.video || null, poster: t.poster || null,
        ytVideo: (C.stilts.themeVideos || {})[t.key] || null,
        focus: (C.stilts.themeFocus || {})[t.key] || null
      };
    }),
    other: M.stilts.other || []
  };

  /* обложка шоу: спец-постер (content.covers) → первое фото → превью видео */
  var COVERS = C0.covers || {};
  function cover(id) {
    var s = shows[id]; if (!s) return '';
    return COVERS[id] || s.media.photos[0] || (s.videos[0] ? YT_THUMB(s.videos[0]) : '');
  }

  /* ---- иконки соцсетей (общие для главной и страниц шоу) ---- */
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none"/></svg>',
    email:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.6 7.6 12 13l8.4-5.4"/></svg>',
    whatsapp:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 3.5 17.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.8.8-2.5-.2-.3A8 8 0 0 1 12 4Zm-2.7 4c-.2 0-.5 0-.7.4-.2.4-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.9 4.5 3.9 2.2.8 2.7.7 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.7-.3-.4.3-.4.8-1.3.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.4-.6-.4Z"/></svg>',
    youtube:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="4.6"/><path d="M10.4 9.1 15.2 12l-4.8 2.9Z" fill="currentColor" stroke="none"/></svg>',
    phone:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg>',
    telegram:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7.3 13 2.7 11.6c-1-.3-1-.9.2-1.4L20.6 3.4c.8-.3 1.5.2 1.3.9Z"/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  /* единый HTML блока контактов (одинаковый на всех страницах) */
  function contactHTML() {
    return C.contact.map(function (ch) {
      var style = 'style="--ac:' + ch.color + ';--ac2:' + (ch.color2 || ch.color) + '"';
      var head =
        '<span class="ic" aria-hidden="true">' + (ICONS[ch.ic] || '') + '</span>' +
        '<span class="fk">' + esc(ch.kicker) + '</span>' +
        '<span class="fv">' + esc(ch.value) + '</span>';
      /* карточка с несколькими действиями (телефон + мессенджеры): не ссылка,
         а контейнер с рядом кнопок-иконок (вложенные <a> внутри <a> недопустимы) */
      if (ch.actions) {
        var btns = ch.actions.map(function (a) {
          var at = 'href="' + a.href + '"' + (a.ext ? ' target="_blank" rel="noopener"' : '');
          return '<a class="fbtn" ' + at + ' aria-label="' + esc(a.aria) + '" title="' + esc(a.aria) + '">' +
            (ICONS[a.ic] || '') + '</a>';
        }).join('');
        return '<div class="fch fch-multi" ' + style + '>' + head +
          '<span class="fgo fch-acts">' + btns + '</span></div>';
      }
      var attrs = 'href="' + ch.href + '"' + (ch.ext ? ' target="_blank" rel="noopener"' : '');
      return '<a class="fch" ' + style + ' ' + attrs + '>' + head +
        '<span class="fgo">' + esc(ch.go) + '</span></a>';
    }).join('');
  }

  /* ---- автокегль значений контактов --------------------------------
     Значение (.fv) обязано остаться в одну строку и не упираться в край
     плитки. Считать «на глаз» по числу символов нельзя — ширина глифов
     разная, поэтому меряем реальную ширину уже отрисованного текста
     и уменьшаем кегль ровно настолько, насколько не влезает (и не более:
     мельчить нельзя). Короткие значения кегля не теряют вовсе.
     Вызывать после вставки contactHTML(); дальше пересчёт по загрузке
     шрифтов и resize навешивается сам. ------------------------------- */
  var FV_GAP = 12;   /* воздух до правого края плитки, px */
  var FV_MIN = 14;   /* ниже не опускаемся ни при каких условиях */

  function textWidth(el) {
    if (document.createRange) {
      var r = document.createRange();
      r.selectNodeContents(el);
      var w = r.getBoundingClientRect().width;
      if (w) return w;
    }
    return el.scrollWidth;
  }
  function fitValue(el) {
    el.style.fontSize = '';                                     /* сброс к кеглю из CSS */
    var base = parseFloat(getComputedStyle(el).fontSize) || 19;
    var box = el.clientWidth;
    var w = textWidth(el);
    if (box <= 0 || !w || w <= box) return;      /* влезает как есть — кегль не трогаем */
    var avail = box - FV_GAP;                    /* ужимаем — оставляем воздух справа */
    if (avail <= 0) return;
    var size = Math.max(FV_MIN, Math.floor(base * (avail / w) * 10) / 10);
    el.style.fontSize = size + 'px';
    /* ширина текста от кегля зависит почти линейно, но не идеально
       (кернинг, хинтинг) — доводим мелким шагом */
    for (var n = 0; n < 10 && size > FV_MIN && textWidth(el) > avail; n++) {
      size = Math.max(FV_MIN, Math.round((size - .2) * 10) / 10);
      el.style.fontSize = size + 'px';
    }
  }
  var fvArmed = false;
  function fitContactValues() {
    var els = document.querySelectorAll('.fch .fv');
    for (var i = 0; i < els.length; i++) fitValue(els[i]);
    if (fvArmed) return;
    fvArmed = true;
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(fitContactValues, 120);
    });
    /* шрифт может подгрузиться позже разметки — тогда ширины другие */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitContactValues);
  }

  window.SS = {
    order: C.order,
    colors: C.colors,
    reel: C.reel,
    shows: shows,
    stilts: stilts,
    contact: C.contact,
    show: function (id) { return shows[id] || null; },
    pages: PAGES,
    page: page,
    url: url,
    idByPage: idByPage,
    cover: cover,
    ytThumb: YT_THUMB,
    ytEmbed: YT_EMBED,
    icon: function (name) { return ICONS[name] || ''; },
    esc: esc,
    contactHTML: contactHTML,
    fitContactValues: fitContactValues
  };
})();
