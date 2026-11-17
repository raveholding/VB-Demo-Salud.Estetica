/* ===== VB · kit de tienda online para webs públicas propias (gimnasio, barbería…) =====
   Suma a cualquier página pública del Sistema VB lo que trae la tienda de Almacén RAVE:
   · chat «Escribinos» (si el comercio lo activó),
   · envío a domicilio con seguimiento (si activó el reparto para el menú): el pedido va al sistema del local con su código de entrega,
   · «Mi cuenta»: mis pedidos con el estado en vivo, contacto (WhatsApp, llamar, cómo llegar, redes) e instalar la app.
   La página lo conecta con window.VB_KIT={mount:elemento del carrito,items:()=>[{id,qty,price}],total:()=>número,clear:()=>{},close:()=>{}}
   y en su botón de enviar llama a VB_KIT_SEND(): si devuelve true, el kit se encargó del pedido. Nunca guarda tarjetas ni claves. */
(function(){
  var API=null;try{API=window.parent&&window.parent.RAVE_API;}catch(e){}if(!API)try{API=window.RAVE_API;}catch(e){}if(!API)return;
  var $=function(s,r){return (r||document).querySelector(s);};
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function EN(){try{return window.RAVE_LANG&&window.RAVE_LANG()==='en';}catch(e){return false;}}
  function L(es,en){return EN()?en:es;}
  function money(n){return '$ '+Math.round(n||0).toLocaleString('es-AR');}
  function site(){try{return API.site()||{};}catch(e){return {};}}
  function wa(){return String(site().wa||window.VB_KIT_WA||'').replace(/\D/g,'');}
  function toast(t){var d=document.createElement('div');d.className='vbk-toast';d.setAttribute('role','status');d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove();},3200);}
  var css='.vbk-fab{position:fixed;z-index:56;display:flex;align-items:center;gap:8px;height:50px;padding:0 16px;border-radius:25px;border:1px solid var(--line,rgba(255,255,255,.15));background:var(--card,#151515);color:var(--fg,#fff);font:600 14px/1 inherit;font-family:inherit;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.35)}'+
   '.vbk-fab:hover{border-color:var(--acc,#c6f135)}#vbk-chat-fab{right:16px;bottom:16px}#vbk-me-fab{left:16px;bottom:16px}#vbk-chat-fab .d{width:9px;height:9px;border-radius:50%;background:#ef4444;display:none}#vbk-chat-fab.new .d{display:inline-block}'+
   '.vbk-fab{transition:bottom .2s}'+
   '.vbk-sheet{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}.vbk-in{width:min(520px,100%);max-height:92vh;overflow:auto;background:var(--bg2,#121212);color:var(--fg,#fff);border:1px solid var(--line,rgba(255,255,255,.12));border-radius:22px 22px 0 0;padding:18px 18px 22px}'+
   '@media(min-width:700px){.vbk-sheet{align-items:center}.vbk-in{border-radius:22px}}.vbk-hd{display:flex;align-items:center;gap:10px;margin-bottom:12px}.vbk-hd b{flex:1;font-size:18px}.vbk-x{width:44px;height:44px;border-radius:50%;border:1px solid var(--line,#333);background:transparent;color:inherit;font-size:20px;cursor:pointer}'+
   '.vbk-tabs{display:flex;gap:6px;margin-bottom:12px}.vbk-tabs button{flex:1;min-height:44px;border-radius:12px;border:1px solid var(--line,#333);background:transparent;color:var(--mut,#aaa);font:600 14px inherit;font-family:inherit;cursor:pointer}.vbk-tabs button[aria-selected=true]{background:var(--acc,#c6f135);color:var(--on,#0a0a0a);border-color:transparent}'+
   '.vbk-btn{display:flex;align-items:center;gap:10px;width:100%;min-height:50px;margin:8px 0;padding:0 14px;border-radius:14px;border:1px solid var(--line,#333);background:var(--card,rgba(255,255,255,.04));color:inherit;font:600 15px inherit;font-family:inherit;text-decoration:none;cursor:pointer;box-sizing:border-box}.vbk-btn:hover{border-color:var(--acc,#c6f135)}.vbk-btn.acc{background:var(--acc,#c6f135);color:var(--on,#0a0a0a);border-color:transparent;justify-content:center}'+
   '.vbk-ped{border:1px solid var(--line,#333);border-radius:14px;padding:12px;margin:10px 0}.vbk-ped b{font-size:15px}.vbk-pin{font:800 22px monospace;letter-spacing:.15em;color:var(--acc,#c6f135)}.vbk-st{display:flex;gap:4px;margin:8px 0}.vbk-st i{flex:1;height:6px;border-radius:3px;background:rgba(127,127,127,.25)}.vbk-st i.on{background:var(--acc,#c6f135)}'+
   '.vbk-m{color:var(--mut,#aaa);font-size:13px;line-height:1.45}.vbk-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:13000;background:#18181b;color:#fff;padding:12px 16px;border-radius:12px;font-size:14px;max-width:90vw;box-shadow:0 10px 30px rgba(0,0,0,.4)}'+
   '#vbk-rep{border:1px solid var(--line,#333);border-radius:14px;padding:12px;margin:10px 0;display:grid;gap:8px}#vbk-rep h4{margin:0;font-size:15px}#vbk-rep label{font-size:13px;color:var(--mut,#aaa)}#vbk-rep input,#vbk-rep select{width:100%;min-height:44px;box-sizing:border-box;padding:0 12px;border-radius:10px;border:1px solid var(--line,#333);background:rgba(0,0,0,.3);color:var(--fg,#fff);font:inherit;text-transform:none}'+
   '#vbk-rep .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}#vbk-rep .opt{display:flex;gap:8px;align-items:center;font-size:14px;color:var(--fg,#fff)}#vbk-rep .opt input{width:20px;min-height:20px;accent-color:var(--acc,#c6f135)}#vbk-rep .err{color:#f87171;font-size:13px}#vbk-rep .sum{font-size:14px}'+
   '#vbk-chat{position:fixed;right:12px;bottom:12px;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 24px));z-index:12000;background:var(--bg2,#121212);color:var(--fg,#fff);border:1px solid var(--line,#333);border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden}'+
   '#vbk-chat header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line,#333)}#vbk-chat header b{flex:1}#vbk-chat .th{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}'+
   '#vbk-chat .m{max-width:85%;padding:8px 11px;border-radius:12px;white-space:pre-wrap;word-break:break-word;font-size:14px}#vbk-chat .m.in{align-self:flex-end;background:var(--acc,#c6f135);color:var(--on,#0a0a0a)}#vbk-chat .m.out{align-self:flex-start;background:var(--card,#1d1d1d);border:1px solid var(--line,#333)}#vbk-chat .m.sys{align-self:center;font-size:12px;opacity:.75}'+
   '#vbk-chat .m small{display:block;opacity:.65;font-size:11px;margin-top:3px}#vbk-chat form{padding:10px;border-top:1px solid var(--line,#333);display:flex;flex-direction:column;gap:6px}#vbk-chat input,#vbk-chat textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--line,#333);border-radius:10px;background:rgba(0,0,0,.3);color:inherit;font:14px inherit;font-family:inherit;text-transform:none}'+
   '#vbk-chat .snd{min-height:46px;border:0;border-radius:10px;background:var(--acc,#c6f135);color:var(--on,#0a0a0a);font-weight:700;cursor:pointer}#vbk-chat .err{color:#f87171;font-size:12.5px;min-height:1em}#vbk-chat .cs{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}#vbk-chat .cs button{min-width:44px;min-height:44px;border-radius:10px;border:1px solid var(--line,#333);background:transparent;color:inherit;cursor:pointer}#vbk-chat .note{font-size:11.5px;opacity:.7}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* ---------- Mis pedidos (los guarda este celular; el estado lo da el sistema del local) ---------- */
  function pedsGet(){try{var a=JSON.parse(localStorage.getItem('rave.peds')||'[]');return Array.isArray(a)?a.filter(function(x){return x&&x.tok;}):[];}catch(e){return [];}}
  function pedsSet(a){try{localStorage.setItem('rave.peds',JSON.stringify(a.slice(0,10)));}catch(e){}}
  var EST={recibido:['📨',['Recibido','Received'],1],confirmado:['✅',['Confirmado','Confirmed'],1],preparando:['📦',['Preparando tu pedido','Preparing your order'],2],listo:['📦',['Listo para salir','Ready to go'],3],en_camino:['🛵',['En camino','On the way'],4],entregado:['🎉',['Entregado','Delivered'],5],ausente:['🚪',['No te encontramos','We could not find you'],-1],cancelado:['✖️',['Cancelado','Cancelled'],-1]};
  var stc={};
  function refresh(){var P=pedsGet();if(!P.length||!API.track)return Promise.resolve();return Promise.resolve(API.track(P.map(function(p){return p.tok;}))).then(function(r){(r||[]).forEach(function(x){if(x&&x.ref)stc[x.ref]=x;});}).catch(function(){});}
  function pedHTML(p){var s=stc[p.tok]||{},k=s.estado||p.st||'recibido',e=EST[k]||EST.recibido,n=e[2],w=wa();
   var bars=n<0?'':'<div class="vbk-st" aria-hidden="true">'+[1,2,3,4,5].map(function(i){return '<i class="'+(i<=n?'on':'')+'"></i>';}).join('')+'</div>';
   return '<div class="vbk-ped"><div><b>'+e[0]+' '+esc(L(e[1][0],e[1][1]))+'</b>'+(s.eta?' · '+esc(s.eta):'')+'</div>'+bars+'<div class="vbk-m">'+L('Pedido','Order')+' '+esc(p.n||'')+' · '+new Date(p.ts).toLocaleString('es-AR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+(p.total?' · '+money(p.total):'')+(s.rep?' · '+L('te lo lleva ','courier: ')+esc(s.rep):'')+'</div>'+
    (n>0&&n<5&&p.pin?'<div class="vbk-m" style="margin-top:6px">'+L('Código de entrega (dáselo al repartidor):','Delivery code (give it to the courier):')+'</div><div class="vbk-pin">'+esc(p.pin)+'</div>':'')+
    (w?'<a class="vbk-btn" target="_blank" rel="noopener" href="https://wa.me/'+w+'?text='+encodeURIComponent(L('Hola, consulto por mi pedido ','Hi, about my order ')+(p.n||''))+'">💬 '+L('Consultar por WhatsApp','Ask on WhatsApp')+'</a>':'')+'</div>';}
  /* ---------- Mi cuenta ---------- */
  var tab='ped';
  function RA(){try{return window.parent.RAVE_APP||null;}catch(e){return null;}}
  function paneCon(){var s=site(),a=s.app||{},w=wa(),h='';var nm=s.title&&s.title!=='RAVE DIGITAL'?s.title:'';
   (a.btns||[]).forEach(function(b){if(w&&b.k!=='pedir')h+='<a class="vbk-btn" target="_blank" rel="noopener" href="https://wa.me/'+w+'?text='+encodeURIComponent(b.msg||'Hola!')+'">'+esc(b.ic||'💬')+' '+esc(b.t)+'</a>';});
   if(w)h='<a class="vbk-btn acc" target="_blank" rel="noopener" href="https://wa.me/'+w+'?text='+encodeURIComponent('¡Hola'+(nm?' '+nm:'')+'!')+'">💬 WhatsApp</a>'+h;
   if(a.tel&&a.llamar!==false)h+='<a class="vbk-btn" href="tel:'+esc(String(a.tel).replace(/[^\d+]/g,''))+'">📞 '+L('Llamar','Call')+'</a>';
   if(s.address&&a.mapa!==false)h+='<a class="vbk-btn" target="_blank" rel="noopener" href="'+esc(s.mapUrl&&/^https:/.test(s.mapUrl)?s.mapUrl:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.mapQuery||s.address))+'">📍 '+L('Cómo llegar','Directions')+' · '+esc(s.address)+'</a>';
   (s.social||[]).forEach(function(x){if(/^https:/.test(x.url))h+='<a class="vbk-btn" target="_blank" rel="noopener" href="'+esc(x.url)+'">🔗 '+esc(x.label)+'</a>';});
   (s.canales||[]).forEach(function(x){if(x.k!=='wa'&&/^(https:|mailto:)/.test(x.url))h+='<a class="vbk-btn" target="_blank" rel="noopener" href="'+esc(x.url)+'">'+esc(x.ic||'💬')+' '+esc(x.t||x.k)+'</a>';});
   if(API.chatOn&&API.chatOn())h+='<button type="button" class="vbk-btn" data-k="chat">💬 '+L('Chatear con nosotros','Chat with us')+'</button>';
   if(a.horario)h+='<p class="vbk-m">🕒 '+esc(a.horario)+'</p>';return h||'<p class="vbk-m">—</p>';}
  function paneApp(){var ra=RA(),ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
   if(ra&&ra.installed&&ra.installed())return '<p>✅ '+L('Ya tenés la app instalada en este celular.','The app is already installed.')+'</p>';
   return '<p class="vbk-m">'+L('Instalala en tu celular: entrás con un toque, ves tus pedidos y tu tarjeta del club, aunque no tengas señal.','Install it on your phone: one tap to see your orders and club card, even offline.')+'</p>'+
    (ra&&ra.can&&ra.can()?'<button type="button" class="vbk-btn acc" data-k="inst">📲 '+L('Instalar la app','Install the app')+'</button>':'<p class="vbk-m">'+(ios?L('En iPhone: tocá Compartir y después «Agregar a inicio».','On iPhone: tap Share, then “Add to Home Screen”.'):L('En Android: menú ⋮ del navegador y «Instalar app» o «Agregar a la pantalla principal».','On Android: browser menu ⋮ and “Install app”.'))+'</p>');}
  function meOpen(t){if(t)tab=t;var o=$('#vbk-me');if(!o){o=document.createElement('div');o.id='vbk-me';o.className='vbk-sheet';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label',L('Mi cuenta','My account'));document.body.appendChild(o);
    o.addEventListener('click',function(e){if(e.target===o||e.target.closest('.vbk-x')){meClose();return;}var b=e.target.closest('[data-t]');if(b){tab=b.getAttribute('data-t');paint();return;}var k=e.target.closest('[data-k]');if(!k)return;k=k.getAttribute('data-k');
     if(k==='chat'){meClose();if(window.VBK_CHAT_OPEN)window.VBK_CHAT_OPEN();}if(k==='inst'){var ra=RA();if(ra&&ra.install)Promise.resolve(ra.install()).then(paint);}});}
   function paint(){var P=pedsGet(),hasPed=!!(rc()||P.length);if(!hasPed&&tab==='ped')tab='con';o.innerHTML='<div class="vbk-in"><div class="vbk-hd"><b>'+L('Mi cuenta','My account')+'</b><button type="button" class="vbk-x" aria-label="'+L('Cerrar','Close')+'">×</button></div>'+
     '<div class="vbk-tabs" role="tablist">'+(hasPed?[['ped',L('Mis pedidos','My orders')+(P.length?' ('+P.length+')':'')]]:[]).concat([['con',L('Contacto','Contact')],['app','App']]).map(function(x){return '<button type="button" role="tab" data-t="'+x[0]+'" aria-selected="'+(tab===x[0])+'">'+esc(x[1])+'</button>';}).join('')+'</div>'+
     '<div>'+(tab==='ped'?(P.length?P.map(pedHTML).join(''):'<p class="vbk-m">'+L('Todavía no hiciste pedidos con envío desde este celular. Cuando hagas uno, lo seguís acá en vivo.','No delivery orders from this phone yet.')+'</p>'):tab==='con'?paneCon():paneApp())+'</div></div>';}
   o._p=paint;paint();o.hidden=false;if(tab==='ped')refresh().then(function(){if(o._p&&!o.hidden)o._p();});}
  function meClose(){var o=$('#vbk-me');if(o)o.remove();}
  window.VBK_OPEN=meOpen;
  var me=document.createElement('button');me.id='vbk-me-fab';me.type='button';me.className='vbk-fab';me.innerHTML='<span aria-hidden="true">👤</span><span class="t"></span>';me.addEventListener('click',function(){meOpen();});document.body.appendChild(me);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')meClose();});

  /* ---------- chat «Escribinos» ---------- */
  (function(){if(typeof API.chatOn!=='function')return;
   function rvCardIn(t){var m=String(t||'').match(/(?:\d[ \-.]?){12,18}\d/g)||[];for(var i=0;i<m.length;i++){var d=m[i].replace(/\D/g,'');if(d.length>=13&&d.length<=19)return true;}return false;}
   var fab=document.createElement('button');fab.id='vbk-chat-fab';fab.type='button';fab.className='vbk-fab';fab.innerHTML='<span aria-hidden="true">💬</span><span class="t"></span><span class="d" aria-hidden="true"></span>';document.body.appendChild(fab);
   var box=document.createElement('div');box.id='vbk-chat';box.setAttribute('role','dialog');box.setAttribute('aria-label',L('Chat con el comercio','Chat with the shop'));document.body.appendChild(box);var open=false,timer=null;
   function paint(keep){var s=API.chatState(),greet=API.chatGreet()||L('¡Hola! Escribinos y te respondemos por acá.','Hi! Write to us and we will answer here.'),msgs=s?s.msgs:[];
    var th='<div class="m out">'+esc(greet)+'</div>'+msgs.map(function(m){return '<div class="m '+(m.d==='in'?'in':m.d==='sys'?'sys':'out')+'">'+esc(m.x)+(m.d!=='sys'?'<small>'+(m.d==='out'&&m.u?esc(m.u)+' · ':'')+new Date(m.ts).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})+'</small>':'')+'</div>';}).join('');
    if(s&&s.csat)th+='<div class="m sys">'+L('¿Cómo te atendimos?','How did we do?')+'</div><div class="cs">'+[1,2,3,4,5].map(function(v){return '<button type="button" data-cs="'+v+'" aria-label="'+v+' de 5">'+v+'★</button>';}).join('')+'</div>';
    var draft=keep&&box.querySelector('#vbk-ct')?box.querySelector('#vbk-ct').value:'';
    box.innerHTML='<header><span aria-hidden="true">💬</span><b>'+L('Escribinos','Chat with us')+'</b><button type="button" class="vbk-x" data-x aria-label="'+L('Cerrar','Close')+'">×</button></header><div class="th" aria-live="polite">'+th+'</div><form novalidate>'+
     (s?'':'<input id="vbk-cn" maxlength="60" autocomplete="name" placeholder="'+L('Tu nombre','Your name')+'" aria-label="'+L('Tu nombre','Your name')+'"><input id="vbk-cw" inputmode="tel" maxlength="20" autocomplete="tel" placeholder="'+L('Tu WhatsApp (opcional)','Your WhatsApp (optional)')+'" aria-label="WhatsApp">')+
     '<textarea id="vbk-ct" rows="2" maxlength="1500" placeholder="'+L('Escribí tu mensaje…','Type your message…')+'" aria-label="'+L('Mensaje','Message')+'"></textarea><div class="err" role="alert"></div><button class="snd" type="submit">'+L('Enviar','Send')+'</button>'+
     (s?'':'<div class="note">'+L('Usamos tus datos sólo para responderte. La conversación queda guardada en este celular.','We only use your details to reply.')+'</div>')+'</form>';
    var ta=box.querySelector('#vbk-ct');if(draft)ta.value=draft;var t=box.querySelector('.th');t.scrollTop=t.scrollHeight;fab.classList.remove('new');}
   function poll(){return Promise.resolve(API.chatPoll()).then(function(n){if(n>0){if(open)paint(true);else fab.classList.add('new');}}).catch(function(){});}
   function show(v){open=v;box.style.display=v?'flex':'none';fab.style.display=v?'none':(API.chatOn()?'flex':'none');clearInterval(timer);if(v){paint();poll();timer=setInterval(poll,8000);var f=box.querySelector(API.chatState()?'#vbk-ct':'#vbk-cn');if(f)f.focus();}else timer=setInterval(poll,60000);}
   box.addEventListener('click',function(e){if(e.target.closest('[data-x]')){show(false);fab.focus();return;}var c=e.target.closest('[data-cs]');if(c)Promise.resolve(API.chatCsat(+c.getAttribute('data-cs'))).then(function(){paint(true);});});
   box.addEventListener('keydown',function(e){if(e.key==='Escape'){show(false);fab.focus();}});
   box.addEventListener('submit',function(e){e.preventDefault();var ta=box.querySelector('#vbk-ct'),er=box.querySelector('.err'),b=box.querySelector('.snd'),n=box.querySelector('#vbk-cn'),w=box.querySelector('#vbk-cw');
    if(rvCardIn(ta.value)){er.textContent=L('Por tu seguridad no envíes números de tarjeta ni claves por chat.','For your safety, do not send card numbers or PINs by chat.');return;}
    b.disabled=true;er.textContent='';Promise.resolve(API.chatSend(ta.value,n?n.value:'',w?w.value:'')).then(function(r){b.disabled=false;if(!r||!r.ok){er.textContent=(r&&r.msg)||L('No se pudo enviar.','Could not send.');return;}ta.value='';paint();}).catch(function(){b.disabled=false;er.textContent=L('No se pudo enviar.','Could not send.');});});
   fab.addEventListener('click',function(){show(true);});
   function tick(){var on=false;try{on=API.chatOn();}catch(e){}fab.querySelector('.t').textContent=L('Escribinos','Chat');if(!open)fab.style.display=on?'flex':'none';if(!on&&open)show(false);me.querySelector('.t').textContent=L('Mi cuenta','My account');}
   tick();setInterval(tick,1500);window.VBK_CHAT_OPEN=function(){show(true);};})();
  if(!window.VBK_CHAT_OPEN)me.querySelector('.t').textContent=L('Mi cuenta','My account');

  /* ---------- envío a domicilio con seguimiento ---------- */
  var R={on:false,f:{},z:'',pago:'efectivo',ll:null,busy:false};
  function rc(){var s=site();return s.rep&&s.rep.on&&s.rep.zonas&&s.rep.zonas.length&&API.repOrder?s.rep:null;}
  function K(){return window.VB_KIT||null;}
  function zona(c){for(var i=0;i<c.zonas.length;i++)if(c.zonas[i].id===R.z)return c.zonas[i];return null;}
  function keep(b){b.querySelectorAll('input[data-f]').forEach(function(i){R.f[i.getAttribute('data-f')]=i.value;});var z=$('#vbk-z');if(z)R.z=z.value;}
  function fi(k,lb,mx,tp){return '<label>'+lb+'<input data-f="'+k+'" maxlength="'+mx+'"'+(tp?' inputmode="'+tp+'"':'')+' autocomplete="off" value="'+esc(R.f[k]||'')+'"></label>';}
  function repRender(){var k=K(),c=rc();if(!k||!k.mount)return;var b=$('#vbk-rep');if(!c){if(b)b.remove();return;}if(!b){b=document.createElement('div');b.id='vbk-rep';k.mount.appendChild(b);
    b.addEventListener('change',function(e){var t=e.target;if(t.getAttribute('data-f'))return;keep(b);if(t.id==='vbk-on')R.on=t.checked;if(t.name==='vbk-pg')R.pago=t.value;repRender();});
    b.addEventListener('input',function(e){var f=e.target.getAttribute('data-f');if(f)R.f[f]=e.target.value;});
    b.addEventListener('click',function(e){if(!e.target.closest('#vbk-gps'))return;if(!navigator.geolocation)return toast(L('Tu celular no comparte la ubicación.','Location not available.'));navigator.geolocation.getCurrentPosition(function(p){keep(b);R.ll={lat:Math.round(p.coords.latitude*1e6)/1e6,lng:Math.round(p.coords.longitude*1e6)/1e6};repRender();},function(){toast(L('No se pudo tomar la ubicación: escribí la dirección.','Could not get your location.'));},{timeout:10000});});}
   if(!R.z&&c.zonas.length===1)R.z=c.zonas[0].id;var tot=k.total?k.total():0,z=zona(c);
   var h='<h4>🛵 '+L('Envío a domicilio','Home delivery')+'</h4><label class="opt"><input type="checkbox" id="vbk-on"'+(R.on?' checked':'')+'> '+L('Quiero que me lo lleven (con seguimiento en vivo)','Deliver it to me (live tracking)')+'</label>';
   if(R.on){h+='<label>'+L('Zona','Area')+'<select id="vbk-z"><option value="">'+L('Elegí tu zona','Choose your area')+'</option>'+c.zonas.map(function(x){return '<option value="'+esc(x.id)+'"'+(R.z===x.id?' selected':'')+'>'+esc(x.nombre)+' · '+(x.tarifa?money(x.tarifa):L('sin costo','free'))+(x.eta?' · '+esc(x.eta):'')+'</option>';}).join('')+'</select></label>'+
    '<div class="row2">'+fi('nm',L('Quién recibe','Recipient'),60)+fi('tl',L('Teléfono / WhatsApp','Phone'),24,'tel')+'</div>'+fi('dr',L('Calle y número','Street and number'),90)+'<div class="row2">'+fi('lc',L('Barrio','Neighbourhood'),60)+fi('rf',L('Referencia (piso, timbre…)','Reference'),80)+'</div>'+
    '<button type="button" class="vbk-btn" id="vbk-gps">📍 '+(R.ll?L('Ubicación compartida ✓','Location shared ✓'):L('Compartir mi ubicación (ayuda al repartidor)','Share my location'))+'</button>'+
    '<label class="opt"><input type="radio" name="vbk-pg" value="efectivo"'+(R.pago==='efectivo'?' checked':'')+'> 💵 '+L('Efectivo al recibir','Cash on delivery')+'</label><label class="opt"><input type="radio" name="vbk-pg" value="transferencia"'+(R.pago==='transferencia'?' checked':'')+'> 🏦 '+L('Transferencia','Bank transfer')+'</label>'+
    (R.pago==='efectivo'?fi('ab',L('¿Con cuánto pagás? (para el vuelto)','Paying with? (for change)'),10,'numeric'):(c.alias?'<p class="vbk-m">'+L('Alias: ','Alias: ')+'<b>'+esc(c.alias)+'</b></p>':''))+
    '<div class="sum" role="status">'+(z?'<b>'+L('Envío','Delivery')+':</b> '+(z.tarifa?money(z.tarifa):L('sin costo','free'))+'<br><b>'+L('Total estimado','Estimated total')+':</b> '+money(tot+(z.tarifa||0)):'')+'</div><div class="err" id="vbk-err" role="alert" hidden></div>'+
    '<p class="vbk-m">'+L('Tu pedido va directo al sistema del local. Te damos un código para el repartidor y lo seguís en «Mi cuenta».','Your order goes straight to the shop. Follow it in “My account”.')+'</p>';}
   b.innerHTML=h;}
  function err(m){var e=$('#vbk-err');if(e){e.textContent=m;e.hidden=false;e.scrollIntoView&&e.scrollIntoView({block:'nearest'});}return true;}
  window.VB_KIT_SEND=function(){var k=K(),c=rc();if(!k||!c||!R.on)return false;if(R.busy)return true;var b=$('#vbk-rep');if(b)keep(b);
   var z=zona(c);if(!z)return err(L('Elegí tu zona.','Choose your area.'));var tot=k.total();if(z.minimo&&tot<z.minimo)return err(L('La compra mínima para tu zona es ','Minimum for your area is ')+money(z.minimo)+'.');
   var f=R.f;if(String(f.nm||'').trim().length<2)return err(L('Escribí el nombre de quien recibe.','Enter the recipient name.'));if(!/^[\d\s+()-]{6,24}$/.test(String(f.tl||'').trim()))return err(L('Escribí un teléfono válido.','Enter a valid phone.'));
   if(String(f.dr||'').trim().length<4&&!R.ll)return err(L('Escribí la calle y el número (o compartí tu ubicación).','Enter your address.'));
   var it=(k.items()||[]).filter(function(x){return x.qty>0;}).map(function(x){return {id:x.id,q:x.qty};});if(!it.length)return err(L('Tu pedido está vacío.','Your order is empty.'));
   var ab=String(f.ab||'').replace(/\D/g,'');var ped={nombre:String(f.nm).trim(),tel:String(f.tl).trim(),dir:String(f.dr||'').trim(),loc:String(f.lc||'').trim(),ref:String(f.rf||'').trim(),lat:R.ll?R.ll.lat:null,lng:R.ll?R.ll.lng:null,zona:z.id,items:it,pago:R.pago,abona:ab?+ab:0,cupon:''};
   if(R.pago==='efectivo'&&ped.abona&&ped.abona<tot+(z.tarifa||0))return err(L('El importe con el que pagás es menor al total.','The amount is lower than the total.'));
   R.busy=true;Promise.resolve(API.repOrder(ped)).then(function(r){R.busy=false;if(!r||!r.ok){err((r&&r.msg)||L('No pudimos enviar el pedido. Probá de nuevo o pedí por WhatsApp.','We could not send the order.'));return;}
     var a=pedsGet().filter(function(x){return x.tok!==r.tok;});a.unshift({tok:r.tok,pin:r.pin,n:r.n||'',ts:Date.now(),total:tot+(z.tarifa||0),st:'recibido'});pedsSet(a);
     R.on=false;R.ll=null;try{k.clear();}catch(x){}try{k.close&&k.close();}catch(x){}repRender();meOpen('ped');toast(L('¡Pedido enviado! Tu código de entrega es ','Order sent! Delivery code: ')+r.pin);})
    .catch(function(){R.busy=false;err(L('No pudimos enviar el pedido (¿hay internet?).','Could not send the order.'));});return true;};
  function lift(){var k=K(),el=null;try{el=k&&k.lift&&k.lift();}catch(e){}var h=0;if(el&&el.nodeType===1){var r=el.getBoundingClientRect();if(r.height&&getComputedStyle(el).visibility!=='hidden'&&r.top<window.innerHeight)h=Math.max(0,window.innerHeight-r.top);}else if(el===true)h=70;
   var px=(h?h+12:16)+'px';[me,$('#vbk-chat-fab')].forEach(function(f){if(f)f.style.bottom=px;});}
  window.VB_KIT_REFRESH=function(){repRender();lift();};
  setInterval(lift,500);window.addEventListener('resize',lift);
  window.VB_KIT_REFRESH();
})();
