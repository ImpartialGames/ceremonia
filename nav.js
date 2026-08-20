/* Ceremonia shared navigation bar for subpages (menu, careers, privacy).
   The <script src="nav.js"> tag must be the FIRST element inside <body>:
   the bar is injected synchronously so each page's own end-of-body script
   finds and binds the .lang-btn buttons it injects. */
(function(){
  var NAV={
    story:  {en:"Story",fr:"Histoire",id:"Cerita",es:"Historia"},
    menu:   {en:"Menu",fr:"Carte",id:"Menu",es:"Carta"},
    gallery:{en:"Gallery",fr:"Galerie",id:"Galeri",es:"Galería"},
    reviews:{en:"Reviews",fr:"Avis",id:"Ulasan",es:"Reseñas"},
    visit:  {en:"Visit",fr:"Visite",id:"Kunjungi",es:"Visítanos"},
    careers:{en:"Careers",fr:"Carrières",id:"Karier",es:"Empleo"},
    reserve:{en:"Reserve a Table",fr:"Réserver une table",id:"Pesan Meja",es:"Reservar mesa"}
  };
  var LINKS=[
    ["story","/#a-about"],
    ["menu","/menu"],
    ["gallery","/#a-gallery"],
    ["reviews","/#a-reviews"],
    ["visit","/#a-visit"],
    ["careers","/careers"]
  ];
  var path=location.pathname.replace(/\/+$/,"")||"/";

  var css=""
  +"#cnav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;gap:18px;"
  +"padding:16px 6vw;background:rgba(15,27,53,.82);backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);border-bottom:1px solid rgba(212,184,150,.12)}"
  +"#cnav a{text-decoration:none;color:inherit}"
  +".cnav-brand{display:flex;align-items:center;gap:10px;flex:0 0 auto}"
  +".cnav-brand img{width:30px;height:30px;object-fit:contain}"
  +".cnav-brand span{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;color:var(--ivory,#F5F0E8)}"
  +".cnav-links{display:flex;align-items:center;gap:28px}"
  +".cnav-link{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:rgba(245,240,232,.65);transition:color .25s;white-space:nowrap}"
  +".cnav-link:hover{color:var(--gold,#D4B896)}"
  +".cnav-link[aria-current=page]{color:var(--gold,#D4B896)}"
  +".cnav-cta{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.2em;text-transform:uppercase;white-space:nowrap;"
  +"border:1px solid var(--gold,#D4B896);color:var(--gold,#D4B896);padding:9px 20px;border-radius:30px;transition:background .3s,color .3s}"
  +".cnav-cta:hover{background:var(--gold,#D4B896);color:var(--navy,#0F1B35)}"
  +"#cnav .lang-switch{display:flex;align-items:center;gap:6px}"
  +"#cnav .lang-btn{background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.12em;color:rgba(245,240,232,.5);padding:2px;transition:color .25s}"
  +"#cnav .lang-btn:hover{color:var(--gold,#D4B896)}"
  +"#cnav .lang-btn.active{color:var(--gold,#D4B896);font-weight:600}"
  +"#cnav .lang-sep{color:rgba(212,184,150,.3);font-size:10px}"
  +".cnav-burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:36px;height:36px;background:none;border:none;cursor:pointer;padding:6px;flex:0 0 auto}"
  +".cnav-burger span{display:block;height:1.5px;width:100%;background:var(--ivory,#F5F0E8);border-radius:2px;transition:transform .35s,opacity .25s}"
  +"body.cnav-open .cnav-burger span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}"
  +"body.cnav-open .cnav-burger span:nth-child(2){opacity:0}"
  +"body.cnav-open .cnav-burger span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}"
  +"#cnav-menu{position:fixed;inset:0;z-index:99;background:rgba(11,18,38,.98);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);"
  +"display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;opacity:0;pointer-events:none;transition:opacity .4s}"
  +"#cnav-menu a{text-decoration:none;color:inherit}"
  +"body.cnav-open #cnav-menu{opacity:1;pointer-events:auto}"
  +"body.cnav-open{overflow:hidden}"
  +".cnav-mlink{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:400;color:var(--ivory,#F5F0E8);letter-spacing:.02em;padding:8px 0;transition:color .25s}"
  +".cnav-mlink:hover,.cnav-mlink:active{color:var(--gold,#D4B896)}"
  +".cnav-mcta{margin-top:20px;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.22em;text-transform:uppercase;border:1px solid var(--gold,#D4B896);color:var(--gold,#D4B896);padding:13px 32px;border-radius:30px;transition:background .3s,color .3s}"
  +".cnav-mcta:hover{background:var(--gold,#D4B896);color:var(--navy,#0F1B35)}"
  +"#cnav-menu .lang-switch{display:flex;align-items:center;gap:8px;margin-top:26px}"
  +"#cnav-menu .lang-btn{background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:12px;letter-spacing:.18em;color:rgba(245,240,232,.5);padding:6px 4px;transition:color .25s}"
  +"#cnav-menu .lang-btn.active{color:var(--gold,#D4B896);font-weight:600}"
  +"#cnav-menu .lang-sep{color:rgba(212,184,150,.3);font-size:11px}"
  +"@media(max-width:860px){.cnav-links{display:none}.cnav-burger{display:flex}}";

  function langSwitch(){
    return '<div class="lang-switch">'
      +'<button class="lang-btn" data-lang="en">EN</button><span class="lang-sep">·</span>'
      +'<button class="lang-btn" data-lang="fr">FR</button><span class="lang-sep">·</span>'
      +'<button class="lang-btn" data-lang="id">ID</button><span class="lang-sep">·</span>'
      +'<button class="lang-btn" data-lang="es">ES</button>'
      +'</div>';
  }
  function linkHTML(cls){
    return LINKS.map(function(l){
      var cur=(l[1].indexOf("#")===-1&&l[1]===path)?' aria-current="page"':'';
      return '<a class="'+cls+'" href="'+l[1]+'"'+cur+' data-nav="'+l[0]+'">'+NAV[l[0]].en+'</a>';
    }).join("");
  }
  var html='<nav id="cnav">'
    +'<a class="cnav-brand" href="/"><img src="logo-ceremonia-beige.webp" alt="Ceremonia"><span>Ceremonia</span></a>'
    +'<div class="cnav-links">'+linkHTML("cnav-link")+langSwitch()+'</div>'
    +'<button class="cnav-burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>'
    +'</nav>'
    +'<div id="cnav-menu">'+linkHTML("cnav-mlink")
    +'<a class="cnav-mcta" href="https://wa.me/6285337107649" target="_blank" rel="noopener" data-nav="reserve">'+NAV.reserve.en+'</a>'
    +langSwitch()
    +'</div>';

  document.head.insertAdjacentHTML("beforeend","<style>"+css+"</style>");
  document.body.insertAdjacentHTML("afterbegin",html);

  var burger=document.querySelector(".cnav-burger");
  burger.addEventListener("click",function(){
    var open=document.body.classList.toggle("cnav-open");
    burger.setAttribute("aria-expanded",open?"true":"false");
  });
  document.querySelectorAll("#cnav-menu a").forEach(function(a){
    a.addEventListener("click",function(){
      document.body.classList.remove("cnav-open");
      burger.setAttribute("aria-expanded","false");
    });
  });

  function applyNavLang(l){
    if(!NAV.story[l])l="en";
    document.querySelectorAll("#cnav [data-nav],#cnav-menu [data-nav]").forEach(function(a){
      var o=NAV[a.getAttribute("data-nav")];
      if(o)a.textContent=o[l]||o.en;
    });
    document.querySelectorAll("#cnav .lang-btn,#cnav-menu .lang-btn").forEach(function(b){
      b.classList.toggle("active",b.dataset.lang===l);
    });
  }
  var saved="en";
  try{saved=localStorage.getItem("lang")||"en";}catch(e){}
  applyNavLang(saved);
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest(".lang-btn");
    if(b&&b.dataset.lang)applyNavLang(b.dataset.lang);
  });
})();
