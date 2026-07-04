/* ============================================================
   STEAM SHOW — переход на отдельную страницу шоу (итерация 4)
   Вместо iframe-оверлея с FLIP-разворотом (как в _v3) клик по
   шоу-карточке ведёт на самостоятельную страницу
   show-detail.html?show=<id>&theme=<макет-носитель>.

   · Переопределяет SS.openProgram (макеты на lib.js: kinetic, marquee,
     fireflow, hero-плитки hybrid).
   · Сам навешивает клик на [data-prog] (kinetic-full — у него нет lib.js).
   · API: window.SSDetail.open(id)
   Возврат «All shows» внутри страницы делает history.back() (см. show-detail.html).
   ============================================================ */
(function(){
  function open(id){
    if(!id) return;
    location.href = 'show-detail.html?show=' + encodeURIComponent(id)
      + (window.SS_THEME ? '&theme=' + encodeURIComponent(window.SS_THEME) : '');
  }

  /* kinetic-full: карточки помечены data-prog и не имеют своего обработчика */
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-prog]');
    if(el){ e.preventDefault(); open(el.getAttribute('data-prog')); }
  });

  /* перехватываем openProgram у общего модуля (lib.js) */
  if(window.SS) window.SS.openProgram = open;
  window.SSDetail = { open: open, close: function(){} };
})();
