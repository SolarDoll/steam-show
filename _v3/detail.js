/* ============================================================
   STEAM SHOW — полноэкранный разворот подстранички шоу
   Открывает show-detail.html?show=<id>&embed=1 во весь экран
   с FLIP-разворотом (clip-path) из кликнутой карточки.

   · Переопределяет SS.openProgram (макеты на lib.js: kinetic, marquee,
     fireflow, hero-плитки hybrid).
   · Сам навешивает клик на [data-prog] (kinetic-full — у него нет lib.js).
   · API: window.SSDetail.open(id)
   Закрытие: × · Esc · сообщение 'ss-close' из iframe (кнопка All shows).
   ============================================================ */
(function(){
  var CSS = ''
    + '.ssd-ov{position:fixed;inset:0;z-index:9000;background:#0b0712;visibility:hidden;'
    +   'clip-path:inset(0 0 0 0);will-change:clip-path}'
    + '.ssd-ov.show{visibility:visible}'
    + '.ssd-ov.animating{transition:clip-path .55s cubic-bezier(.22,.65,.2,1)}'
    + '.ssd-frame{width:100%;height:100%;border:0;display:block;background:#0b0712}'
    + '.ssd-x{position:fixed;top:14px;right:16px;z-index:9100;width:46px;height:46px;border-radius:50%;'
    +   'border:1px solid rgba(255,255,255,.22);background:rgba(0,0,0,.5);backdrop-filter:blur(8px);'
    +   'color:#fff;font-size:24px;line-height:1;cursor:pointer;opacity:0;transition:opacity .3s .15s;'
    +   'display:grid;place-items:center}'
    + '.ssd-ov.show .ssd-x{opacity:1}'
    + '.ssd-x:hover{background:#FF2E84;color:#160405;border-color:transparent}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var ov, frame, btn, isOpen = false, lastRect = null;

  function ensure(){
    if(ov) return;
    ov = document.createElement('div'); ov.className = 'ssd-ov';
    ov.innerHTML = '<iframe class="ssd-frame" title="Show detail"></iframe>'
      + '<button class="ssd-x" aria-label="Close">×</button>';
    document.body.appendChild(ov);
    frame = ov.querySelector('.ssd-frame');
    btn = ov.querySelector('.ssd-x');
    btn.addEventListener('click', close);
  }

  function insetFromRect(r){
    if(!r) return 'inset(12vh 18vw 12vh 18vw round 16px)';
    var t = Math.max(0, r.top), l = Math.max(0, r.left),
        rt = Math.max(0, window.innerWidth - r.right),
        b = Math.max(0, window.innerHeight - r.bottom);
    return 'inset(' + t + 'px ' + rt + 'px ' + b + 'px ' + l + 'px round 16px)';
  }

  function open(id){
    if(!id) return;
    ensure();
    frame.src = 'show-detail.html?show=' + id + '&embed=1';
    ov.classList.remove('animating');
    ov.style.clipPath = insetFromRect(lastRect);
    ov.classList.add('show');
    ov.getBoundingClientRect();                  // force reflow
    ov.classList.add('animating');
    ov.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
    document.body.style.overflow = 'hidden';
    isOpen = true;
  }

  function close(){
    if(!isOpen) return;
    ov.classList.add('animating');
    ov.style.clipPath = insetFromRect(lastRect);
    document.body.style.overflow = '';
    isOpen = false;
    var done = function(e){
      if(e && e.propertyName !== 'clip-path') return;
      ov.classList.remove('show','animating');
      frame.src = 'about:blank';
      ov.removeEventListener('transitionend', done);
    };
    ov.addEventListener('transitionend', done);
  }

  /* запоминаем геометрию кликнутой карточки для разворота */
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-id],[data-prog]');
    if(el) lastRect = el.getBoundingClientRect();
  }, true);

  /* kinetic-full: карточки помечены data-prog и не имеют своего обработчика */
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-prog]');
    if(el){ e.preventDefault(); open(el.getAttribute('data-prog')); }
  });

  /* закрытие по сообщению из iframe (кнопка «All shows» в embed-режиме) */
  window.addEventListener('message', function(e){ if(e.data === 'ss-close') close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen) close(); });

  /* перехватываем openProgram у общего модуля (lib.js) */
  if(window.SS) window.SS.openProgram = open;
  window.SSDetail = { open: open, close: close };
})();
