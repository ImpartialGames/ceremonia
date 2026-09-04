/* Ceremonia cookie consent banner + Google Consent Mode v2.
   Loaded synchronously BEFORE the Google tag so the default consent state
   (denied) is set before gtag('config') runs. If the visitor declines or
   ignores the banner, GA4 keeps counting visits anonymously, without cookies.
   Accepting grants analytics_storage AND the ad_* signals (ad_storage,
   ad_user_data, ad_personalization) together, since without them Google
   never sets the _gcl_aw click-id cookie and Ads can't attribute conversions. */
(function(){
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments)}
  var KEY='cookie-consent';
  var stored=null;
  try{stored=localStorage.getItem(KEY)}catch(e){}
  gtag('consent','default',{
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    analytics_storage:stored==='granted'?'granted':'denied',
    wait_for_update:stored?0:500
  });
  var T={
    en:{txt:'We use cookies to measure our audience and the performance of our ads (Google Analytics, Google Ads). If you decline, visits are counted anonymously, without cookies.',more:'Learn more',ok:'Accept',no:'Decline'},
    fr:{txt:'Nous utilisons des cookies pour mesurer notre audience et la performance de nos publicités (Google Analytics, Google Ads). Si vous refusez, les visites sont comptées anonymement, sans cookies.',more:'En savoir plus',ok:'Accepter',no:'Refuser'},
    id:{txt:'Kami menggunakan cookie untuk mengukur pengunjung dan performa iklan kami (Google Analytics, Google Ads). Jika Anda menolak, kunjungan dihitung secara anonim, tanpa cookie.',more:'Selengkapnya',ok:'Terima',no:'Tolak'},
    es:{txt:'Usamos cookies para medir nuestra audiencia y el rendimiento de nuestros anuncios (Google Analytics, Google Ads). Si las rechazas, las visitas se cuentan de forma anónima, sin cookies.',more:'Más información',ok:'Aceptar',no:'Rechazar'}
  };
  function decide(v){
    try{localStorage.setItem(KEY,v)}catch(e){}
    stored=v;
    var g=v==='granted'?'granted':'denied';
    gtag('consent','update',{
      analytics_storage:g,
      ad_storage:g,
      ad_user_data:g,
      ad_personalization:g
    });
    var b=document.getElementById('ck-banner');
    if(b)b.remove();
  }
  function showBanner(){
    var lang='en';
    try{lang=localStorage.getItem('lang')||'en'}catch(e){}
    var s=T[lang]||T.en;
    if(!document.getElementById('ck-style')){
      var css=document.createElement('style');
      css.id='ck-style';
      css.textContent='#ck-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:5000;max-width:520px;margin:0 auto;'
        +'background:linear-gradient(160deg,#1E2F50,#152440);border:1px solid rgba(240,227,215,.35);border-radius:14px;'
        +'box-shadow:0 22px 50px rgba(0,0,0,.55);padding:18px 20px;font-family:Poppins,sans-serif;animation:ckin .5s cubic-bezier(.16,1,.3,1)}'
        +'@keyframes ckin{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}'
        +'#ck-banner p{font-size:12px;font-weight:300;line-height:1.7;color:rgba(245,240,232,.75);margin:0 0 14px}'
        +'#ck-banner a{color:#f0e3d7;text-decoration:underline;text-underline-offset:3px}'
        +'#ck-banner .ck-row{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}'
        +'#ck-banner button{font-family:Poppins,sans-serif;font-size:10px;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;padding:10px 20px;border-radius:6px;transition:all .25s}'
        +'#ck-accept{background:transparent;color:#f0e3d7;border:1px solid #f0e3d7;font-weight:600}'
        +'#ck-accept:hover{background:#f0e3d7;color:#12223d}'
        +'#ck-decline{background:transparent;color:rgba(245,240,232,.55);border:1px solid rgba(240,227,215,.3)}'
        +'#ck-decline:hover{color:#f0e3d7;border-color:#f0e3d7}';
      document.head.appendChild(css);
    }
    var d=document.createElement('div');
    d.id='ck-banner';
    d.innerHTML='<p>'+s.txt+' <a href="/privacy">'+s.more+'</a></p>'
      +'<div class="ck-row"><button id="ck-decline" type="button">'+s.no+'</button><button id="ck-accept" type="button">'+s.ok+'</button></div>';
    document.body.appendChild(d);
    document.getElementById('ck-accept').addEventListener('click',function(){decide('granted')});
    document.getElementById('ck-decline').addEventListener('click',function(){decide('denied')});
  }
  document.addEventListener('DOMContentLoaded',function(){
    if(!stored)showBanner();
    /* "Change my cookie choice" buttons on the privacy page */
    document.querySelectorAll('.manage-cookies').forEach(function(b){
      b.addEventListener('click',function(){
        try{localStorage.removeItem(KEY)}catch(e){}
        stored=null;
        if(!document.getElementById('ck-banner'))showBanner();
      });
    });
  });
})();
