/* ============================================================
   STEAM SHOW — responsive.js
   Навешивает srcset/sizes на ленивые галерейные <img> ПОСЛЕ рендера
   (не трогая render-логику show.js). Картинки галерей — loading="lazy"
   и лежат ниже сгиба, поэтому не начинают грузиться до применения
   srcset — двойной загрузки нет.
   Данные — window.SS_SRCSET (assets/js/srcset.js): путь -> [ширина_sm, ширина_оригинала].
   Подключать ПОСЛЕ srcset.js.
   ============================================================ */
(function () {
  var M = window.SS_SRCSET || {};

  /* ширина слота под каждый тип сетки — чтобы браузер выбрал верный размер */
  function sizesFor(img) {
    if (img.closest('.gallery')) return '(max-width:680px) 46vw, (max-width:1000px) 31vw, 23vw';
    if (img.closest('.mini-grid')) return '(max-width:820px) 24vw, 12vw';
    if (img.closest('.gridc')) return '(max-width:540px) 47vw, (max-width:900px) 31vw, 18vw';
    if (img.closest('.world,.star,.feat,.vcard')) return '(max-width:820px) 92vw, 45vw';
    return '100vw';
  }

  function upgrade(img) {
    if (img.dataset.rs) return;
    var src = img.getAttribute('src') || '';
    var rec = M[src];
    if (!rec) return;
    var sm = src.slice(0, -4) + '-640.jpg';
    img.setAttribute('srcset', sm + ' ' + rec[0] + 'w, ' + src + ' ' + rec[1] + 'w');
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
    (root || document).querySelectorAll('img[loading="lazy"][src^="assets/web/"]').forEach(upgrade);
  }

  var host = document.getElementById('page') || document.body;
  if ('MutationObserver' in window) {
    new MutationObserver(function () { scan(host); }).observe(host, { childList: true, subtree: true });
  }
  scan();  // первый рендер уже в DOM (show.js отработал раньше)
})();
