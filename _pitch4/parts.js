/* ============================================================
   STEAM SHOW — _pitch4 общее поведение + рендер карточек шоу
   Требует media.js + lib.js (window.SS) ПЕРЕД этим файлом.
   Карточки рендерятся в контейнер [data-programs="rows|glow|reel"].
   ============================================================ */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var SS = window.SS;

  /* цвет-токены по программам */
  var CVAR = {dragon:'--c-dragon',fire:'--c-fire',ledfire:'--c-ledfire',led:'--c-led',stilts:'--c-stilts'};
  var TAGS = {
    dragon:['Mechanical dragon','Live fire','Headliner'],
    fire:['Flame cubes','Fire fans','Fire-breathing'],
    ledfire:['LED suits','Live fire','Hybrid'],
    led:['Pure light','Indoor-ready','Many looks'],
    stilts:['Roaming','Full show','Dozens of looks']
  };
  var BADGE = {dragon:'★ Signature',fire:'Classic',ledfire:'◆ LED + Fire',led:'◆ LED',stilts:'Roaming'};

  /* ---------- рендер карточек ---------- */
  function renderRows(box){
    box.innerHTML = SS.ORDER.map(function(id,i){
      var s=SS.SHOWS[id];
      return '<article class="prow reveal" style="--c:var('+CVAR[id]+')" data-id="'+id+'">'
        +'<div class="info"><span class="idx">0'+(i+1)+' / '+s.type+'</span>'
        +'<h3>'+s.name+'</h3>'
        +'<div class="tags">'+TAGS[id].map(function(t){return '<span>'+t+'</span>';}).join('')+'</div>'
        +'<button class="open" data-id="'+id+'">Open gallery →</button></div>'
        +'<div class="pic" data-id="'+id+'"><img loading="lazy" src="'+SS.cover(id)+'" alt="'+s.name+'"></div>'
        +'</article>';
    }).join('');
  }
  function renderGlow(box){
    box.innerHTML = SS.ORDER.map(function(id,i){
      var s=SS.SHOWS[id];
      return '<article class="gcard reveal" style="--c:var('+CVAR[id]+')" data-id="'+id+'">'
        +'<div class="gcard-in">'
        +'<div class="gcard-art"><img loading="lazy" src="'+SS.cover(id)+'" alt="'+s.name+'"><span class="glyph">0'+(i+1)+'</span></div>'
        +'<span class="badge">'+BADGE[id]+'</span>'
        +'<h3>'+s.name+'</h3>'
        +'<p>'+s.desc+'</p>'
        +'<div class="ptag">'+TAGS[id].join(' · ')+'</div>'
        +'</div></article>';
    }).join('');
  }
  function renderReel(box){
    box.innerHTML = SS.ORDER.map(function(id,i){
      var s=SS.SHOWS[id],c=SS.counts(id);
      var meta = '<span>'+c.p+' photos</span>'+(c.v?'<span>'+c.v+' videos</span>':'')+(c.c?'<span>'+c.c+' looks</span>':'');
      return '<article class="frame reveal" data-id="'+id+'">'
        +'<img loading="lazy" src="'+SS.cover(id)+'" alt="'+s.name+'">'
        +'<span class="num">0'+(i+1)+' / 05</span>'
        +'<span class="badge'+(id==='dragon'?' sig':'')+'">'+s.type+'</span>'
        +'<h3>'+s.name+'</h3><p>'+s.desc+'</p>'
        +'<div class="meta">'+meta+'</div></article>';
    }).join('');
  }

  function wireOpen(scope){
    scope.addEventListener('click',function(e){
      var t=e.target.closest('[data-id]');
      if(t && SS && SS.openProgram) SS.openProgram(t.getAttribute('data-id'));
    });
  }

  /* ---------- горизонтальная лента: стрелки + drag ---------- */
  function wireReel(section){
    var track=section.querySelector('.reel');
    if(!track) return;
    var prev=section.querySelector('.arrow.prev'), next=section.querySelector('.arrow.next');
    var prog=section.querySelector('.reel-prog'), cur=section.querySelector('.reel-cur');
    var frames=track.querySelectorAll('.frame');
    function step(){return frames[0].offsetWidth+2;}
    function update(){
      var max=track.scrollWidth-track.clientWidth;
      var ratio=max>0?track.scrollLeft/max:0;
      var idx=Math.round(track.scrollLeft/step());idx=Math.max(0,Math.min(frames.length-1,idx));
      if(cur)cur.textContent=idx+1;
      if(prog)prog.style.width=(20+ratio*80)+'%';
      if(prev)prev.disabled=track.scrollLeft<=2;
      if(next)next.disabled=track.scrollLeft>=max-2;
    }
    function by(d){track.scrollBy({left:d*step(),behavior:reduce?'auto':'smooth'});}
    if(next)next.addEventListener('click',function(){by(1);});
    if(prev)prev.addEventListener('click',function(){by(-1);});
    track.addEventListener('scroll',function(){requestAnimationFrame(update);});
    var down=false,sx=0,ss=0,moved=false;
    track.addEventListener('mousedown',function(e){down=true;moved=false;track.classList.add('dragging');sx=e.pageX;ss=track.scrollLeft;});
    window.addEventListener('mousemove',function(e){if(!down)return;var dx=e.pageX-sx;if(Math.abs(dx)>4)moved=true;track.scrollLeft=ss-dx;});
    window.addEventListener('mouseup',function(){if(!down)return;down=false;track.classList.remove('dragging');});
    track.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();}},true);
    window.addEventListener('resize',update);update();
  }

  /* ---------- embers ---------- */
  function seedEmbers(){
    if(reduce) return;
    var box=document.getElementById('embers'); if(!box) return;
    var n=window.innerWidth<700?16:30;
    for(var i=0;i<n;i++){
      var e=document.createElement('span');e.className='ember';
      e.style.left=(Math.random()*100)+'%';
      var dur=8+Math.random()*12;
      e.style.animationDuration=dur+'s';e.style.animationDelay=(-Math.random()*dur)+'s';
      e.style.setProperty('--dx',(Math.random()*80-40)+'px');
      var s=.6+Math.random()*1.8;e.style.transform='scale('+s+')';
      box.appendChild(e);
    }
  }

  /* ---------- spine: узлы напротив секций ---------- */
  function buildSpine(){
    var spine=document.getElementById('spine'),fill=document.getElementById('spineFill');
    if(!spine) return null;
    var nodes=[];
    document.querySelectorAll('[data-spine]').forEach(function(t){
      var n=document.createElement('div');n.className='spine__node';spine.appendChild(n);
      nodes.push({el:n,target:t});
    });
    function place(){
      var docH=document.documentElement.scrollHeight;
      nodes.forEach(function(o){var top=o.target.getBoundingClientRect().top+window.scrollY;o.el.style.top=(top/docH*100)+'%';});
    }
    place();window.addEventListener('resize',place,{passive:true});window.addEventListener('load',place);
    return {nodes:nodes,fill:fill,place:place};
  }

  /* ---------- init ---------- */
  function init(){
    // карточки
    document.querySelectorAll('[data-programs]').forEach(function(box){
      var st=box.getAttribute('data-programs');
      if(st==='rows')renderRows(box);
      else if(st==='glow')renderGlow(box);
      else if(st==='reel')renderReel(box);
      wireOpen(box);
    });
    document.querySelectorAll('[data-reel]').forEach(wireReel);

    seedEmbers();
    var spine=buildSpine();

    // reveal
    var io;
    if(reduce || !('IntersectionObserver' in window)){
      document.querySelectorAll('.reveal,.prow,.gcard,.frame').forEach(function(el){el.classList.add('in');});
    }else{
      io=new IntersectionObserver(function(es){es.forEach(function(en){
        if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},
        {threshold:.14,rootMargin:'0px 0px -6% 0px'});
      document.querySelectorAll('.reveal,.prow,.gcard,.frame').forEach(function(el,i){
        el.style.transitionDelay=(Math.min(i%6,6)*55)+'ms';io.observe(el);});
    }

    // scroll: prog + sky --p + spine fill/nodes + header
    var prog=document.getElementById('prog'),sky=document.getElementById('sky'),bar=document.querySelector('header.bar');
    var ticking=false;
    function onScroll(){
      if(ticking)return;ticking=true;
      requestAnimationFrame(function(){
        var max=document.documentElement.scrollHeight-window.innerHeight;
        var p=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
        if(prog)prog.style.width=(p*100)+'%';
        if(sky)sky.style.setProperty('--p',p.toFixed(4));
        if(bar)bar.classList.toggle('scrolled',window.scrollY>40);
        if(spine){
          if(spine.fill&&!reduce)spine.fill.style.height=(p*100)+'%';
          var litTo=window.scrollY+window.innerHeight*0.5;
          spine.nodes.forEach(function(o){var top=o.target.getBoundingClientRect().top+window.scrollY;
            o.el.classList.toggle('lit',litTo>=top);});
        }
        ticking=false;
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});onScroll();

    // nav toggle (mobile → к контактам)
    var nb=document.getElementById('navBtn');
    if(nb)nb.addEventListener('click',function(){var c=document.getElementById('contact');if(c)c.scrollIntoView({behavior:'smooth'});});

    var yr=document.getElementById('yr');if(yr)yr.textContent=new Date().getFullYear();
  }

  if(document.readyState!=='loading')init();
  else document.addEventListener('DOMContentLoaded',init);
})();
