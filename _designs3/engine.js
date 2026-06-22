/* ============================================================
   STEAM SHOW — общий портфолио-движок (для всех тем _designs2)
   Темы дают CSS + .hero; движок даёт структуру:
   overview -> detail (вкладки: All/Costumes/Photos/Videos) -> lightbox.
   Ожидаемые id/классы:
     #ovGrid #marquee #ovcount
     #detail #dType #dTitle #dDesc #dStats #dTabs #dGallery
     #lb #lbPh #lbCap #lbIdx  #overview  #nav
   Плейсхолдеры: .ph .glow .grain .vire .cap .vplay
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);

  /* палитры — чтобы цветные плейсхолдеры читались как реальные фото шоу */
  const PAL={
    fire:[["#FF7A1A","#7a1500"],["#FFB347","#8a2b00"],["#E23A0E","#3a0a02"],["#FFD27A","#7a3d00"],["#FF5A1F","#2a0a04"]],
    hybrid:[["#FF7A1A","#3a1060"],["#36E0E6","#5a1500"],["#FF4FA3","#2a0a40"],["#FFB347","#1a4d6b"]],
    led:[["#36E0E6","#0a2a4a"],["#8C6BFF","#10103a"],["#FF4FA3","#2a0a40"],["#5BE0A0","#06303a"],["#6BA8FF","#0a1640"]],
    stilts:[["#8C6BFF","#1a0a3a"],["#FFB347","#3a1a00"],["#36E0E6","#0a2a3a"],["#FF6FB0","#2a0a30"]],
    reel:[["#FF7A1A","#10103a"]]
  };
  function glowCSS(cat,i){const p=PAL[cat]||PAL.fire;const c=p[i%p.length];
    return "radial-gradient(120% 100% at "+(18+(i*37)%62)+"% "+(72+(i*23)%24)+"%, "+c[0]+"d0, transparent 56%),"
         +"radial-gradient(85% 75% at "+(82-(i*19)%52)+"% 8%, "+c[0]+"60, transparent 60%),"
         +"linear-gradient(158deg, "+c[1]+", #0a0810)";}
  function phHTML(cat,i,label,badge,isVideo){
    return '<div class="glow" style="background:'+glowCSS(cat,i)+'"></div><div class="grain"></div><div class="vire"></div>'
      +(isVideo?'<div class="vplay"></div>':'')
      +'<div class="cap"><b>'+(label||'')+'</b>'+(badge?'<span class="badge">'+badge+'</span>':'')+'</div>';
  }

  const SHOWS={
    dragon:{name:'Dragon Fire Show',type:'Flagship · fire',cat:'fire',desc:'Our signature act — a colossal, flame-breathing dragon built from fire, smoke and light. Scales from intimate galas to festival main stages.',photos:14,videos:3,costumes:0,extra:'Flamethrowers · fire cubes · pyro'},
    fire:{name:'Fire Show',type:'Classic · fire',cat:'fire',desc:'Large-scale fire choreography in three distinct visual worlds — fantasy, post-apocalyptic and rock — tailored to your event’s mood.',photos:15,videos:3,costumes:0,styles:['Fantasy','Post-apoc','Rock']},
    ledfire:{name:'LED Fire Show',type:'Hybrid · fire + light',cat:'hybrid',desc:'The best of both — live fire performed in glowing LED costumes. The heat of fire with the colour of light.',photos:10,videos:2,costumes:6},
    led:{name:'LED Show',type:'Electric · light',cat:'led',desc:'A fully luminous, smoke-free spectacle. Deep catalogue of LED costumes — pick the looks that match your palette and venue.',photos:8,videos:2,costumes:12},
    stilts:{name:'Stilt Walkers',type:'Roaming · giants',cat:'stilts',desc:'A wardrobe of towering characters, booked as roaming animation or a full stilt performance. Most clients take them as animation.',photos:8,videos:2,costumes:14}
  };
  const ORDER=['dragon','fire','ledfire','led','stilts'];
  const OV_LAYOUT={dragon:'flagship',fire:'std2',ledfire:'std2',led:'wide',stilts:'wide'};

  function metaLine(s){const p=[];if(s.photos)p.push('<span>◳ '+s.photos+' photos</span>');if(s.videos)p.push('<span>▶ '+s.videos+' videos</span>');if(s.costumes)p.push('<span>✦ '+s.costumes+' costumes</span>');return p.join('');}

  function renderOverview(){
    const grid=$('ovGrid');
    if(grid) grid.innerHTML=ORDER.map((id,idx)=>{const s=SHOWS[id];
      return '<article class="tile '+OV_LAYOUT[id]+'" onclick="openDetail(\''+id+'\')">'
        +'<div class="ph">'+phHTML(s.cat,idx*3,'','',false)+'</div><div class="arrow">→</div>'
        +'<div class="info"><span class="type">'+s.type+'</span><h3>'+s.name+'</h3><div class="meta">'+metaLine(s)+'</div></div></article>';
    }).join('');
    let tp=0,tv=0,tc=0;ORDER.forEach(id=>{tp+=SHOWS[id].photos;tv+=SHOWS[id].videos;tc+=SHOWS[id].costumes;});
    const oc=$('ovcount');if(oc)oc.textContent=tp+' photos · '+tv+' videos · '+tc+' costumes';

    const mq=$('marquee');
    if(mq){const one=ORDER.map((id,idx)=>{const s=SHOWS[id];
      return '<div class="m-tile" onclick="openDetail(\''+id+'\')"><div class="ph">'+phHTML(s.cat,idx*2+1,'','',false)
        +'</div><div class="mt-name">'+s.name+'<span>'+(s.costumes?s.costumes+' costumes':s.videos+' videos')+'</span></div></div>';}).join('');
      mq.innerHTML=one+one;}
  }

  let CUR=null,CUR_TAB='all',LB_LIST=[],LB_POS=0;
  window.openDetail=function(id){const s=SHOWS[id];if(!s)return;CUR=id;CUR_TAB='all';
    $('dType').textContent=s.type;
    $('dTitle').innerHTML=s.name.replace(/(Fire|LED|Dragon|Stilt)/,'<em>$1</em>');
    $('dDesc').textContent=s.desc;
    let st='<div><span>Photos</span><span>'+s.photos+'</span></div><div><span>Videos</span><span>'+s.videos+'</span></div>';
    if(s.costumes)st+='<div><span>Costumes</span><span>'+s.costumes+'</span></div>';
    if(s.styles)st+='<div><span>Styles</span><span>'+s.styles.join(' · ')+'</span></div>';
    if(s.extra)st+='<div><span>Effects</span><span>'+s.extra+'</span></div>';
    $('dStats').innerHTML=st;
    const tabs=[['all','All']];if(s.costumes)tabs.push(['costumes','Costumes ('+s.costumes+')']);
    tabs.push(['photos','Photos ('+s.photos+')'],['videos','Videos ('+s.videos+')']);
    $('dTabs').innerHTML=tabs.map(t=>'<button class="'+(t[0]==='all'?'on':'')+'" onclick="setTab(\''+t[0]+'\',this)">'+t[1]+'</button>').join('');
    renderGallery();
    $('overview').classList.add('hidden');
    $('detail').classList.add('active');
    window.scrollTo({top:0});
  };
  window.setTab=function(t,btn){CUR_TAB=t;document.querySelectorAll('#dTabs button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderGallery();};
  function buildItems(id){const s=SHOWS[id];const items=[];
    for(let i=0;i<s.videos;i++)items.push({kind:'videos',label:s.name+' — video '+(i+1),badge:'Video',video:true});
    if(s.costumes)for(let i=0;i<s.costumes;i++)items.push({kind:'costumes',label:'Costume '+(i+1),badge:'Costume',video:false});
    for(let i=0;i<s.photos;i++){let lbl='Photo '+(i+1);if(s.styles)lbl=s.styles[i%s.styles.length]+' — '+(Math.floor(i/s.styles.length)+1);
      items.push({kind:'photos',label:lbl,badge:s.styles?s.styles[i%s.styles.length]:'',video:false});}
    return items;}
  function renderGallery(){const s=SHOWS[CUR];let items=buildItems(CUR);if(CUR_TAB!=='all')items=items.filter(it=>it.kind===CUR_TAB);LB_LIST=items;
    $('dGallery').innerHTML=items.map((it,i)=>{const cls=it.video?'g video':(i%5===0?'g tall':'g');
      return '<div class="'+cls+'" onclick="openLightbox(\''+it.label.replace(/'/g,"")+'\',\''+s.cat+'\','+i+','+(it.video?'true':'false')+')">'
        +'<div class="ph">'+phHTML(s.cat,i+(it.video?100:0),it.label,it.badge,it.video)+'</div></div>';}).join('');}

  window.openLightbox=function(label,cat,pos,isVideo){LB_POS=pos||0;
    if(!LB_LIST.length||cat==='reel'){LB_LIST=[{label:label,badge:'Reel',video:true}];LB_POS=0;}
    paintLB(cat);$('lb').classList.add('open');};
  function paintLB(cat){const it=LB_LIST[LB_POS]||{label:'',video:false};const c=cat||(SHOWS[CUR]?SHOWS[CUR].cat:'fire');
    $('lbPh').innerHTML=phHTML(c,LB_POS,it.label,it.badge||'',it.video);
    $('lbCap').textContent=it.label;$('lbIdx').textContent=(LB_POS+1)+' / '+LB_LIST.length;}
  window.lbStep=function(d){LB_POS=(LB_POS+d+LB_LIST.length)%LB_LIST.length;paintLB();};
  window.closeLightbox=function(){$('lb').classList.remove('open');};
  document.addEventListener('keydown',e=>{if(!$('lb')||!$('lb').classList.contains('open'))return;
    if(e.key==='Escape')closeLightbox();if(e.key==='ArrowRight')lbStep(1);if(e.key==='ArrowLeft')lbStep(-1);});
  window.goHome=function(){$('detail').classList.remove('active');$('overview').classList.remove('hidden');window.scrollTo({top:0});};

  addEventListener('scroll',()=>{const n=$('nav');if(n)n.classList.toggle('scrolled',scrollY>20);},{passive:true});

  /* reveal по скроллу */
  function initReveal(){
    const els=document.querySelectorAll('.reveal');
    if(!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){els.forEach(e=>e.classList.add('in'));return;}
    const io=new IntersectionObserver((ents)=>{ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.14,rootMargin:'0px 0px -6% 0px'});
    els.forEach(e=>io.observe(e));
  }

  const y=$('year'); if(y) y.textContent=new Date().getFullYear();
  renderOverview();
  initReveal();
})();
