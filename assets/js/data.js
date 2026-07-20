/* ============================================================
   STEAM SHOW — DATA (сшивка + единый API)
   Объединяет content.js (копирайт) и media.js (пути) в один
   объект window.SS. Всё остальное (site.js, show.js) читает
   только отсюда — единственный источник правды.
   Подключать ПОСЛЕ content.js и media.js.
   ============================================================ */
(function () {
  var C = window.SS_CONTENT, M = window.SS_MEDIA;
  if (!C || !M) { console.error('[SS] content.js / media.js не загружены'); return; }

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
      media: { photos: m.photos || [], costumes: m.costumes || [], video: m.video || null, heroVideo: m.heroVideo || null }
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
        photos: t.photos || [], video: t.video || null, poster: t.poster || null
      };
    }),
    other: M.stilts.other || []
  };

  /* обложка шоу: первое фото, иначе превью первого видео */
  function cover(id) {
    var s = shows[id]; if (!s) return '';
    return s.media.photos[0] || (s.videos[0] ? YT_THUMB(s.videos[0]) : '');
  }

  /* ---- иконки соцсетей (общие для главной и страниц шоу) ---- */
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none"/></svg>',
    email:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.6 7.6 12 13l8.4-5.4"/></svg>',
    whatsapp:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 3.5 17.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.8.8-2.5-.2-.3A8 8 0 0 1 12 4Zm-2.7 4c-.2 0-.5 0-.7.4-.2.4-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.9 4.5 3.9 2.2.8 2.7.7 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.7-.3-.4.3-.4.8-1.3.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.4-.6-.4Z"/></svg>',
    youtube:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="4.6"/><path d="M10.4 9.1 15.2 12l-4.8 2.9Z" fill="currentColor" stroke="none"/></svg>'
  };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  /* единый HTML блока контактов (одинаковый на всех страницах) */
  function contactHTML() {
    return C.contact.map(function (ch) {
      var attrs = 'href="' + ch.href + '"' + (ch.ext ? ' target="_blank" rel="noopener"' : '');
      return '<a class="fch" style="--ac:' + ch.color + ';--ac2:' + (ch.color2 || ch.color) + '" ' + attrs + '>' +
        '<span class="ic" aria-hidden="true">' + (ICONS[ch.ic] || '') + '</span>' +
        '<span class="fk">' + esc(ch.kicker) + '</span>' +
        '<span class="fv">' + esc(ch.value) + '</span>' +
        '<span class="fgo">' + esc(ch.go) + '</span></a>';
    }).join('');
  }

  window.SS = {
    order: C.order,
    colors: C.colors,
    reel: C.reel,
    shows: shows,
    stilts: stilts,
    contact: C.contact,
    show: function (id) { return shows[id] || null; },
    cover: cover,
    ytThumb: YT_THUMB,
    ytEmbed: YT_EMBED,
    icon: function (name) { return ICONS[name] || ''; },
    esc: esc,
    contactHTML: contactHTML
  };
})();
