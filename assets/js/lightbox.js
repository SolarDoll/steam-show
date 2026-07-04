/* ============================================================
   STEAM SHOW — LIGHTBOX (общий модуль, самовнедряемый)
   Одно окно для всех медиа: список фото, YouTube, локальное видео.
   Стили тема-независимы (берут цвета из CSS-переменных страницы).
   API (window.LB):
     LB.openList(items, startIndex)   items: {img}|{yt,label}|{file,label}
     LB.openVideo(ytId, label)        — один YouTube-ролик (напр. showreel)
     LB.openLocal(fileUrl, label)     — один локальный mp4
     LB.step(dir) · LB.close()
   ============================================================ */
(function () {
  var ytEmbed = function (id) {
    return 'https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
  };

  var css =
    '.lb{position:fixed;inset:0;z-index:9500;background:rgba(4,3,7,.95);backdrop-filter:blur(8px);' +
    'display:none;align-items:center;justify-content:center;padding:clamp(16px,4vw,48px)}' +
    '.lb.on{display:flex}' +
    '.lb .bx{width:min(1080px,100%)}' +
    '.lb .stage{aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#000}' +
    '.lb .stage img{width:100%;height:100%;object-fit:contain}' +
    '.lb .stage iframe,.lb .stage video{width:100%;height:100%;border:0;object-fit:contain;background:#000}' +
    '.lb .cap{display:flex;justify-content:space-between;gap:16px;margin-top:13px;font-size:14px;color:var(--muted,#a89fb0)}' +
    '.lb .x{position:absolute;top:18px;right:22px;font-size:32px;color:#fff;cursor:pointer;background:none;border:none;line-height:1}' +
    '.lb .arr{position:absolute;top:50%;transform:translateY(-50%);font-size:44px;color:rgba(255,255,255,.65);' +
    'cursor:pointer;background:none;border:none;padding:16px;transition:color .2s}' +
    '.lb .arr:hover{color:#fff}.lb .arr.l{left:4px}.lb .arr.r{right:4px}' +
    '.lb .arr[hidden]{display:none}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML =
    '<button class="x" aria-label="Close">×</button>' +
    '<button class="arr l" aria-label="Previous">‹</button>' +
    '<button class="arr r" aria-label="Next">›</button>' +
    '<div class="bx"><div class="stage"></div>' +
    '<div class="cap"><span class="cap-label"></span><span class="cap-idx"></span></div></div>';

  function mount() { document.body.appendChild(lb); }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  var stage = lb.querySelector('.stage'),
      capL = lb.querySelector('.cap-label'),
      capI = lb.querySelector('.cap-idx'),
      arrL = lb.querySelector('.arr.l'),
      arrR = lb.querySelector('.arr.r');

  var list = [], pos = 0;

  function paint() {
    var x = list[pos] || {};
    if (x.file) stage.innerHTML = '<video src="' + x.file + '" controls autoplay playsinline></video>';
    else if (x.yt) stage.innerHTML = '<iframe src="' + ytEmbed(x.yt) + '" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>';
    else stage.innerHTML = '<img src="' + (x.img || '') + '" alt="' + (x.label || '') + '">';
    capL.textContent = x.label || '';
    var multi = list.length > 1;
    capI.textContent = multi ? (pos + 1) + ' / ' + list.length : '';
    arrL.hidden = arrR.hidden = !multi;
  }

  function open() { lb.classList.add('on'); document.body.style.overflow = 'hidden'; }

  var LB = {
    openList: function (items, i) { list = items || []; pos = i || 0; paint(); open(); },
    openVideo: function (yt, label) { list = [{ yt: yt, label: label || '' }]; pos = 0; paint(); open(); },
    openLocal: function (file, label) { list = [{ file: file, label: label || '' }]; pos = 0; paint(); open(); },
    step: function (dir) { if (!list.length) return; pos = (pos + dir + list.length) % list.length; paint(); },
    close: function () {
      lb.classList.remove('on'); document.body.style.overflow = '';
      setTimeout(function () { stage.innerHTML = ''; }, 220);
    }
  };

  lb.querySelector('.x').addEventListener('click', LB.close);
  arrL.addEventListener('click', function () { LB.step(-1); });
  arrR.addEventListener('click', function () { LB.step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) LB.close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') LB.close();
    else if (e.key === 'ArrowRight') LB.step(1);
    else if (e.key === 'ArrowLeft') LB.step(-1);
  });

  window.LB = LB;
})();
