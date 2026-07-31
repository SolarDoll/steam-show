/* ============================================================
   STEAM SHOW — show.js (страница отдельного шоу)
   Рендерит показ из window.SS (?show=<id>). Лайтбокс — общий
   (window.LB из lightbox.js). Одна тема hybrid2.
   Микрокопирайт локализуется через window.T (i18n.js), контент —
   уже развёрнут в нужный язык в data.js.
   Подключать ПОСЛЕ i18n.js, data.js и lightbox.js.
   ============================================================ */
(function () {
  var SS = window.SS;
  if (!SS) { console.error('[SS] data.js не загружен'); return; }
  var esc = SS.esc, ytThumb = SS.ytThumb;
  var T = window.T || function (k) { return k; };
  var LANG = window.SS_LANG || 'en';
  var HERO_VIDEO = (window.SS_MEDIA && SS_MEDIA.hero && SS_MEDIA.hero.video) || '';
  var page = document.getElementById('page');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* SEO: проставляем/обновляем мета-теги под текущее шоу */
  function setMeta(key, val, isProp) {
    if (!val) return;
    var sel = isProp ? 'meta[property="' + key + '"]' : 'meta[name="' + key + '"]';
    var el = document.head.querySelector(sel);
    if (!el) { el = document.createElement('meta'); el.setAttribute(isProp ? 'property' : 'name', key); document.head.appendChild(el); }
    el.setAttribute('content', val);
  }
  function setCanonical(href) {
    var el = document.head.querySelector('link[rel="canonical"]');
    if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
    el.setAttribute('href', href);
  }

  /* alt для галерейных снимков. Без него фото не попадают в поиск по
     картинкам и не читаются скринридером. Описываем не сам кадр (выдумывать
     нельзя), а к чему он относится: «<шоу или тема> — <подпись> N».
     Аргументы — сырые строки, экранирование здесь. */
  function altOf() {
    var parts = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) parts.push(arguments[i]);
    return esc(parts.join(' — '));
  }

  function railBox(inner) {
    return '<div class="railbox"><button class="rnav l" aria-label="Scroll left">‹</button>' +
      '<div class="vrail">' + inner + '</div>' +
      '<button class="rnav r" aria-label="Scroll right">›</button></div>';
  }

  /* переход к другому шоу (меню, prev/next).
     Адрес — отдельный файл шоу (SS.url), а не ?show=, чтобы URL в строке
     совпадал с индексируемой страницей: после F5 отдаётся тот же показ. */
  function go(id, push) {
    document.querySelectorAll('#shownav a[data-id],#mobmenu a[data-id]').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-id') === id);
    });
    render(id);
    if (push !== false) history.pushState({ show: id }, '', SS.url(id));
  }

  /* какое шоу показывать: жёстко заданное на странице (window.SS_SHOW в
     файлах шоу) → имя файла → ?show= (старые ссылки) → флагман */
  function currentId() {
    var id = window.SS_SHOW || SS.idByPage(location.pathname) ||
      new URLSearchParams(location.search).get('show');
    return SS.show(id) ? id : 'dragon';
  }

  /* клик по ссылке-шоу: переключаем без перезагрузки, но не мешаем
     браузеру открыть в новой вкладке (Ctrl/Cmd/Shift/средняя кнопка) */
  function wireShowLink(a, after) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      go(a.getAttribute('data-id'));
      if (after) after();
    });
  }

  function render(id) {
    var s = SS.show(id), det = s.detail, d = s.media, ac = s.color;
    document.documentElement.style.setProperty('--ac', ac);
    var cover = d.photos[0] || (s.videos[0] ? ytThumb(s.videos[0]) : '');
    var heroVid = d.heroVideo || d.video || (id === 'dragon' ? HERO_VIDEO : null);
    /* экономия трафика и reduced-motion: вместо фонового видео — обложка */
    if (heroVid && (reduce || SS.lightMode())) heroVid = null;
    /* SEO: уникальные title/description/OG под каждое шоу */
    var seo = det.seo || {};
    var seoTitle = seo.title || (s.name + ' · Steam Show');
    var seoDesc = seo.desc || det.desc;
    document.title = seoTitle;
    setMeta('description', seoDesc);
    setMeta('og:title', seoTitle, true);
    setMeta('og:description', seoDesc, true);
    setMeta('og:type', 'website', true);
    if (cover) { try { setMeta('og:image', new URL(cover, location.href).href, true); } catch (e) {} }
    /* canonical — всегда отдельный файл шоу без ?lang/?show:
       и старый show.html?show=, и RU-версия ссылаются на один адрес */
    try {
      var canon = new URL(SS.page(id), location.href).href;
      setCanonical(canon);
      setMeta('og:url', canon, true);
    } catch (e) {}

    var html = '';
    /* HERO */
    html += '<header class="hero" id="top"><div class="bg">' +
      (heroVid
        ? '<video autoplay muted loop playsinline poster="' + cover + '"><source src="' + heroVid + '" type="video/mp4"></video>'
        : '<img src="' + cover + '" alt="' + esc(s.name) + '">') +
      '</div><div class="scrim"></div><div class="inner wrap">' +
      '<p class="eyebrow">' + esc(det.type) + '</p>' +
      '<h1 class="htitle">' + esc(s.name) + '</h1>' +
      '<p class="hdesc">' + esc(det.desc) + '</p>' +
      '<div class="meta">' +
        '<div class="m"><div class="k">' + esc(T(id === 'stilts' ? 'show.durationStilts' : 'show.duration')) + '</div><div class="v">' + esc(det.duration) + '</div></div>' +
        '<div class="m"><div class="k">' + esc(T('show.format')) + '</div><div class="v">' + esc(det.format) + '</div></div>' +
        '<div class="m"><div class="k">' + esc(T('show.cast')) + '</div><div class="v">' + esc(det.cast) + '</div></div></div>' +
      '<div class="chips">' + det.chips.map(function (c) { return '<span class="chip"><b>·</b>' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<div class="hcta"><a class="btn solid" href="#videos"><span class="pd"></span> ' + esc(T('show.watchCta')) + '</a>' +
        '<a class="btn ghost" href="#book">' + esc(T('cta.book')) + '</a></div>' +
      '</div></header>';

    var videoFirst = (id === 'led' || id === 'stilts' || id === 'fire') && s.videos.length;

    /* SUB-NAV (без «Top» — наверх ведут логотип и плавающая кнопка ↑) */
    var nav = [];
    if (videoFirst) nav.push({ href: 'videos', label: T('show.videos') });
    if (det.variants) nav.push({ href: 'sec-variants', label: det.variants.navLabel });
    if (!videoFirst && s.videos.length) nav.push({ href: 'videos', label: T('show.videos') });
    var hasBrowseAllNav = id === 'stilts' || (det.variants && det.variants.kind === 'themes' && (d.themes || []).length);
    if (d.photos.length && !hasBrowseAllNav) nav.push({ href: 'gallery', label: T('show.photos') });
    else if (det.variants && det.variants.kind === 'themes' && (d.themes || []).length) nav.push({ href: 'browse-all', label: T('show.photos') });
    if (det.addon) nav.push({ href: 'addon', label: T('show.addons') });
    nav.push({ href: 'book', label: T('show.book') });
    html += '<div class="subnav" id="subnav"><div class="si">' +
      nav.map(function (n) { return '<a href="#' + n.href + '" data-sec="' + n.href + '">' + esc(n.label) + '</a>'; }).join('') +
      '</div></div>';

    /* VARIANTS */
    var variantsHTML = '';
    if (det.variants) {
      if (det.variants.kind === 'themes') variantsHTML = renderThemes(s);
      else if (det.variants.kind === 'catalogue') variantsHTML = renderCatalogue(s);
      else if (det.variants.kind === 'stilts') variantsHTML = renderStilts();
    }

    /* VIDEOS */
    var videosHTML = '';
    if (s.videos.length) {
      var vn = s.videos.length;
      var vcount = LANG === 'en' ? (vn + ' clip' + (vn > 1 ? 's' : '')) : (vn + ' видео');
      videosHTML = '<section id="videos"><div class="wrap">' +
        '<div class="shead"><span class="kicker">' + esc(T('show.watchKicker')) + '</span><h2>' + esc(T('show.videos')) + '</h2>' +
        '<p>' + esc(T('show.videosBlurb', { n: vcount })) + '</p></div>' +
        railBox(s.videos.map(function (v, i) {
          var vidId = typeof v === 'string' ? v : v.id;
          var vlbl = (v && v.label) ? esc(v.label) : (esc(s.name) + ' · ' + T('show.label.video') + ' ' + (i + 1));
          return '<div class="vcard" data-video="' + vidId + '" data-vlabel="' + vlbl + '">' +
            '<div class="vw"><img loading="lazy" src="' + ytThumb(vidId) + '" alt="' + vlbl + '"><span class="pl"></span></div>' +
            '<div class="vl">' + vlbl + '</div></div>';
        }).join('')) + '</div></section>';
    }

    if (videoFirst) { html += videosHTML; html += variantsHTML; }
    else { html += variantsHTML; html += videosHTML; }

    /* GALLERY (у ходулистов и у fire с темами не показываем — дублирует фильтруемую «Browse all») */
    var hasBrowseAll = id === 'stilts' || (det.variants && det.variants.kind === 'themes' && (d.themes || []).length);
    if (d.photos.length && !hasBrowseAll) {
      html += '<section id="gallery"><div class="wrap">' +
        '<div class="shead"><span class="kicker">' + esc(T('show.galleryKicker')) + '</span><h2>' + esc(T('show.photos')) + '</h2>' +
        '<p>' + esc(T('show.photosBlurb', { n: d.photos.length })) + '</p></div>' +
        '<div class="gallery">' + d.photos.map(function (p, i) {
          return '<div class="g" data-photo="' + i + '"><img loading="lazy" src="' + p + '" alt="' +
            altOf(s.name, T('show.label.photo') + ' ' + (i + 1)) + '"></div>';
        }).join('') + '</div></div></section>';
    }

    /* ADD-ONS — опциональный бокс (напр. клубный формат у LED) */
    if (det.addon) {
      var a = det.addon;
      html += '<section id="addon"><div class="wrap"><div class="addon-box">' +
        '<span class="kicker">' + esc(a.kicker) + '</span>' +
        '<h2>' + esc(a.title) + '</h2>' +
        '<p>' + esc(a.text) + '</p>' +
        '<div class="chips">' + (a.tags || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div></div></section>';
    }

    /* BOOK — общий блок контактов */
    html += '<section id="book"><div class="wrap">' +
      '<div class="kicker">' + esc(T('contact.kicker')) + '</div>' +
      '<h2 class="ccta">' + T('contact.h') + '</h2>' +
      '<p class="clead">' + esc(T('contact.lead')) + '</p>' +
      '<div class="fchannels">' + SS.contactHTML() + '</div></div></section>';

    page.innerHTML = html;
    SS.fitContactValues();
    wirePage(id, s);
    wireSpy(nav);
    window.scrollTo(0, 0);
  }

  /* ----- fire: темы ----- */
  /* плоский список фото всех тем + группы (для «Browse all» и лайтбокса) */
  function fireBrowse(s) {
    var v = s.detail.variants, nameByKey = {};
    v.items.forEach(function (w) { if (w.key) nameByKey[w.key] = w.h; });
    var groups = (s.media.themes || []).filter(function (t) { return t.photos.length; })
      .map(function (t) { return { token: t.key, label: nameByKey[t.key] || t.key, photos: t.photos }; });
    /* порядок фото по-умолчанию: фэнтези, славик, рок, затем всё остальное */
    var PREF = { 'fire-fantasy': 0, 'fire-slavic': 1, 'fire-rock': 2 };
    groups.sort(function (a, b) {
      var ai = PREF[a.token] == null ? 99 : PREF[a.token];
      var bi = PREF[b.token] == null ? 99 : PREF[b.token];
      return ai - bi;
    });
    var ALL = [];
    groups.forEach(function (g) { g.photos.forEach(function (p) { ALL.push({ src: p, token: g.token, label: g.label }); }); });
    return { groups: groups, ALL: ALL };
  }

  function renderThemes(s) {
    var v = s.detail.variants, ph = s.media.photos, n = v.items.length;
    var byKey = {};
    (s.media.themes || []).forEach(function (t) { byKey[t.key] = t.photos || []; });
    var h = '<section id="sec-variants"><div class="wrap"><div class="shead"><span class="kicker">' + esc(T('show.programsKicker')) + '</span>' +
      '<h2>' + esc(v.title) + '</h2><p>' + esc(v.lead) + '</p></div><div class="worlds">';
    v.items.forEach(function (w, i) {
      if (w.bespoke) {
        h += '<div class="world bespoke"><div class="wc"><div class="wn">' + esc(w.nm) + '</div><h3>' + esc(w.h) + '</h3><p>' + esc(w.p) + '</p></div></div>';
        return;
      }
      var themed = w.key && byKey[w.key] && byKey[w.key].length ? byKey[w.key] : null;
      var cov = themed ? themed[0] : (ph[Math.floor(i * ph.length / n)] || ph[i % ph.length] || ph[0] || '');
      var hook = themed
        ? 'data-firetheme="' + w.key + '" data-fname="' + esc(w.h) + '"'
        : 'data-world="' + i + '"';
      h += '<div class="world" ' + hook + '><img loading="lazy" src="' + cov + '" alt="' + altOf(s.name, w.h) + '">' +
        '<div class="wc"><div class="wn">' + esc(w.nm) + '</div><h3>' + esc(w.h) + '</h3><p>' + esc(w.p) + '</p></div></div>';
    });
    h += '</div>';

    /* Browse all — фото всех тем + фильтр по темам (как в гардеробе ходулистов) */
    var fb = fireBrowse(s);
    if (fb.ALL.length) {
      h += '<div id="browse-all" style="margin-top:clamp(40px,6vh,64px)"><div class="th" style="margin-bottom:16px">' +
        '<h4 style="font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:clamp(22px,2.8vw,36px);margin:0">' + esc(T('show.browsePhotos')) + '</h4>' +
        '<span class="cnt" id="stCount" style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-left:14px">' + esc(T('show.shown', { n: fb.ALL.length })) + '</span></div>';
      h += '<div class="filters" id="stFilters">' +
        fb.groups.map(function (g) { return '<button class="fl" data-tag="' + g.token + '">' + esc(g.label) + '<span class="n">' + g.photos.length + '</span></button>'; }).join('') +
        '<button class="clr" id="stClear">' + esc(T('show.clear')) + '</button></div>';
      h += '<div class="gridc" id="stGrid">' + fb.ALL.map(function (x, i) {
        return '<div class="cell" data-firegallery="' + i + '" data-tags="' + x.token + '">' +
          '<img loading="lazy" src="' + x.src + '" alt="' + altOf(s.name, x.label) + '">' +
          '<div class="tg"><span>' + esc(x.label) + '</span></div></div>';
      }).join('') + '</div>';
      h += '<div class="emptymsg" id="stEmpty" style="display:none">' + esc(T('show.emptyPhotos')) + '</div></div>';
    }

    return h + '</div></section>';
  }

  /* ----- led: каталог костюмов ----- */
  function renderCatalogue(s) {
    var cs = s.media.costumes;
    if (!cs.length) return '';
    return '<section id="sec-variants"><div class="wrap"><div class="shead"><span class="kicker">' + esc(T('show.costumesKicker')) + '</span>' +
      '<h2>' + esc(s.detail.variants.title) + '</h2><p>' + esc(s.detail.variants.lead) + '</p></div>' +
      '<div class="gridc">' + cs.map(function (c, i) {
        return '<div class="cell" data-costume="' + i + '"><img loading="lazy" src="' + c + '" alt="' +
          altOf(s.name, T('show.label.costume') + ' ' + (i + 1)) + '"></div>';
      }).join('') + '</div></div></section>';
  }

  /* ----- stilts: гардероб (звёзды → тема-блоки → browse all + фильтр) ----- */
  function renderStilts() {
    var W = SS.stilts, intro = W.intro;
    var filmLbl = T('show.label.film');
    var stName = (SS.show('stilts') || {}).name || '';   /* для alt снимков */
    var h = '<section id="sec-variants"><div class="wrap">' +
      '<div class="shead"><span class="kicker">' + esc(intro.kicker) + '</span><h2>' + esc(intro.title) + '</h2>' +
      '<p>' + esc(intro.lead) + '</p></div>';

    /* Тема-блоки (шоу-стопперы убраны; их место заняла секция видео вверху) */
    W.themes.forEach(function (t) {
      if (!t.photos.length) return;
      var feat, fp = t.focus ? ' style="object-position:' + t.focus + '"' : '';
      if (t.ytVideo) {
        feat = '<div class="feat" data-video="' + t.ytVideo + '" data-vlabel="' + esc(t.name) + ' · ' + esc(filmLbl) + '">' +
          '<div class="vw"><img loading="lazy" src="' + t.photos[0] + '" alt="' + altOf(stName, t.name) + '"' + fp + '><span class="pl"></span></div>' +
          '<span class="vlbl">' + esc(t.name) + ' · ' + esc(filmLbl) + '</span></div>';
      } else if (t.video) {
        feat = '<div class="feat" data-localvideo="' + t.video + '" data-vlabel="' + esc(t.name) + ' · ' + esc(filmLbl) + '">' +
          '<div class="vw"><img loading="lazy" src="' + (t.poster || t.photos[0]) + '" alt="' + altOf(stName, t.name) + '"' + fp + '><span class="pl"></span></div>' +
          '<span class="vlbl">' + esc(t.name) + ' · ' + esc(filmLbl) + '</span></div>';
      } else {
        feat = '<div class="feat" data-gallery="theme:' + t.key + '" data-gi="0"><div class="vw"><img loading="lazy" src="' + t.photos[0] + '" alt="' + altOf(stName, t.name) + '"' + fp + '></div>' +
          '<span class="vlbl">' + esc(t.name) + '</span></div>';
      }
      var gi = (t.ytVideo || t.video) ? 0 : 1;
      var grid = '<div class="mini-grid">' + t.photos.slice(gi, gi + 6).map(function (p, k) {
        return '<div class="cell" data-gallery="theme:' + t.key + '" data-gi="' + (gi + k) + '"><img loading="lazy" src="' + p + '" alt="' +
          altOf(stName, t.name, T('show.label.costume') + ' ' + (gi + k + 1)) + '"></div>';
      }).join('') + '</div>';
      var more = t.photos.length > (gi + 6) ? '<button class="tmore" data-filter="' + t.key + '">' + esc(T('show.viewMorePhotos')) + '</button>' : '';
      h += '<div class="tblock"><div class="th"><h4>' + esc(t.name) + '</h4></div>' +
        '<div class="tb">' + feat + '<div class="side">' + grid + more + '</div></div></div>';
    });

    /* Некатегоризированные костюмы — отдельный блок */
    if (W.other.length) {
      var oname = W.otherLabel;
      var ofeat = '<div class="feat" data-gallery="other" data-gi="0"><div class="vw"><img loading="lazy" src="' + W.other[0] + '" alt="' + altOf(stName, oname) + '"></div>' +
        '<span class="vlbl">' + esc(oname) + '</span></div>';
      var ogrid = '<div class="mini-grid">' + W.other.slice(1, 7).map(function (p, k) {
        return '<div class="cell" data-gallery="other" data-gi="' + (1 + k) + '"><img loading="lazy" src="' + p + '" alt="' +
          altOf(stName, oname, T('show.label.costume') + ' ' + (1 + k + 1)) + '"></div>';
      }).join('') + '</div>';
      var omore = W.other.length > 7 ? '<button class="tmore" data-filter="other">' + esc(T('show.viewMorePhotos')) + '</button>' : '';
      h += '<div class="tblock"><div class="th"><h4>' + esc(oname) + '</h4></div>' +
        '<div class="tb">' + ofeat + '<div class="side">' + ogrid + omore + '</div></div></div>';
    }

    /* 3. Browse all + фильтр по темам */
    var groups = [];
    W.themes.forEach(function (t) { if (t.photos.length) groups.push({ token: t.key, label: t.name, photos: t.photos }); });
    W.stars.forEach(function (st) { if (st.photos.length) groups.push({ token: st.key, label: st.name, photos: st.photos }); });
    if (W.other.length) groups.push({ token: 'other', label: W.otherLabel, photos: W.other });
    var ALL = [];
    groups.forEach(function (g) { g.photos.forEach(function (p) { ALL.push({ src: p, token: g.token, label: g.label }); }); });

    h += '<div id="browse-all" style="margin-top:clamp(40px,6vh,64px)"><div class="th" style="margin-bottom:16px">' +
      '<h4 style="font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:clamp(22px,2.8vw,36px);margin:0">' + esc(T('show.browseCostumes')) + '</h4>' +
      '<span class="cnt" id="stCount" style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-left:14px">' + esc(T('show.shown', { n: ALL.length })) + '</span></div>';
    h += '<div class="filters" id="stFilters">' +
      groups.map(function (g) { return '<button class="fl" data-tag="' + g.token + '">' + esc(g.label) + '<span class="n">' + g.photos.length + '</span></button>'; }).join('') +
      '<button class="clr" id="stClear">' + esc(T('show.clear')) + '</button></div>';
    h += '<div class="gridc" id="stGrid">' + ALL.map(function (x, i) {
      return '<div class="cell" data-gallery="browse" data-gi="' + i + '" data-tags="' + x.token + '">' +
        '<img loading="lazy" src="' + x.src + '" alt="' + altOf(stName, x.label) + '">' +
        '<div class="tg"><span>' + esc(x.label) + '</span></div></div>';
    }).join('') + '</div>';
    h += '<div class="emptymsg" id="stEmpty" style="display:none">' + esc(T('show.emptyCostumes')) + '</div></div>';

    return h + '</div></section>';
  }

  /* ----- клики / галереи / фильтр ----- */
  function galleryFor(g) {
    var W = SS.stilts;
    if (g === 'other') return { photos: W.other, name: T('show.label.character') };
    if (g === 'browse') {
      var ph = [];
      W.themes.forEach(function (t) { t.photos.forEach(function (p) { ph.push(p); }); });
      W.stars.forEach(function (st) { st.photos.forEach(function (p) { ph.push(p); }); });
      W.other.forEach(function (p) { ph.push(p); });
      return { photos: ph, name: T('show.label.costume') };
    }
    var parts = g.split(':'), arr = parts[0] === 'star' ? W.stars : W.themes;
    return arr.filter(function (x) { return x.key === parts[1]; })[0] || null;
  }

  function wirePage(id, s) {
    var photoLbl = T('show.label.photo'), costumeLbl = T('show.label.costume');
    var photoList = s.media.photos.map(function (p, i) { return { img: p, label: s.name + ' · ' + photoLbl + ' ' + (i + 1) }; });
    var costList = s.media.costumes.map(function (c, i) { return { img: c, label: costumeLbl + ' ' + (i + 1) }; });

    page.querySelectorAll('[data-video]').forEach(function (el) {
      el.addEventListener('click', function () { LB.openVideo(el.getAttribute('data-video'), el.getAttribute('data-vlabel')); });
    });
    page.querySelectorAll('[data-localvideo]').forEach(function (el) {
      el.addEventListener('click', function () { LB.openLocal(el.getAttribute('data-localvideo'), el.getAttribute('data-vlabel')); });
    });
    page.querySelectorAll('[data-photo]').forEach(function (el) {
      el.addEventListener('click', function () { LB.openList(photoList, +el.getAttribute('data-photo')); });
    });
    page.querySelectorAll('[data-costume]').forEach(function (el) {
      el.addEventListener('click', function () { LB.openList(costList, +el.getAttribute('data-costume')); });
    });
    page.querySelectorAll('[data-gallery]').forEach(function (el) {
      el.addEventListener('click', function () {
        var f = galleryFor(el.getAttribute('data-gallery')); if (!f || !f.photos) return;
        LB.openList(f.photos.map(function (p, i) { return { img: p, label: f.name + ' ' + (i + 1) }; }), +(el.getAttribute('data-gi') || 0));
      });
    });
    var fThemes = s.media.themes || [];
    page.querySelectorAll('[data-firetheme]').forEach(function (el) {
      el.addEventListener('click', function () {
        var key = el.getAttribute('data-firetheme'), nm = el.getAttribute('data-fname') || s.name;
        var t = fThemes.filter(function (x) { return x.key === key; })[0];
        if (!t || !t.photos.length) return;
        LB.openList(t.photos.map(function (p, i) { return { img: p, label: nm + ' · ' + photoLbl + ' ' + (i + 1) }; }), 0);
      });
    });
    if (fThemes.length && s.detail.variants && s.detail.variants.kind === 'themes') {
      var fbList = fireBrowse(s).ALL.map(function (x, i) { return { img: x.src, label: x.label + ' · ' + photoLbl + ' ' + (i + 1) }; });
      page.querySelectorAll('[data-firegallery]').forEach(function (el) {
        el.addEventListener('click', function () { LB.openList(fbList, +(el.getAttribute('data-firegallery') || 0)); });
      });
    }
    var worldEls = page.querySelectorAll('[data-world]'), wn = worldEls.length;
    worldEls.forEach(function (el) {
      el.addEventListener('click', function () {
        var wi = +el.getAttribute('data-world'), start = Math.floor(wi * photoList.length / wn);
        LB.openList(photoList, Math.min(start, photoList.length - 1));
      });
    });
    page.querySelectorAll('.railbox').forEach(function (box) {
      var rail = box.querySelector('.vrail'); if (!rail) return;
      box.querySelectorAll('.rnav').forEach(function (btn) {
        btn.addEventListener('click', function () {
          rail.scrollBy({ left: (btn.classList.contains('l') ? -1 : 1) * rail.clientWidth * 0.85, behavior: 'smooth' });
        });
      });
    });
    page.querySelectorAll('[data-go]').forEach(function (el) {
      el.addEventListener('click', function () { go(el.getAttribute('data-go')); });
    });

    /* фильтр костюмов ходулистов */
    var filters = document.getElementById('stFilters');
    if (filters) {
      var active = [], grid = document.getElementById('stGrid'), count = document.getElementById('stCount'), empty = document.getElementById('stEmpty');
      function apply() {
        var shown = 0;
        grid.querySelectorAll('.cell').forEach(function (c) {
          var tags = (c.getAttribute('data-tags') || '').split(' ');
          var ok = active.length === 0 || active.some(function (a) { return tags.indexOf(a) >= 0; });
          c.classList.toggle('hide', !ok); if (ok) shown++;
        });
        count.textContent = T('show.shown', { n: shown });
        empty.style.display = shown ? 'none' : 'block';
      }
      function syncBtns() { filters.querySelectorAll('.fl').forEach(function (b) { b.classList.toggle('on', active.indexOf(b.getAttribute('data-tag')) >= 0); }); }
      filters.querySelectorAll('.fl').forEach(function (b) {
        b.addEventListener('click', function () {
          var t = b.getAttribute('data-tag'), k = active.indexOf(t);
          if (k >= 0) active.splice(k, 1); else active.push(t);
          syncBtns(); apply();
        });
      });
      document.getElementById('stClear').addEventListener('click', function () { active = []; syncBtns(); apply(); });
      page.querySelectorAll('.tmore').forEach(function (b) {
        b.addEventListener('click', function () {
          active = [b.getAttribute('data-filter')]; syncBtns(); apply();
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }

  /* ----- scrollspy для sub-nav ----- */
  function wireSpy(nav) {
    var links = document.querySelectorAll('#subnav a');
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('data-sec') === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    nav.forEach(function (n) { var el = document.getElementById(n.href); if (el) obs.observe(el); });
  }

  /* ----- header + меню + история ----- */
  function init() {
    var topbar = document.getElementById('topbar'), totop = document.getElementById('totop');
    addEventListener('scroll', function () {
      topbar.classList.toggle('solid', scrollY > 40);
      totop.classList.toggle('on', scrollY > window.innerHeight);
    }, { passive: true });
    totop.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };

    /* ссылки меню — настоящие href на файлы шоу (для поисковиков и
       «открыть в новой вкладке»); клик перехватываем для SPA-перехода */
    function navLink(id) {
      return '<a data-id="' + id + '" href="' + SS.url(id) + '">' + esc(SS.show(id).nav) + '</a>';
    }
    var shownav = document.getElementById('shownav');
    shownav.innerHTML = SS.order.map(navLink).join('') +
      '<a class="process" href="index.html#howwe">' + esc(T('nav.about')) + '</a>';
    shownav.querySelectorAll('a[data-id]').forEach(function (a) { wireShowLink(a); });

    /* мобильное меню — те же шоу + About + Book */
    var mob = document.getElementById('mobmenu'), nb = document.getElementById('navBtn');
    if (mob) {
      mob.innerHTML = SS.order.map(navLink).join('') +
        '<a href="index.html#howwe">' + esc(T('nav.about')) + '</a>' +
        '<a class="m-book" href="#book">' + esc(T('cta.book')) + '</a>';
      function closeMenu() { document.body.classList.remove('nav-open'); if (nb) nb.setAttribute('aria-expanded', 'false'); }
      mob.querySelectorAll('a[data-id]').forEach(function (a) { wireShowLink(a, closeMenu); });
      mob.querySelectorAll('a:not([data-id])').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
      if (nb) nb.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        nb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      /* тап мимо меню (не по панели и не по бургеру) — закрыть */
      document.addEventListener('click', function (e) {
        if (!document.body.classList.contains('nav-open')) return;
        if (e.target.closest('#mobmenu') || (nb && e.target.closest('#navBtn'))) return;
        closeMenu();
      });
    }

    window.addEventListener('popstate', function (e) {
      var id = (e.state && e.state.show) || SS.idByPage(location.pathname) ||
        new URLSearchParams(location.search).get('show') || 'dragon';
      go(SS.show(id) ? id : 'dragon', false);
    });

    var startId = currentId();
    history.replaceState({ show: startId }, '', location.href);
    go(startId, false);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
