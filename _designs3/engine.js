/* ============================================================
   STEAM SHOW — портфолио-движок (designs3) на реальном контенте
   Берёт данные из window.SS_DATA (media.js): реальные фото/костюмы +
   видео с YouTube. overview -> detail (All/Costumes/Photos/Videos) -> lightbox.
   ============================================================ */
(function(){
  const $ = id => document.getElementById(id);
  const DATA = window.SS_DATA || {shows:{},hero:'',reel:'a_CLhJkdnGg'};
  const REEL = DATA.reel || 'a_CLhJkdnGg';
  const YT_CHANNEL = 'https://www.youtube.com/@SteamShowby';
  const ytThumb = id => 'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
  const ytEmbed = id => 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1';

  function phHTML(i,label,badge,isVideo,img){
    const bg = img ? 'background:#0a0810 url(\''+img+'\') center/cover;'
                   : 'background:linear-gradient(158deg,#3a0a02,#0a0810);';
    return '<div class="glow" style="'+bg+'"></div><div class="grain"></div><div class="vire"></div>'
      +(isVideo?'<div class="vplay"></div>':'')
      +'<div class="cap"><b>'+(label||'')+'</b>'+(badge?'<span class="badge">'+badge+'</span>':'')+'</div>';
  }

  // мета шоу (тексты), а числа берём из DATA
  const SHOWS={
    dragon:{name:'Dragon Fire Show',type:'Flagship · fire',desc:'Our signature act — a colossal, flame-breathing dragon built from fire, smoke and light. Scales from intimate galas to festival main stages.',extra:'Flamethrowers · fire cubes · pyro'},
    fire:{name:'Fire Show',type:'Classic · fire',desc:'Large-scale fire choreography in three distinct visual worlds — fantasy, post-apocalyptic and rock — tailored to your event’s mood.',styles:['Fantasy','Post-apoc','Rock']},
    ledfire:{name:'LED Fire Show',type:'Hybrid · fire + light',desc:'The best of both — live fire performed in glowing LED costumes. The heat of fire with the colour of light.'},
    led:{name:'LED Show',type:'Electric · light',desc:'A fully luminous, smoke-free spectacle. Deep catalogue of LED costumes — pick the looks that match your palette and venue.'},
    stilts:{name:'Stilt Walkers',type:'Roaming · giants',desc:'A wardrobe of towering characters, booked as roaming animation or a full stilt performance. Most clients take them as animation.'}
  };
  const ORDER=['dragon','fire','ledfire','led','stilts'];
  const OV_LAYOUT={dragon:'flagship',fire:'std2',ledfire:'std2',led:'wide',stilts:'wide'};
  const D = id => DATA.shows[id] || {photos:[],costumes:[],videos:[]};
  const nPhoto = id => D(id).photos.length, nVid = id => D(id).videos.length, nCost = id => D(id).costumes.length;
  const cover = id => { const d=D(id); return d.photos[0] || (d.videos[0]?ytThumb(d.videos[0]):null); };

  function metaLine(id){const p=[];if(nPhoto(id))p.push('<span>◳ '+nPhoto(id)+' photos</span>');if(nVid(id))p.push('<span>▶ '+nVid(id)+' videos</span>');if(nCost(id))p.push('<span>✦ '+nCost(id)+' costumes</span>');return p.join('');}

  function renderOverview(){
    const grid=$('ovGrid');
    if(grid) grid.innerHTML=ORDER.map((id,idx)=>{const s=SHOWS[id];
      return '<article class="tile '+OV_LAYOUT[id]+'" onclick="openDetail(\''+id+'\')">'
        +'<div class="ph">'+phHTML(idx,'','',false,cover(id))+'</div><div class="arrow">→</div>'
        +'<div class="info"><span class="type">'+s.type+'</span><h3>'+s.name+'</h3><div class="meta">'+metaLine(id)+'</div></div></article>';
    }).join('');
    let tp=0,tv=0,tc=0;ORDER.forEach(id=>{tp+=nPhoto(id);tv+=nVid(id);tc+=nCost(id);});
    const oc=$('ovcount');if(oc)oc.textContent=tp+' photos · '+tv+' videos · '+tc+' costumes';

    const mq=$('marquee');
    if(mq){const one=ORDER.map((id)=>{const s=SHOWS[id];
      return '<div class="m-tile" onclick="openDetail(\''+id+'\')"><div class="ph">'+phHTML(1,'','',false,cover(id))
        +'</div><div class="mt-name">'+s.name+'<span>'+(nCost(id)?nCost(id)+' costumes':nVid(id)+' videos')+'</span></div></div>';}).join('');
      mq.innerHTML=one+one;}
  }

  let CUR=null,CUR_TAB='all',LB_LIST=[],LB_POS=0;
  window.openDetail=function(id){const s=SHOWS[id];if(!s)return;CUR=id;CUR_TAB='all';
    $('dType').textContent=s.type;
    $('dTitle').innerHTML=s.name.replace(/(Fire|LED|Dragon|Stilt)/,'<em>$1</em>');
    $('dDesc').textContent=s.desc;
    let st='<div><span>Photos</span><span>'+nPhoto(id)+'</span></div><div><span>Videos</span><span>'+nVid(id)+'</span></div>';
    if(nCost(id))st+='<div><span>Costumes</span><span>'+nCost(id)+'</span></div>';
    if(s.styles)st+='<div><span>Styles</span><span>'+s.styles.join(' · ')+'</span></div>';
    if(s.extra)st+='<div><span>Effects</span><span>'+s.extra+'</span></div>';
    $('dStats').innerHTML=st;
    const tabs=[['all','All']];if(nCost(id))tabs.push(['costumes','Costumes ('+nCost(id)+')']);
    tabs.push(['photos','Photos ('+nPhoto(id)+')'],['videos','Videos ('+nVid(id)+')']);
    $('dTabs').innerHTML=tabs.map(t=>'<button class="'+(t[0]==='all'?'on':'')+'" onclick="setTab(\''+t[0]+'\',this)">'+t[1]+'</button>').join('');
    renderGallery();
    $('overview').classList.add('hidden');
    $('detail').classList.add('active');
    window.scrollTo({top:0});
  };
  window.setTab=function(t,btn){CUR_TAB=t;document.querySelectorAll('#dTabs button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderGallery();};

  function buildItems(id){const s=SHOWS[id];const d=D(id);const items=[];
    d.videos.forEach((vid,i)=>items.push({kind:'videos',label:s.name+' — video '+(i+1),badge:'Video',video:true,yt:vid,img:ytThumb(vid)}));
    d.costumes.forEach((src,i)=>items.push({kind:'costumes',label:'Costume '+(i+1),badge:'Costume',video:false,img:src}));
    d.photos.forEach((src,i)=>{let lbl='Photo '+(i+1);let badge='';if(s.styles){badge=s.styles[i%s.styles.length];}
      items.push({kind:'photos',label:lbl,badge:badge,video:false,img:src});});
    return items;}
  function renderGallery(){let items=buildItems(CUR);if(CUR_TAB!=='all')items=items.filter(it=>it.kind===CUR_TAB);LB_LIST=items;
    $('dGallery').innerHTML=items.map((it,i)=>{const cls=it.video?'g video':(i%5===0?'g tall':'g');
      return '<div class="'+cls+'" onclick="openLightbox('+i+')"><div class="ph">'+phHTML(i,it.label,it.badge,it.video,it.img)+'</div></div>';}).join('');}

  // openLightbox: либо индекс в текущей галерее, либо ('reel') для шоурила
  window.openLightbox=function(arg){
    if(arg==='reel'||typeof arg!=='number'){LB_LIST=[{label:'Showreel',video:true,yt:REEL,img:ytThumb(REEL)}];LB_POS=0;}
    else LB_POS=arg;
    paintLB();$('lb').classList.add('open');};
  function paintLB(){const it=LB_LIST[LB_POS]||{label:'',video:false};
    if(it.video&&it.yt){
      $('lbPh').innerHTML='<iframe src="'+ytEmbed(it.yt)+'" allow="autoplay; fullscreen; encrypted-media" allowfullscreen style="width:100%;height:100%;border:0;border-radius:16px"></iframe>';
    }else if(it.img){
      $('lbPh').innerHTML='<img src="'+it.img+'" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:16px;background:#000" />';
    }else{$('lbPh').innerHTML=phHTML(LB_POS,it.label,it.badge||'',false,null);}
    $('lbCap').textContent=it.label;$('lbIdx').textContent=(LB_POS+1)+' / '+LB_LIST.length;}
  window.lbStep=function(d){LB_POS=(LB_POS+d+LB_LIST.length)%LB_LIST.length;paintLB();};
  window.closeLightbox=function(){$('lb').classList.remove('open');setTimeout(function(){$('lbPh').innerHTML='';},300);};
  document.addEventListener('keydown',e=>{if(!$('lb')||!$('lb').classList.contains('open'))return;
    if(e.key==='Escape')closeLightbox();if(e.key==='ArrowRight')lbStep(1);if(e.key==='ArrowLeft')lbStep(-1);});
  window.goHome=function(){$('detail').classList.remove('active');$('overview').classList.remove('hidden');window.scrollTo({top:0});};

  addEventListener('scroll',()=>{const n=$('nav');if(n)n.classList.toggle('scrolled',scrollY>20);},{passive:true});

  function initReveal(){
    const els=document.querySelectorAll('.reveal');
    if(!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){els.forEach(e=>e.classList.add('in'));return;}
    const io=new IntersectionObserver((ents)=>{ents.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.14,rootMargin:'0px 0px -6% 0px'});
    els.forEach(e=>io.observe(e));
  }
  document.querySelectorAll('[data-yt-channel]').forEach(a=>{a.href=YT_CHANNEL;a.target='_blank';});

  const y=$('year'); if(y) y.textContent=new Date().getFullYear();
  renderOverview();
  initReveal();
})();
