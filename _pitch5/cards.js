/* ============================================================
   STEAM SHOW — _pitch5 рендер карточек + «движение» + canvas-эмберы
   Требует media.js + lib.js (window.SS) и parts.js.
   <div data-cards="poster|bento|stripes|rows|preview|showcase|tilt"
        data-media="static|cycle|video"></div>
   ============================================================ */
(function(){
  var SS=window.SS;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var HERO='../assets/web/hero/hero.mp4';
  var CVAR={dragon:'--c-dragon',fire:'--c-fire',ledfire:'--c-ledfire',led:'--c-led',stilts:'--c-stilts'};
  var TAGS={
    dragon:['Mechanical dragon','Live fire','Headliner'],
    fire:['Fantasy','Post-apoc','Rock'],
    ledfire:['LED suits','Live fire','Hybrid'],
    led:['Pure light','Indoor','Many looks'],
    stilts:['Roaming','Giants','Full show']
  };
  function ph(id){return (SS.data(id).photos||[]).slice(0,5);}
  function num(i){return '0'+(i+1);}
  function tagsLI(id){return TAGS[id].map(function(t){return '<li>'+t+'</li>';}).join('');}
  function vm(id,cls){return '<button class="vm'+(cls?' '+cls:'')+'" data-id="'+id+'">View more →</button>';}

  function mediaHTML(id,mode){
    var imgs=ph(id),cover=imgs[0]||SS.cover(id),name=SS.SHOWS[id].name;
    if(mode==='cycle'){
      return '<div class="media">'+imgs.map(function(s,i){
        return '<img'+(i===0?' class="on"':'')+' loading="lazy" src="'+s+'" alt="'+name+'">';}).join('')+'</div>';
    }
    if(mode==='video'){
      return '<div class="media"><img loading="lazy" src="'+cover+'" alt="'+name+'">'
        +'<video class="vid" muted loop playsinline preload="none" poster="'+cover+'"><source src="'+HERO+'" type="video/mp4"></video>'
        +'<span class="vbadge">▶ video</span></div>';
    }
    return '<div class="media"><img loading="lazy" src="'+cover+'" alt="'+name+'"></div>';
  }

  /* overlay-карточка (poster / bento / tilt / preview) */
  function overlay(id,i,mode){
    var s=SS.SHOWS[id];
    return '<article class="ocard" data-id="'+id+'" style="--c:var('+CVAR[id]+')">'
      +mediaHTML(id,mode)+'<div class="grad"></div>'
      +'<div class="top"><span class="num">'+num(i)+'</span><span class="type">'+s.type+'</span></div>'
      +'<div class="info"><h3>'+s.name+'</h3><ul class="tags">'+tagsLI(id)+'</ul>'+vm(id)+'</div></article>';
  }
  function renderOverlay(box,mode){box.innerHTML=SS.ORDER.map(function(id,i){return overlay(id,i,mode);}).join('');}

  function renderStripes(box,mode){
    box.innerHTML=SS.ORDER.map(function(id,i){
      var s=SS.SHOWS[id];
      return '<article class="stripe-card" data-id="'+id+'" style="--c:var('+CVAR[id]+')">'
        +mediaHTML(id,mode)+'<div class="sgrad"></div>'
        +'<div class="stripe-inner"><div class="stripe-num">'+num(i)+'</div>'
        +'<div class="stripe-body"><div class="type">'+s.type+'</div><h3>'+s.name+'</h3>'
        +'<ul class="tags">'+tagsLI(id)+'</ul>'+vm(id)+'</div></div></article>';
    }).join('');
  }

  function renderRows(box,mode){
    box.classList.remove('cards-rows');box.classList.add('cards-rows2');
    box.innerHTML=SS.ORDER.map(function(id,i){
      var s=SS.SHOWS[id];
      return '<article class="row2'+(i%2?' alt':'')+'" data-id="'+id+'" style="--c:var('+CVAR[id]+')">'
        +'<div class="r-media" data-id="'+id+'">'+mediaHTML(id,mode)+'</div>'
        +'<div class="r-copy"><p class="kind">'+num(i)+' · '+s.type+'</p><h3>'+s.name+'</h3>'
        +'<p class="desc">'+s.desc+'</p><ul class="tags">'+tagsLI(id)+'</ul>'+vm(id)+'</div></article>';
    }).join('');
  }

  function renderShowcase(box,mode){
    var feat='<div class="sc-feature" id="scFeat"><div class="simg">'
      +SS.ORDER.map(function(id,i){return '<img'+(i===0?' class="on"':'')+' data-i="'+i+'" loading="lazy" src="'+SS.cover(id)+'" alt="">';}).join('')
      +'</div><div class="grad"></div><div class="cap"><span class="num" id="scNum"></span><h3 id="scTitle"></h3><ul class="tags" id="scTags"></ul><button class="vm" id="scVm">View more →</button></div></div>';
    var list='<div class="sc-list">'+SS.ORDER.map(function(id,i){var s=SS.SHOWS[id];
      return '<div class="sc-item'+(i===0?' on':'')+'" data-id="'+id+'" data-i="'+i+'" style="--c:var('+CVAR[id]+')">'
        +'<span class="si">'+num(i)+'</span><h4>'+s.name+'</h4><span class="st">'+s.type+'</span><span class="go">→</span></div>';}).join('')+'</div>';
    box.innerHTML=feat+list;
    var imgs=box.querySelectorAll('.sc-feature .simg img'),items=box.querySelectorAll('.sc-item');
    var n=box.querySelector('#scNum'),t=box.querySelector('#scTitle'),tg=box.querySelector('#scTags'),f=box.querySelector('#scFeat'),b=box.querySelector('#scVm');
    function set(i){
      imgs.forEach(function(im){im.classList.toggle('on',+im.getAttribute('data-i')===i);});
      items.forEach(function(it){it.classList.toggle('on',+it.getAttribute('data-i')===i);});
      var id=SS.ORDER[i],s=SS.SHOWS[id];
      f.style.setProperty('--c','var('+CVAR[id]+')');b.style.setProperty('--c','var('+CVAR[id]+')');
      n.textContent=num(i)+' · '+s.type;t.textContent=s.name;tg.innerHTML=tagsLI(id);f.setAttribute('data-id',id);
    }
    set(0);
    items.forEach(function(it){var i=+it.getAttribute('data-i');
      it.addEventListener('mouseenter',function(){set(i);});
      it.addEventListener('click',function(){SS.openProgram(it.getAttribute('data-id'));});});
    function openFeat(){if(f.getAttribute('data-id'))SS.openProgram(f.getAttribute('data-id'));}
    f.addEventListener('click',openFeat);
  }

  function startCycle(box){
    if(reduce)return;
    box.querySelectorAll('.media').forEach(function(m,ci){
      var imgs=m.querySelectorAll('img');if(imgs.length<2)return;var idx=0;
      setInterval(function(){imgs[idx].classList.remove('on');idx=(idx+1)%imgs.length;imgs[idx].classList.add('on');},3200+ci*250);
    });
  }
  function wireVideo(box){
    var vids=box.querySelectorAll('video');
    if(!vids.length||reduce||!('IntersectionObserver' in window))return;
    // авто-проигрывание, пока карточка в зоне видимости (как «движущиеся превью»)
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      var v=e.target,card=v.closest('.ocard,.stripe-card,.r-media')||v.parentElement;
      if(e.isIntersecting){
        if(!v.dataset.loaded){v.load();v.dataset.loaded='1';}
        try{var p=v.play();if(p&&p.catch)p.catch(function(){});}catch(err){}
        card.classList.add('is-playing');
      }else{v.pause();card.classList.remove('is-playing');}
    });},{threshold:.25});
    vids.forEach(function(v){io.observe(v);});
  }

  /* настоящие иконки приложений (SVG, цвет наследуется от бейджа) */
  var ICONS={
    instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5.4"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none"/></svg>',
    email:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.6 7.6 12 13l8.4-5.4"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 3.5 17.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.8.8-2.5-.2-.3A8 8 0 0 1 12 4Zm-2.7 4c-.2 0-.5 0-.7.4-.2.4-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.9 4.5 3.9 2.2.8 2.7.7 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.1-.7.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.7-.3-.4.3-.4.8-1.3.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.4-.4-.6-.4Z"/></svg>',
    youtube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="4.6"/><path d="M10.4 9.1 15.2 12l-4.8 2.9Z" fill="currentColor" stroke="none"/></svg>'
  };
  function injectIcons(){
    document.querySelectorAll('.chic[data-ic],.ic[data-ic]').forEach(function(el){
      var k=el.getAttribute('data-ic');if(ICONS[k])el.innerHTML=ICONS[k];
    });
  }
  function reveal(box){
    var els=box.querySelectorAll('.ocard,.stripe-card,.row2');
    if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.12});
    els.forEach(function(e,i){e.style.transitionDelay=(Math.min(i,5)*70)+'ms';io.observe(e);});
  }

  function init(){
    document.querySelectorAll('[data-cards]').forEach(function(box){
      var type=box.getAttribute('data-cards'),mode=box.getAttribute('data-media')||'static';
      box.classList.add('cards-'+type);
      if(type==='stripes')renderStripes(box,mode);
      else if(type==='rows')renderRows(box,mode);
      else if(type==='showcase')renderShowcase(box,mode);
      else renderOverlay(box,mode);          // poster / bento / tilt / preview
      if(mode==='cycle')startCycle(box);
      if(mode==='video')wireVideo(box);
      reveal(box);
      if(type!=='showcase'){
        box.addEventListener('click',function(e){var t=e.target.closest('[data-id]');if(t)SS.openProgram(t.getAttribute('data-id'));});
      }
    });
    injectIcons();

    /* canvas-эмберы */
    var cv=document.getElementById('emberCanvas');
    if(cv&&!reduce){
      var ctx=cv.getContext('2d'),W,H,parts=[];
      function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
      size();addEventListener('resize',size);
      var COL=['#FF6A1F','#FF3D2E','#FFC53D','#FF2E9A'],N=Math.min(70,Math.floor(innerWidth/22));
      for(var i=0;i<N;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.6,s:Math.random()*.5+.2,
        d:Math.random()*.6-.3,c:COL[(Math.random()*COL.length)|0],a:Math.random()*.5+.25,tw:Math.random()*6.28});
      (function tick(){ctx.clearRect(0,0,W,H);
        for(var i=0;i<parts.length;i++){var p=parts[i];p.y-=p.s;p.x+=p.d;p.tw+=.03;
          if(p.y<-10){p.y=H+10;p.x=Math.random()*W;}
          ctx.beginPath();ctx.fillStyle=p.c;ctx.globalAlpha=p.a*(.6+.4*Math.sin(p.tw));
          ctx.shadowColor=p.c;ctx.shadowBlur=8;ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();}
        ctx.globalAlpha=1;ctx.shadowBlur=0;requestAnimationFrame(tick);})();
    }
    var glow=document.querySelector('.fireglow');
    if(glow){var onScroll=function(){var h=document.documentElement.scrollHeight-window.innerHeight;
      var p=h>0?window.scrollY/h:0;glow.style.opacity=Math.min(1,Math.max(0,(p-0.12)/0.7));};
      onScroll();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);}
  }
  if(document.readyState!=='loading')init();
  else document.addEventListener('DOMContentLoaded',init);
})();
