/* ============================================================
   Steam Show — общий JS для гибридных вариантов
   фон-угольки · небо по скроллу · spine · reveal-стаггер · nav
   ============================================================ */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* пул реальных фото по программам (для hero-стены/кроссфейда) */
  window.SS_PHOTOS = {
    dragon: range('dragon', 22),
    fire:   range('fire', 23),
    ledfire:range('ledfire', 14),
    led:    range('led', 10),
    stilts: range('stilts', 59)
  };
  function range(name, n){
    var a=[]; for(var i=1;i<=n;i++){ a.push('../assets/web/'+name+'/'+name+'-'+('00'+i).slice(-3)+'.jpg'); }
    return a;
  }

  /* nav scrolled */
  var hdr = document.querySelector('header.nav');
  if(hdr) addEventListener('scroll', function(){ hdr.classList.toggle('scrolled', scrollY>40); }, {passive:true});

  /* угольки */
  if(!reduce){
    var box = document.getElementById('embers');
    if(box){
      var n = innerWidth < 700 ? 16 : 32;
      for(var i=0;i<n;i++){
        var e=document.createElement('span'); e.className='ember';
        e.style.left=(Math.random()*100)+'%';
        var s=2+Math.random()*3; e.style.width=e.style.height=s+'px';
        var dur=8+Math.random()*10;
        e.style.animationDuration=dur+'s';
        e.style.animationDelay=(-Math.random()*dur)+'s';
        e.style.setProperty('--dx',(Math.random()*100-50)+'px');
        e.style.opacity=String(.4+Math.random()*.5);
        box.appendChild(e);
      }
    }
  }

  /* reveal со стаггером внутри одной группы */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.14, rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  // стаггер для соседних .reveal с атрибутом data-stagger-group
  document.querySelectorAll('[data-stagger]').forEach(function(group){
    [].forEach.call(group.children, function(child, i){
      if(child.classList.contains('reveal')) child.style.transitionDelay = Math.min(i,8)*70 + 'ms';
    });
  });

  /* небо по скроллу + spine fill + узлы */
  var sky = document.getElementById('sky');
  var fill = document.getElementById('spineFill');
  var spine = document.getElementById('spine');
  var nodes = [];
  if(spine){
    ['.programs','.world','.contact'].forEach(function(sel){
      var t=document.querySelector(sel); if(!t) return;
      var nd=document.createElement('div'); nd.className='spine__node'; spine.appendChild(nd);
      nodes.push({el:nd,target:t});
    });
    placeNodes();
  }
  function placeNodes(){
    var docH=document.documentElement.scrollHeight;
    nodes.forEach(function(o){
      var top=o.target.getBoundingClientRect().top+scrollY;
      o.el.style.top=(top/docH*100)+'%';
    });
  }
  var ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      var max=document.documentElement.scrollHeight - innerHeight;
      var p = max>0 ? Math.min(1,Math.max(0,scrollY/max)) : 0;
      if(sky) sky.style.setProperty('--p', p.toFixed(4));
      if(fill && !reduce) fill.style.height=(p*100)+'%';
      var litTo=scrollY+innerHeight*0.5;
      nodes.forEach(function(o){
        var top=o.target.getBoundingClientRect().top+scrollY;
        o.el.classList.toggle('lit', litTo>=top);
      });
      ticking=false;
    });
  }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', function(){ placeNodes(); onScroll(); }, {passive:true});
  addEventListener('load', function(){ placeNodes(); onScroll(); });
  onScroll();
})();
