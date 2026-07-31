/* ============================================================
   STEAM SHOW — site.js (поведение главной)
   Рендерит ряды программ и jump-навигацию из window.SS
   (единый источник данных) + вся «магия»: фон, spine, эмберы,
   reveal, бегущий скролл, видео-превью по видимости, контакты.
   Подключать ПОСЛЕ data.js и lightbox.js.
   ============================================================ */
(function () {
  var SS = window.SS;
  if (!SS) { console.error('[SS] data.js не загружен'); return; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var HERO_VIDEO = (window.SS_MEDIA && SS_MEDIA.hero && SS_MEDIA.hero.video) || '';
  var esc = SS.esc;
  var num = function (i) { return '0' + (i + 1); };
  /* постер превью: на узких экранах отдаём мелкую копию (-640). Постер виден
     мгновение до старта видео — полноразмерный там не нужен. Наличие копии
     проверяем по карте из srcset.js (там же ширины). */
  var SMALL = window.SS_SRCSET || {};
  function posterFor(id) {
    var p = SS.cover(id);
    if (!p || !SMALL[p] || window.innerWidth > 700) return p;
    return p.slice(0, -4) + '-640.jpg';
  }
  var T = window.T || function (k) { return k; };
  function specLabel(k) { var key = 'spec.' + k.toLowerCase(), t = T(key); return t === key ? k : t; }

  /* ---------------- рендер рядов программ ---------------- */
  function specsLI(specs) {
    return Object.keys(specs).map(function (k) {
      return '<li><span class="sk">' + esc(specLabel(k)) + '</span><span class="sv">' + esc(specs[k]) + '</span></li>';
    }).join('');
  }
  function rowHTML(id, i) {
    var s = SS.show(id), c = s.card;
    var video = s.media.video || HERO_VIDEO;
    var poster = posterFor(id);
    return '<article class="row reveal' + (i % 2 ? ' alt' : '') + '" id="p-' + id + '" style="--ac:' + s.color + '">' +
      '<div class="media" data-show="' + id + '" role="button" tabindex="0" aria-label="' + esc(T('ui.open') + ' ' + s.name) + '">' +
        '<span class="num">' + num(i) + '</span>' +
        (video ? '<video muted loop playsinline preload="none" poster="' + poster + '"><source src="' + video + '" type="video/mp4"></video>'
               : '<img loading="lazy" src="' + poster + '" alt="' + esc(s.name) + '">') +
        '<div class="openbar"><span>' + esc(s.name) + '</span><span class="go">' + esc(T('ui.viewMoreArrow')) + '</span></div>' +
      '</div>' +
      '<div class="copy">' +
        '<p class="kind">' + esc(c.kind) + '</p><h3>' + esc(s.name) + '</h3>' +
        '<p class="desc">' + esc(c.desc) + '</p>' +
        '<ul class="specs">' + specsLI(c.specs) + '</ul>' +
        '<ul class="tags">' + c.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<button class="open" data-show="' + id + '">' + esc(T('ui.viewMore')) + ' <span class="ar">→</span></button>' +
      '</div>' +
    '</article>';
  }
  function renderPrograms() {
    var box = document.getElementById('progList');
    if (box) box.innerHTML = SS.order.map(rowHTML).join('');
  }

  /* мобильная бенто-плитка: видео + инфа поверх (первое шоу — крупное) */
  function bentoHTML(id, i) {
    var s = SS.show(id);
    var video = s.media.video || HERO_VIDEO;
    var poster = posterFor(id);
    /* на плитке — только название шоу, без под-заголовка (kind) */
    return '<article class="pb-tile' + (i === 0 ? ' big' : '') + '" data-show="' + id + '" style="--c:' + s.color + '" role="button" tabindex="0" aria-label="' + esc(T('ui.open') + ' ' + s.name) + '">' +
      (video ? '<video muted loop playsinline preload="none" poster="' + poster + '"><source src="' + video + '" type="video/mp4"></video>'
             : '<img loading="lazy" src="' + poster + '" alt="' + esc(s.name) + '">') +
      '<span class="pb-num">' + num(i) + '</span>' +
      '<div class="pb-meta"><h3>' + esc(s.name) + '</h3></div>' +
    '</article>';
  }
  function renderBento() {
    var box = document.getElementById('progBento');
    if (box) box.innerHTML = SS.order.map(bentoHTML).join('');
  }

  /* ---------------- бегущая строка (из словаря) ---------------- */
  function mountTicker() {
    var items = (window.T && window.T('ticker')) || [];
    if (!Array.isArray(items) || !items.length) return;
    var track = document.getElementById('tickerTrack'); if (!track) return;
    var one = items.map(function (t) { return '<b>' + esc(t) + '</b>'; }).join('');
    track.innerHTML = one + one;  /* дубль для бесшовной прокрутки */
  }

  /* ---------------- страны (из словаря) + пилюля «+ Европа» ---------------- */
  function mountGeo() {
    var box = document.getElementById('geoList'); if (!box) return;
    var countries = (window.T && window.T('world.countries')) || [];
    var html = (Array.isArray(countries) ? countries : []).map(function (c) {
      return '<span class="geo-pill">' + esc(c) + '</span>';
    }).join('');
    html += '<span class="geo-pill world">' + esc(T('world.geo.more')) + '</span>';
    box.innerHTML = html;
  }

  /* ---------------- форматы: список + «табло» ---------------- */
  function mountFormats() {
    var formats = (window.T && window.T('world.formats')) || [];
    if (!Array.isArray(formats) || !formats.length) return;
    var list = document.getElementById('fmtList');
    if (list) list.innerHTML = formats.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('');
    var word = document.getElementById('worldWord');
    if (!word) return;
    word.textContent = formats[0];
    if (reduce || formats.length < 2) return;
    var i = 0;
    setInterval(function () {
      word.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % formats.length;
        word.textContent = formats[i];
        word.classList.remove('out');
      }, 400);
    }, 2600);
  }

  /* ---------------- jump-навигация ---------------- */
  function renderTabs() {
    var box = document.getElementById('jumpTabs');
    if (!box) return;
    box.innerHTML = SS.order.map(function (id, i) {
      var s = SS.show(id);
      return '<a href="#p-' + id + '" data-jump="p-' + id + '" style="--c:' + s.color + '">' +
        '<span class="cn">' + num(i) + '</span><span class="cnm">' + esc(s.nav) + '</span></a>';
    }).join('');
  }

  /* ---------------- переход на страницу шоу ----------------
     Адрес берём из SS.url (единый источник, см. data.js): у каждого шоу
     свой файл. Статические href в разметке дублируют это для поисковиков,
     здесь же они уточняются текущим языком. */
  function openShow(id) { if (id) location.href = SS.url(id); }
  /* href на ссылках-шоу: с текущим ?lang, чтобы переход не сбрасывал язык */
  function wireShowHrefs() {
    document.querySelectorAll('a[data-show]').forEach(function (a) {
      a.setAttribute('href', SS.url(a.getAttribute('data-show')));
    });
  }

  /* ---------------- jump → скролл + «fill race» ---------------- */
  function hexA(hex, a) {
    hex = hex.replace('#', ''); var n = parseInt(hex, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function jumpFX(targetId, tab) {
    var row = document.getElementById(targetId); if (!row) return;
    var ac = tab && tab.style.getPropertyValue('--c').trim() || '#FF6A1F';
    if (!reduce) { fillRace(row, ac); flashRow(row, ac); }
    row.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function fillRace(row, ac) {
    var s = document.getElementById('spine'), vis = s && s.offsetHeight > 0;
    var r = vis ? s.getBoundingClientRect() : null;
    var sx = vis ? r.left : 22, sTop = vis ? r.top : 0, sH = vis ? r.height : window.innerHeight;
    var docH = document.documentElement.scrollHeight || 1;
    var frac = Math.max(0, Math.min(1, (row.getBoundingClientRect().top + scrollY) / docH));
    var endH = Math.max(40, frac * sH);
    var fill = document.createElement('div');
    fill.style.cssText = 'position:fixed;z-index:9998;pointer-events:none;left:' + sx + 'px;top:' + sTop + 'px;width:4px;' +
      'height:' + endH + 'px;transform:scaleY(0);transform-origin:top;border-radius:2px;' +
      'background:linear-gradient(180deg,' + hexA(ac, .2) + ',' + ac + ');box-shadow:0 0 18px ' + ac;
    document.body.appendChild(fill);
    var cap = document.createElement('div');
    cap.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;left:-5px;top:-5px;width:11px;height:11px;' +
      'border-radius:50%;background:#fff;box-shadow:0 0 18px ' + ac + ',0 0 34px ' + hexA(ac, .6) + ';' +
      'transform:translate(' + (sx + 2) + 'px,' + sTop + 'px)';
    document.body.appendChild(cap);
    fill.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 820, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    cap.animate([{ transform: 'translate(' + (sx + 2) + 'px,' + sTop + 'px)' }, { transform: 'translate(' + (sx + 2) + 'px,' + (sTop + endH) + 'px)' }],
      { duration: 820, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    setTimeout(function () {
      fill.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).onfinish = function () { fill.remove(); };
      cap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).onfinish = function () { cap.remove(); };
    }, 900);
  }
  function flashRow(row, ac) {
    var m = row.querySelector('.media'); if (!m) return;
    m.animate([
      { boxShadow: '0 0 0 0 ' + hexA(ac, 0) },
      { boxShadow: '0 0 0 3px ' + ac + ', 0 0 34px ' + hexA(ac, .6) },
      { boxShadow: '0 0 0 0 ' + hexA(ac, 0) }
    ], { duration: 1400, delay: 520, easing: 'ease-out' });
  }

  /* ---------------- эмберы ---------------- */
  function seedEmbers() {
    if (reduce) return;
    var box = document.getElementById('embers'); if (!box) return;
    var n = window.innerWidth < 700 ? 16 : 30;
    for (var i = 0; i < n; i++) {
      var e = document.createElement('span'); e.className = 'ember';
      e.style.left = (Math.random() * 100) + '%';
      var dur = 8 + Math.random() * 12;
      e.style.animationDuration = dur + 's';
      e.style.animationDelay = (-Math.random() * dur) + 's';
      e.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      e.style.transform = 'scale(' + (0.6 + Math.random() * 1.8) + ')';
      box.appendChild(e);
    }
  }

  /* ---------------- spine ---------------- */
  function buildSpine() {
    var spine = document.getElementById('spine'), fill = document.getElementById('spineFill');
    if (!spine) return null;
    var nodes = [];
    document.querySelectorAll('[data-spine]').forEach(function (t) {
      var n = document.createElement('div'); n.className = 'spine__node'; spine.appendChild(n);
      nodes.push({ el: n, target: t });
    });
    function place() {
      var docH = document.documentElement.scrollHeight;
      nodes.forEach(function (o) { o.el.style.top = ((o.target.getBoundingClientRect().top + window.scrollY) / docH * 100) + '%'; });
    }
    place();
    window.addEventListener('resize', place, { passive: true });
    window.addEventListener('load', place);
    return { nodes: nodes, fill: fill };
  }

  /* ---------------- hero-видео: подключаем источник из JS ----------------
     В разметке у <video> только постер и data-src. Грузим, лишь если это
     уместно: без экономии трафика и без prefers-reduced-motion. */
  function wireHeroVideo() {
    var v = document.querySelector('.mh__video');
    if (!v || !v.getAttribute('data-src')) return;
    if (reduce || SS.lightMode()) return;          /* остаётся постер */
    var s = document.createElement('source');
    s.type = 'video/mp4';
    s.src = v.getAttribute('data-src');
    v.appendChild(s);
    v.load();
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }

  /* ---------------- видео-превью: играем только видимые ---------------- */
  function wireVideos() {
    var vids = document.querySelectorAll('.row .media video, .pb-tile video');
    /* экономный режим — превью не грузим, остаётся постер */
    if (!vids.length || reduce || SS.lightMode() || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.dataset.loaded) { v.load(); v.dataset.loaded = '1'; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: .25 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------------- init ---------------- */
  function init() {
    renderPrograms();
    renderBento();
    renderTabs();
    wireShowHrefs();
    var cg = document.getElementById('contactGrid');
    if (cg) { cg.innerHTML = SS.contactHTML(); SS.fitContactValues(); }
    mountTicker();
    mountGeo();
    mountFormats();

    /* делегированные клики */
    document.addEventListener('click', function (e) {
      var jump = e.target.closest('[data-jump]');
      if (jump) { e.preventDefault(); jumpFX(jump.getAttribute('data-jump'), jump); return; }
      var show = e.target.closest('[data-show]');
      if (show) {
        /* Ctrl/Cmd/Shift/средняя кнопка на ссылке — пусть браузер откроет
           в новой вкладке сам, не перехватываем */
        if (show.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return;
        e.preventDefault(); openShow(show.getAttribute('data-show')); return;
      }
    });
    /* клавиатура для jump/media (role=button/link) */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target.closest('[data-jump],[data-show]'); if (!el) return;
      e.preventDefault();
      if (el.hasAttribute('data-jump')) jumpFX(el.getAttribute('data-jump'), el);
      else openShow(el.getAttribute('data-show'));
    });

    seedEmbers();
    wireHeroVideo();
    wireVideos();
    var spine = buildSpine();

    /* reveal */
    if (reduce || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
      document.querySelectorAll('.reveal').forEach(function (el, i) {
        el.style.transitionDelay = (Math.min(i % 6, 6) * 55) + 'ms'; io.observe(el);
      });
    }

    /* скролл: прогресс + sky --p + spine + header */
    var prog = document.getElementById('prog'), sky = document.getElementById('sky'), bar = document.querySelector('header.bar');
    var hint = document.getElementById('scrollHint');
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (prog) prog.style.width = (p * 100) + '%';
        if (sky) sky.style.setProperty('--p', p.toFixed(4));
        if (bar) bar.classList.toggle('scrolled', window.scrollY > 40);
        if (hint) hint.classList.toggle('hidden', window.scrollY > 40);
        if (spine) {
          if (spine.fill && !reduce) spine.fill.style.height = (p * 100) + '%';
          var litTo = window.scrollY + window.innerHeight * 0.5;
          spine.nodes.forEach(function (o) {
            o.el.classList.toggle('lit', litTo >= o.target.getBoundingClientRect().top + window.scrollY);
          });
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    /* мобильное меню (бургер) */
    var nb = document.getElementById('navBtn'), menu = document.querySelector('nav.menu');
    if (nb && menu) {
      function setMenu(open) {
        document.body.classList.toggle('nav-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        nb.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      nb.addEventListener('click', function () { setMenu(!document.body.classList.contains('nav-open')); });
      menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
      /* Esc закрывает меню */
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
      /* тап мимо меню (не по панели и не по бургеру) — закрыть */
      document.addEventListener('click', function (e) {
        if (!document.body.classList.contains('nav-open')) return;
        if (e.target.closest('nav.menu') || e.target.closest('#navBtn')) return;
        setMenu(false);
      });
    }

    /* при reduced-motion hero-видео вообще не подключается — см. wireHeroVideo */

    var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
