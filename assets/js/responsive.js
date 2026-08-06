/* ============================================================
   STEAM SHOW — responsive.js
   Навешивает srcset/sizes на ленивые галерейные <img> ПОСЛЕ рендера
   (не трогая render-логику show.js). Картинки галерей — loading="lazy"
   и лежат ниже сгиба, поэтому не начинают грузиться до применения
   srcset — двойной загрузки нет.
   Данные — window.SS_SRCSET (assets/js/srcset.js): путь ->
   [ширина_sm, ширина_оригинала, высота_оригинала, есть_avif_sm, есть_avif_полной].

   Оба варианта отдаём в AVIF (на фото это вдвое легче JPEG), если браузер его
   понимает; иначе — прежний JPEG. Поддержку проверяем загрузкой 1×1
   картинки: это единственный надёжный способ (canvas-детект для AVIF
   не работает). Проверка занимает единицы миллисекунд, а картинки
   лежат ниже сгиба, поэтому ждать её безопасно.
   Подключать ПОСЛЕ srcset.js.
   ============================================================ */
(function () {
  var M = window.SS_SRCSET || {};
  var AVIF = false;

  /* Ширина слота под каждый тип сетки — по ней браузер выбирает вариант.
     Потолок в пикселях обязателен: .wrap ограничен 1240px, поэтому на
     широком мониторе ячейка перестаёт расти вместе с окном. Без потолка
     браузер считает слот вдвое шире настоящего и на экранах с высокой
     плотностью тянет полноразмерное фото туда, где хватает копии 640px.
     Числа — ширина ячейки при развёрнутом .wrap, с запасом вверх:
     отдать чуть крупнее не страшно, отдать мельче — это видимое мыло. */
  function sizesFor(img) {
    if (img.closest('.gallery,.gridc')) return '(max-width:540px) 47vw, (max-width:900px) 31vw, min(18vw, 230px)';
    if (img.closest('.mini-grid')) return '(max-width:820px) 24vw, min(12vw, 155px)';
    if (img.closest('.feat')) return '(max-width:820px) 92vw, min(55vw, 690px)';
    if (img.closest('.vcard')) return '(max-width:820px) 92vw, min(40vw, 460px)';
    if (img.closest('.world,.star')) return '(max-width:860px) 92vw, min(31vw, 385px)';
    return '100vw';
  }

  function upgrade(img) {
    if (img.dataset.rs) return;
    var src = img.getAttribute('src') || '';
    var rec = M[src];
    if (!rec) return;
    var base = src.slice(0, -4);
    var sm = (AVIF && rec[3]) ? base + '-640.avif' : base + '-640.jpg';
    /* полный размер — тоже AVIF, если он есть и браузер его понимает:
       на крупные слоты и на экраны с высокой плотностью уходит именно он */
    var big = (AVIF && rec[4]) ? base + '.avif' : src;
    img.setAttribute('srcset', sm + ' ' + rec[0] + 'w, ' + big + ' ' + rec[1] + 'w');
    img.setAttribute('sizes', sizesFor(img));
    /* пропорции заранее: в масонри-галерее (.gallery) высота не задана в CSS,
       и без width/height страница скачет по мере подгрузки фото. Там, где CSS
       ставит height:100% (сетки .cell), атрибуты ни на что не влияют. */
    if (rec[2] && !img.getAttribute('width')) {
      img.setAttribute('width', rec[1]);
      img.setAttribute('height', rec[2]);
    }
    img.dataset.rs = '1';
  }

  function scan(root) {
    (root || document).querySelectorAll('img[loading="lazy"][src^="/assets/web/"]').forEach(upgrade);
  }

  var host = document.getElementById('page') || document.body;

  function start() {
    if ('MutationObserver' in window) {
      new MutationObserver(function () { scan(host); }).observe(host, { childList: true, subtree: true });
    }
    scan();  // первый рендер уже в DOM (show.js отработал раньше)
  }

  /* 1×1 AVIF: onload — формат понятен, onerror — нет.
     Результат кладём в window.SS_AVIF: тем же детектом пользуется лайтбокс,
     чтобы открывать фото в AVIF, а не гонять вторую проверку. */
  var probe = new Image();
  probe.onload = function () { AVIF = window.SS_AVIF = probe.width === 1; start(); };
  probe.onerror = function () { start(); };
  probe.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAIQAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAKW1kYXQSAAoIGAAGiAhoNCAyExxHh4Xd0000wsAAAJA1jjx+iFA=';
})();
