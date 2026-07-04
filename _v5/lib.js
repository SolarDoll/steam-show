/* ============================================================
   STEAM SHOW — общий модуль каталога (designs4)
   Самовнедряемый overlay: program detail (вкладки Costumes/Photos/
   Videos) + lightbox. Тема-независим (берёт цвета из CSS-переменных
   страницы: --bg --panel --text --accent --line с фолбэками).
   API:  SS.openProgram(id) · SS.openReel() · SS.SHOWS · SS.data(id) · SS.cover(id)
   Требует, чтобы media.js (window.SS_DATA) был подключён ДО этого файла.
   ============================================================ */
(function(){
  const DATA = window.SS_DATA || {shows:{},reel:'a_CLhJkdnGg'};
  const REEL = DATA.reel || 'a_CLhJkdnGg';
  const ytThumb = id => 'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
  const ytEmbed = id => 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1';

  const SHOWS={
    dragon:{name:'Dragon Fire Show',type:'Flagship · fire',desc:'Our signature act — a colossal, flame-breathing dragon built from fire, smoke and light. Scales from intimate galas to festival main stages.',extra:'Flamethrowers · fire cubes · pyro'},
    fire:{name:'Fire Show',type:'Classic · fire',desc:'Large-scale fire choreography in three visual worlds — fantasy, post-apocalyptic and rock — tailored to your event.',styles:['Fantasy','Post-apoc','Rock']},
    ledfire:{name:'LED Fire Show',type:'Hybrid · fire + light',desc:'The best of both — live fire performed in glowing LED costumes. The heat of fire with the colour of light.'},
    led:{name:'LED Show',type:'Electric · light',desc:'A fully luminous, smoke-free spectacle. Deep catalogue of LED costumes — pick the looks that fit your venue.'},
    stilts:{name:'Stilt Walkers',type:'Roaming · giants',desc:'A wardrobe of towering characters, as roaming animation or a full stilt performance.'}
  };
  const ORDER=['dragon','fire','ledfire','led','stilts'];
  const D = id => DATA.shows[id] || {photos:[],costumes:[],videos:[]};
  const cover = id => { const d=D(id); return d.photos[0] || (d.videos[0]?ytThumb(d.videos[0]):''); };
  const counts = id => { const d=D(id); return {p:d.photos.length,v:d.videos.length,c:d.costumes.length}; };

  /* ---- стили overlay (тема-независимые через var()) ---- */
  const css = `
  .ss-ov{position:fixed;inset:0;z-index:9000;background:var(--bg,#0a0708);color:var(--text,#f4f1ea);
    overflow-y:auto;opacity:0;visibility:hidden;transition:opacity .4s ease;font-family:inherit;}
  .ss-ov.on{opacity:1;visibility:visible;}
  .ss-wrap{max-width:1280px;margin:0 auto;padding:28px clamp(18px,4vw,40px) 80px;}
  .ss-back{display:inline-flex;align-items:center;gap:8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;
    color:var(--text,#fff);opacity:.7;margin:6px 0 26px;cursor:pointer;background:none;border:none;}
  .ss-back:hover{opacity:1;color:var(--accent,#FF5A1F);}
  .ss-head{display:grid;grid-template-columns:1fr 320px;gap:40px;align-items:end;border-bottom:1px solid var(--line,#2a2230);padding-bottom:30px;margin-bottom:26px;}
  .ss-type{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent,#FF5A1F);}
  .ss-title{font-size:clamp(38px,6vw,76px);line-height:.98;margin:12px 0 14px;font-weight:700;letter-spacing:-.02em;}
  .ss-desc{opacity:.8;font-size:16px;max-width:54ch;}
  .ss-stats{border:1px solid var(--line,#2a2230);border-radius:14px;overflow:hidden;}
  .ss-stats div{display:flex;justify-content:space-between;padding:13px 16px;border-bottom:1px solid var(--line,#2a2230);font-size:13.5px;}
  .ss-stats div:last-child{border:none;} .ss-stats span:first-child{opacity:.6;}
  .ss-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px;}
  .ss-tab{font-size:13px;padding:9px 17px;border-radius:100px;border:1px solid var(--line,#2a2230);color:var(--text,#fff);opacity:.7;cursor:pointer;background:none;}
  .ss-tab:hover{opacity:1;} .ss-tab.on{background:var(--accent,#FF5A1F);color:#10070a;opacity:1;border-color:transparent;font-weight:700;}
  .ss-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
  .ss-cell{position:relative;border-radius:12px;overflow:hidden;cursor:pointer;background:#000;aspect-ratio:4/5;}
  .ss-cell.v{grid-column:span 2;aspect-ratio:16/10;}
  .ss-cell img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease;display:block;}
  .ss-cell:hover img{transform:scale(1.05);}
  .ss-cell .bdg{position:absolute;left:10px;bottom:10px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;
    background:rgba(0,0,0,.5);backdrop-filter:blur(4px);padding:4px 9px;border-radius:100px;}
  .ss-cell .pl{position:absolute;inset:0;margin:auto;width:54px;height:54px;border:1.5px solid #fff;border-radius:50%;display:grid;place-items:center;}
  .ss-cell .pl::before{content:"";border-left:15px solid #fff;border-top:9px solid transparent;border-bottom:9px solid transparent;margin-left:3px;}
  @media(max-width:860px){.ss-head{grid-template-columns:1fr;}.ss-grid{grid-template-columns:repeat(2,1fr);}}

  .ss-lb{position:fixed;inset:0;z-index:9500;background:rgba(4,3,5,.94);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:40px;}
  .ss-lb.on{display:flex;}
  .ss-lb .bx{width:min(1040px,100%);}
  .ss-lb .stage{aspect-ratio:16/10;border-radius:14px;overflow:hidden;background:#000;}
  .ss-lb .stage img{width:100%;height:100%;object-fit:contain;}
  .ss-lb .stage iframe{width:100%;height:100%;border:0;}
  .ss-lb .cap{display:flex;justify-content:space-between;margin-top:14px;font-size:14px;opacity:.8;}
  .ss-x{position:absolute;top:20px;right:24px;font-size:30px;color:#fff;cursor:pointer;background:none;border:none;}
  .ss-arr{position:absolute;top:50%;transform:translateY(-50%);font-size:42px;color:rgba(255,255,255,.7);cursor:pointer;background:none;border:none;padding:18px;}
  .ss-arr.l{left:6px;}.ss-arr.r{right:6px;}.ss-arr:hover{color:#fff;}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  const ov=document.createElement('div');ov.className='ss-ov';ov.id='ssOv';
  ov.innerHTML='<div class="ss-wrap"><button class="ss-back" onclick="SS.close()">← all shows</button>'
    +'<div class="ss-head"><div><div class="ss-type" id="ssType"></div><h2 class="ss-title" id="ssTitle"></h2><p class="ss-desc" id="ssDesc"></p></div><div class="ss-stats" id="ssStats"></div></div>'
    +'<div class="ss-tabs" id="ssTabs"></div><div class="ss-grid" id="ssGrid"></div></div>';
  const lb=document.createElement('div');lb.className='ss-lb';lb.id='ssLb';
  lb.innerHTML='<button class="ss-x" onclick="SS.lbClose()">×</button><button class="ss-arr l" onclick="SS.lbStep(-1)">‹</button><button class="ss-arr r" onclick="SS.lbStep(1)">›</button>'
    +'<div class="bx"><div class="stage" id="ssStage"></div><div class="cap"><span id="ssCap"></span><span id="ssIdx"></span></div></div>';
  lb.addEventListener('click',e=>{if(e.target===lb)SS.lbClose();});
  document.addEventListener('DOMContentLoaded',()=>{document.body.appendChild(ov);document.body.appendChild(lb);});
  if(document.body){document.body.appendChild(ov);document.body.appendChild(lb);}

  let CUR=null,TAB='all',LIST=[],POS=0;
  const $=id=>document.getElementById(id);

  function items(id){const s=SHOWS[id],d=D(id),out=[];
    d.videos.forEach((v,i)=>out.push({k:'videos',label:s.name+' — video '+(i+1),badge:'Video',video:true,yt:v,img:ytThumb(v)}));
    d.costumes.forEach((src,i)=>out.push({k:'costumes',label:'Costume '+(i+1),badge:'Costume',img:src}));
    d.photos.forEach((src,i)=>out.push({k:'photos',label:(s.styles?s.styles[i%s.styles.length]:'Photo '+(i+1)),badge:(s.styles?s.styles[i%s.styles.length]:''),img:src}));
    return out;}
  function renderGrid(){let it=items(CUR);if(TAB!=='all')it=it.filter(x=>x.k===TAB);LIST=it;
    $('ssGrid').innerHTML=it.map((x,i)=>'<div class="ss-cell '+(x.video?'v':'')+'" onclick="SS.lbOpen('+i+')"><img loading="lazy" src="'+x.img+'" alt=""/>'
      +(x.video?'<div class="pl"></div>':'')+(x.badge?'<div class="bdg">'+x.badge+'</div>':'')+'</div>').join('');}

  const SS={
    SHOWS:SHOWS, ORDER:ORDER, data:D, cover:cover, counts:counts, thumb:ytThumb,
    openProgram:function(id){const s=SHOWS[id];if(!s)return;CUR=id;TAB='all';
      $('ssType').textContent=s.type;$('ssTitle').textContent=s.name;$('ssDesc').textContent=s.desc;
      const c=counts(id);let st='<div><span>Photos</span><span>'+c.p+'</span></div><div><span>Videos</span><span>'+c.v+'</span></div>';
      if(c.c)st+='<div><span>Costumes</span><span>'+c.c+'</span></div>';if(s.styles)st+='<div><span>Styles</span><span>'+s.styles.join(' · ')+'</span></div>';if(s.extra)st+='<div><span>Effects</span><span>'+s.extra+'</span></div>';
      $('ssStats').innerHTML=st;
      const tabs=[['all','All']];if(c.c)tabs.push(['costumes','Costumes ('+c.c+')']);tabs.push(['photos','Photos ('+c.p+')'],['videos','Videos ('+c.v+')']);
      $('ssTabs').innerHTML=tabs.map(t=>'<button class="ss-tab '+(t[0]==='all'?'on':'')+'" onclick="SS.setTab(\''+t[0]+'\',this)">'+t[1]+'</button>').join('');
      renderGrid();ov.classList.add('on');document.body.style.overflow='hidden';ov.scrollTop=0;},
    setTab:function(t,btn){TAB=t;ov.querySelectorAll('.ss-tab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderGrid();},
    close:function(){ov.classList.remove('on');document.body.style.overflow='';},
    lbOpen:function(i){POS=i;paint();lb.classList.add('on');},
    openReel:function(){LIST=[{label:'Showreel',video:true,yt:REEL}];POS=0;paint();lb.classList.add('on');},
    lbStep:function(d){if(!LIST.length)return;POS=(POS+d+LIST.length)%LIST.length;paint();},
    lbClose:function(){lb.classList.remove('on');setTimeout(()=>{$('ssStage').innerHTML='';},250);}
  };
  function paint(){const x=LIST[POS]||{};
    if(x.video&&x.yt)$('ssStage').innerHTML='<iframe src="'+ytEmbed(x.yt)+'" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>';
    else $('ssStage').innerHTML='<img src="'+(x.img||'')+'" alt=""/>';
    $('ssCap').textContent=x.label||'';$('ssIdx').textContent=(POS+1)+' / '+LIST.length;}
  document.addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')SS.lbClose();if(e.key==='ArrowRight')SS.lbStep(1);if(e.key==='ArrowLeft')SS.lbStep(-1);});
  window.SS=SS;
})();
