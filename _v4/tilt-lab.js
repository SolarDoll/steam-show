/* ============================================================
   STEAM SHOW — Tilt-ряд + разворот информации «на странице»
   Требует media.js (window.SS_DATA). Самодостаточно (не тянет lib.js).

   Две оси:
     · МЕХАНИКА:  'expand' | 'drawer' | 'split'   — как разворачивается обзор
     · МОДЕЛЬ:    'full'   | 'teaser' | 'hybrid'  — как соотносится с show-detail
   Использование:  TiltLab.init('<mode>')
   ============================================================ */
(function(){
  var DATA = window.SS_DATA || {shows:{}};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var ytThumb = function(id){return 'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';};
  var ytEmbed = function(id){return 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1';};

  var SHOWS = {
    dragon:{name:'Dragon Fire Show',type:'Flagship · fire',desc:'Our signature act — a colossal, flame-breathing dragon built from fire, smoke and light. Scales from intimate galas to festival main stages.'},
    fire:{name:'Fire Show',type:'Classic · fire',desc:'Large-scale fire choreography in three visual worlds — fantasy, post-apocalyptic and rock — tailored to your event.'},
    ledfire:{name:'LED Fire Show',type:'Hybrid · fire + light',desc:'The best of both — live fire performed in glowing LED costumes. The heat of fire with the colour of light.'},
    led:{name:'LED Show',type:'Electric · light',desc:'A fully luminous, smoke-free spectacle. A deep catalogue of LED costumes — pick the looks that fit your venue.'},
    stilts:{name:'Stilt Walkers',type:'Roaming · giants',desc:'A wardrobe of towering characters, performed as roaming animation or a full stilt performance.'}
  };
  var ORDER = ['dragon','fire','ledfire','led','stilts'];
  var TAGS = {
    dragon:['Mechanical dragon','Live fire','Headliner'],
    fire:['Fantasy','Post-apoc','Rock'],
    ledfire:['LED suits','Live fire','Hybrid'],
    led:['Pure light','Indoor','Many looks'],
    stilts:['Roaming','Giants','Full show']
  };
  var CVAR = {dragon:'--c-dragon',fire:'--c-fire',ledfire:'--c-ledfire',led:'--c-led',stilts:'--c-stilts'};
  /* «богатые» шоу — те, у кого в show-detail своя структура (themes/catalogue/wardrobe) */
  var RICH = {fire:1,led:1,stilts:1};
  function detailURL(id){return 'show-detail.html?show='+id+'&embed=1'+(window.SS_THEME?'&theme='+encodeURIComponent(window.SS_THEME):'');}

  function d(id){return DATA.shows[id] || {photos:[],costumes:[],videos:[]};}
  function photos(id){return d(id).photos || [];}
  function cover(id){var p=photos(id);return p[0] || (d(id).videos[0]?ytThumb(d(id).videos[0]):'');}
  function counts(id){var x=d(id);return {p:x.photos.length,v:x.videos.length,c:x.costumes.length};}
  function num(i){return '0'+(i+1);}
  function cvar(id){return 'var('+CVAR[id]+')';}
  function tagsLI(id){return TAGS[id].map(function(t){return '<li>'+t+'</li>';}).join('');}

  /* медиа-список шоу для галереи/лайтбокса (видео → костюмы → фото) */
  function media(id){
    var s=SHOWS[id],x=d(id),out=[];
    x.videos.forEach(function(v,i){out.push({video:true,yt:v,img:ytThumb(v),label:s.name+' — video '+(i+1)});});
    x.costumes.forEach(function(src,i){out.push({img:src,label:'Costume '+(i+1)});});
    x.photos.forEach(function(src,i){out.push({img:src,label:s.name+' — photo '+(i+1)});});
    return out;
  }
  function statsHTML(id){
    var c=counts(id),out='<span><b>'+c.p+'</b> photos</span><span><b>'+c.v+'</b> videos</span>';
    if(c.c)out+='<span><b>'+c.c+'</b> costumes</span>';
    return out;
  }

  /* ---------- Tilt-ряд ---------- */
  function rowHTML(badgeFn){
    return '<div class="tilt-row">'+ORDER.map(function(id,i){
      var s=SHOWS[id], badge=badgeFn?badgeFn(id):'';
      return '<article class="tcard" data-id="'+id+'" style="--c:'+cvar(id)+'">'
        +'<div class="ph"><img loading="lazy" src="'+cover(id)+'" alt="'+s.name+'"></div>'
        +'<div class="grad"></div>'
        +'<div class="top"><span class="num">'+num(i)+'</span><span class="type">'+s.type+'</span></div>'
        +'<div class="info">'+badge+'<h3>'+s.name+'</h3><ul class="tags">'+tagsLI(id)+'</ul>'
        +'<button class="vm">View more →</button></div></article>';
    }).join('')+'</div>';
  }
  function reveal(box){
    var els=box.querySelectorAll('.tcard');
    if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
    var io=new IntersectionObserver(function(es){es.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.15});
    els.forEach(function(e,i){e.style.transitionDelay=(Math.min(i,5)*70)+'ms';io.observe(e);});
  }

  /* ============================================================
     ЛАЙТБОКС (общий)
     ============================================================ */
  var LB,lbStage,lbCap,lbIdx,LIST=[],POS=0;
  function buildLB(){
    if(LB)return;
    LB=document.createElement('div');LB.className='tl-lb';
    LB.innerHTML='<button class="tl-x">×</button>'
      +'<button class="tl-arr l">‹</button><button class="tl-arr r">›</button>'
      +'<div class="bx"><div class="stage"></div><div class="cap"><span class="c"></span><span class="i"></span></div></div>';
    document.body.appendChild(LB);
    lbStage=LB.querySelector('.stage');lbCap=LB.querySelector('.c');lbIdx=LB.querySelector('.i');
    LB.querySelector('.tl-x').onclick=lbClose;
    LB.querySelector('.tl-arr.l').onclick=function(){lbStep(-1);};
    LB.querySelector('.tl-arr.r').onclick=function(){lbStep(1);};
    LB.addEventListener('click',function(e){if(e.target===LB)lbClose();});
    document.addEventListener('keydown',function(e){
      if(!LB.classList.contains('on'))return;
      if(e.key==='Escape')lbClose();if(e.key==='ArrowRight')lbStep(1);if(e.key==='ArrowLeft')lbStep(-1);});
  }
  function lbPaint(){
    var x=LIST[POS]||{};
    if(x.video&&x.yt)lbStage.innerHTML='<iframe src="'+ytEmbed(x.yt)+'" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>';
    else lbStage.innerHTML='<img src="'+(x.img||'')+'" alt="">';
    lbCap.textContent=x.label||'';lbIdx.textContent=(POS+1)+' / '+LIST.length;
  }
  function lbOpen(list,i){LIST=list;POS=i;lbPaint();LB.classList.add('on');}
  function lbStep(dir){if(!LIST.length)return;POS=(POS+dir+LIST.length)%LIST.length;lbPaint();}
  function lbClose(){LB.classList.remove('on');setTimeout(function(){lbStage.innerHTML='';},250);}

  function galHTML(id,n){
    return media(id).slice(0,n).map(function(x,i){
      return '<div class="cell'+(x.video?' v':'')+'" data-id="'+id+'" data-i="'+i+'">'
        +'<img loading="lazy" src="'+x.img+'" alt=""></div>';
    }).join('');
  }
  function wireGal(scope){
    scope.querySelectorAll('.cell[data-id]').forEach(function(c){
      c.addEventListener('click',function(e){
        e.stopPropagation();
        lbOpen(media(c.getAttribute('data-id')),+c.getAttribute('data-i'));
      });
    });
  }

  /* обзорный контент панели (lead + статы + галерея), опционально CTA в show-detail */
  function overviewHTML(id,withCta){
    var s=SHOWS[id];
    return '<div class="exp-body"><p class="exp-lead">'+s.desc+'</p>'
      +'<div class="exp-stats">'+statsHTML(id)+'</div>'
      +(withCta?'<a class="exp-cta" href="'+detailURL(id)+'">Open full show page →</a>':'')
      +'<div class="exp-gtitle">Gallery</div>'
      +'<div class="exp-gal">'+galHTML(id,8)+'</div></div>';
  }

  /* ============================================================
     ФАБРИКА EXPAND (FLIP: карточка → большая панель)
     fillFn(id) -> innerHTML панели; afterFill(panel,id) -> доп. wiring
     ============================================================ */
  function makeExpand(row, fillFn, afterFill, panelClass){
    var scrim=document.createElement('div');scrim.className='tl-scrim';document.body.appendChild(scrim);
    var panel=document.createElement('div');panel.className='exp-panel'+(panelClass?' '+panelClass:'');document.body.appendChild(panel);
    var openCard=null;

    function centerXY(){
      return {x:(window.innerWidth-panel.offsetWidth)/2,y:(window.innerHeight-panel.offsetHeight)/2};
    }
    function open(card){
      var id=card.getAttribute('data-id');
      openCard=card;
      panel.style.setProperty('--c',cvar(id));
      panel.innerHTML='<button class="exp-x" aria-label="close">×</button>'+fillFn(id);
      panel.querySelector('.exp-x').onclick=close;
      if(afterFill)afterFill(panel,id);
      row.classList.add('dim');card.classList.add('is-open');
      scrim.classList.add('on');
      panel.classList.remove('animating','ready');
      panel.classList.add('show');
      panel.style.transform='none';
      var w=panel.offsetWidth, h=panel.offsetHeight;
      var first=card.getBoundingClientRect(), c=centerXY();
      panel.style.transform='translate('+first.left+'px,'+first.top+'px) scale('+(first.width/w)+','+(first.height/h)+')';
      panel.getBoundingClientRect();
      panel.classList.add('animating');
      panel.style.transform='translate('+c.x+'px,'+c.y+'px)';
      panel.addEventListener('transitionend',function te(e){
        if(e.propertyName!=='transform')return;
        panel.classList.add('ready');panel.removeEventListener('transitionend',te);
      });
      document.body.style.overflow='hidden';
    }
    function close(){
      if(!openCard)return;
      var first=openCard.getBoundingClientRect();
      var w=panel.offsetWidth, h=panel.offsetHeight;
      panel.classList.remove('ready');panel.classList.add('animating');
      panel.style.transform='translate('+first.left+'px,'+first.top+'px) scale('+(first.width/w)+','+(first.height/h)+')';
      scrim.classList.remove('on');
      panel.addEventListener('transitionend',function te(e){
        if(e.propertyName!=='transform')return;
        panel.classList.remove('show','animating');panel.style.transform='none';
        panel.innerHTML='';panel.removeEventListener('transitionend',te);
        row.classList.remove('dim');if(openCard)openCard.classList.remove('is-open');openCard=null;
      });
      document.body.style.overflow='';
    }
    scrim.addEventListener('click',close);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&openCard)close();});
    window.addEventListener('resize',function(){if(openCard)close();});
    return {open:open,close:close,isOpen:function(){return !!openCard;}};
  }

  /* ---------- МЕХАНИКА A: Expand (обзор) ---------- */
  function initExpand(mount){
    mount.innerHTML=rowHTML();
    var row=mount.querySelector('.tilt-row');reveal(row);
    var ex=makeExpand(row,
      function(id){var s=SHOWS[id];
        return '<div class="exp-hero"><img src="'+cover(id)+'" alt=""><div class="g"></div>'
          +'<div class="cap"><div class="type">'+s.type+'</div><h2>'+s.name+'</h2></div></div>'
          +overviewHTML(id,false);},
      function(panel){wireGal(panel);});
    row.addEventListener('click',function(e){var c=e.target.closest('.tcard');if(c)ex.open(c);});
  }

  /* ============================================================
     МОДЕЛЬ «FULL» — весь show-detail внутри растущей панели (iframe)
     ============================================================ */
  function initFull(mount){
    mount.innerHTML=rowHTML();
    var row=mount.querySelector('.tilt-row');reveal(row);
    var ex=makeExpand(row,
      function(id){
        return '<iframe class="exp-frame" src="'+detailURL(id)+'" title="'+SHOWS[id].name+'"></iframe>';
      }, null, 'is-full');
    row.addEventListener('click',function(e){var c=e.target.closest('.tcard');if(c)ex.open(c);});
  }

  /* ============================================================
     МОДЕЛЬ «HYBRID» — простые шоу разворачиваются, богатые → show-detail
     ============================================================ */
  function initHybrid(mount){
    mount.innerHTML=rowHTML(function(id){
      return RICH[id]
        ? '<span class="rich-badge">↗ Full page</span>'
        : '<span class="rich-badge lite">Quick view</span>';
    });
    var row=mount.querySelector('.tilt-row');reveal(row);
    var ex=makeExpand(row,
      function(id){var s=SHOWS[id];
        return '<div class="exp-hero"><img src="'+cover(id)+'" alt=""><div class="g"></div>'
          +'<div class="cap"><div class="type">'+s.type+'</div><h2>'+s.name+'</h2></div></div>'
          +overviewHTML(id,false);},
      function(panel){wireGal(panel);});
    row.addEventListener('click',function(e){
      var c=e.target.closest('.tcard');if(!c)return;
      var id=c.getAttribute('data-id');
      if(RICH[id]) window.location.href=detailURL(id);   // богатое шоу — на полную страницу
      else ex.open(c);                                    // простое — разворот на месте
    });
  }

  /* ============================================================
     МЕХАНИКА B: Drawer (панель под рядом).  opts.cta -> кнопка в show-detail
     ============================================================ */
  function initDrawer(mount, opts){
    opts=opts||{};
    mount.innerHTML=rowHTML()
      +'<div class="drawer"><div class="inner"><div class="drawer-card"></div></div></div>';
    var row=mount.querySelector('.tilt-row');
    var drawer=mount.querySelector('.drawer');
    var dcard=mount.querySelector('.drawer-card');
    reveal(row);
    var curId=null;

    function fill(id){
      var s=SHOWS[id];
      dcard.style.setProperty('--c',cvar(id));
      dcard.innerHTML='<div class="drawer-grid">'
        +'<div class="drawer-media"><img src="'+cover(id)+'" alt=""><div class="g"></div></div>'
        +'<div class="drawer-txt"><div class="type">'+s.type+'</div><h2>'+s.name+'</h2>'
        +'<p class="lead">'+s.desc+'</p><ul class="tags">'+tagsLI(id)+'</ul>'
        +'<div class="drawer-stats">'+statsHTML(id)+'</div>'
        +(opts.cta?'<a class="exp-cta" href="'+detailURL(id)+'">Open full show page →</a>':'')
        +'<div class="drawer-thumbs">'+galHTML(id,5)+'</div></div></div>';
      wireGal(dcard);
    }
    function openId(id,card){
      row.querySelectorAll('.tcard').forEach(function(c){c.classList.remove('active');});
      if(curId===id){drawer.classList.remove('open');curId=null;return;}
      card.classList.add('active');fill(id);drawer.classList.add('open');curId=id;
      setTimeout(function(){var r=drawer.getBoundingClientRect();
        if(r.top<0||r.bottom>window.innerHeight)drawer.scrollIntoView({behavior:'smooth',block:'center'});},260);
    }
    row.addEventListener('click',function(e){
      var card=e.target.closest('.tcard');if(!card)return;
      openId(card.getAttribute('data-id'),card);});
  }

  /* ============================================================
     МЕХАНИКА C: Split / Spotlight (master-detail на месте)
     ============================================================ */
  function initSplit(mount){
    mount.innerHTML=rowHTML()
      +'<div class="split-view"><button class="sv-back">← all shows</button>'
      +'<div class="sv-grid"><div class="sv-hero" id="svHero"></div>'
      +'<div class="sv-detail" id="svDetail"></div></div>'
      +'<div class="sv-rail" id="svRail"></div></div>';
    var row=mount.querySelector('.tilt-row');
    var view=mount.querySelector('.split-view');
    var hero=mount.querySelector('#svHero');
    var detail=mount.querySelector('#svDetail');
    var rail=mount.querySelector('#svRail');
    reveal(row);

    rail.innerHTML=ORDER.map(function(id,i){var s=SHOWS[id];
      return '<div class="mini" data-id="'+id+'" style="--c:'+cvar(id)+'">'
        +'<img loading="lazy" src="'+cover(id)+'" alt=""><span class="n">'+num(i)+'</span>'
        +'<span class="lab">'+s.name+'</span></div>';}).join('');

    function setShow(id){
      var s=SHOWS[id],i=ORDER.indexOf(id);
      view.style.setProperty('--c',cvar(id));hero.style.setProperty('--c',cvar(id));
      hero.innerHTML='<img class="on" src="'+cover(id)+'" alt=""><div class="g"></div>'
        +'<div class="cap"><div class="type">'+num(i)+' · '+s.type+'</div><h2>'+s.name+'</h2></div>';
      detail.innerHTML='<p class="lead">'+s.desc+'</p>'
        +'<div class="sv-stats">'+statsHTML(id)+'</div>'
        +'<div class="sv-gtitle">Gallery</div><div class="sv-gal">'+galHTML(id,6)+'</div>';
      wireGal(detail);
      rail.querySelectorAll('.mini').forEach(function(m){m.classList.toggle('on',m.getAttribute('data-id')===id);});
    }
    function openSplit(id){setShow(id);row.classList.add('hide');view.classList.add('on');
      mount.scrollIntoView({behavior:'smooth',block:'start'});}
    function closeSplit(){view.classList.remove('on');row.classList.remove('hide');}

    row.addEventListener('click',function(e){var c=e.target.closest('.tcard');if(c)openSplit(c.getAttribute('data-id'));});
    rail.addEventListener('click',function(e){var m=e.target.closest('.mini');if(m)setShow(m.getAttribute('data-id'));});
    view.querySelector('.sv-back').addEventListener('click',closeSplit);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&view.classList.contains('on'))closeSplit();});
  }

  /* ---------- public ---------- */
  window.TiltLab={
    init:function(mode){
      buildLB();
      var mount=document.getElementById('tiltMount');
      if(!mount)return;
      if(mode==='drawer')        initDrawer(mount);
      else if(mode==='teaser')   initDrawer(mount,{cta:true});
      else if(mode==='split')    initSplit(mount);
      else if(mode==='full')     initFull(mount);
      else if(mode==='hybrid')   initHybrid(mount);
      else                       initExpand(mount);
    }
  };
})();
