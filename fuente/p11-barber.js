/* ===== V27.6 · Capa BARBERÍA Bacano Show Room · Barber Shop (perfil `barber` = raveholding/Bacano) =====
   Rubro sobre la base genérica de un solo dueño del Sistema VB (V26.65, esqueleto V27.2). Todo lo general (Vender, Gestión de caja
   con tablero del turno y Corte X/Z, Club completo, Recursos Humanos, Atención al cliente, Compras, ARCA, Ctrl + K, tema claro/oscuro)
   es el del núcleo, sin copias. Esta capa suma sólo lo propio de una barbería multi-sucursal:
   · Hoy en el local (sillas en vivo y cola de espera) · Agenda de turnos por sucursal y barbero (estados, WhatsApp, Google Calendar)
   · Turnero online en la página pública (4 pasos) · Barberos y liquidación (alquiler de silla o comisión por corte, propinas)
   · Ranking y trazabilidad · Stock por sucursal con transferencias · Campañas por WhatsApp que se arman solas
   · Cada visita cobrada suma un sello del Club Bacano (los productos no suman sellos).
   El cobro de un turno se hace en Vender (pagos mixtos, vuelto, cupón, nivel, monedero, ARCA y la caja de la sucursal).
   Reglas Sistema VB: datos rotulados «ejemplo»; nada simula un cobro o un CAE reales; auditoría encadenada en cada paso. */
function isBarberBuild(){return !!(typeof window!=='undefined'&&window.RAVE_BUILD&&window.RAVE_BUILD.profile==='barber');}
const BCM=60000,BCH=3600000,BCD=864e5;
const bcPad=n=>String(n).padStart(2,'0');
const bcHM=m=>bcPad(Math.floor(m/60))+':'+bcPad(m%60);
const bcMin=s=>{const m=/^(\d{1,2}):(\d{2})$/.exec(String(s||''));return m?(+m[1])*60+(+m[2]):NaN;};
const bcNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const bcFirst=n=>String(n||'').split(/[ ·(]/)[0];
const bcDow=k=>new Date(k+'T12:00:00Z').getUTCDay();
const BC_DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const bcDayLbl=k=>{const t=dkey(now());if(k===t)return 'Hoy';if(k===addDays(t,1))return 'Mañana';if(k===addDays(t,-1))return 'Ayer';const d=new Date(k+'T12:00:00Z');return BC_DIAS[d.getUTCDay()].replace(/^./,c=>c.toUpperCase())+' '+d.getUTCDate()+'/'+(d.getUTCMonth()+1);};
const bcNowMin=()=>{const d=new Date(now());return d.getHours()*60+d.getMinutes();};
const BC_OPEN=600,BC_CLOSE=1260,BC_STEP=15; /* lunes a sábado de 10 a 21 h, domingo cerrado */
Object.assign(IC,{tijera:'M6 7a2.5 2.5 0 1 0 0-.01M6 17a2.5 2.5 0 1 0 0-.01M8.2 8.2 20 18M8.2 15.8 20 6',
 agenda:'M4 5h16v15H4zM4 9h16M8 3v4M16 3v4M8 13h3M8 16h6',silla:'M7 3h10v7H7zM5 10h14v3H5zM8 13v8M16 13v8M6 21h4M14 21h4',
 trofeo:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 21h6M10 17h4v4h-4z',
 mega:'M3 10v4h3l7 4V6L6 10zM16 9a3 3 0 0 1 0 6M18.5 6.5a7 7 0 0 1 0 11',
 sucur:'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6',barbpole:'M9 3h6v18H9zM9 7l6 3M9 11l6 3M9 15l6 3',
 money2:'M3 6h18v12H3zM7 12h.01M17 12h.01M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5'});

/* ---------- permisos y roles propios ---------- */
if(isBarberBuild()){Object.assign(PERMS,{bc_agenda:'Barbería: agenda de turnos, cola de espera y sillas',bc_barb:'Barberos: modelos de trabajo (silla o comisión) y liquidaciones',
 bc_rank:'Ranking y números de la barbería',bc_stock:'Stock por sucursal y transferencias entre sucursales',bc_mkt:'Campañas por WhatsApp a clientes del Club',bc_mis:'Mis números (barbero)'});}
const bcCan=p=>!!user&&can(p);
const bcActor=()=>user?user.name:'Sistema';

/* ---------- datos de ejemplo de Bacano ---------- */
const BC_BR=[{id:'centro',name:'Bacano Centro',short:'Centro',zona:'Microcentro',dir:'Balcarce 480, Salta Capital',tel:'+54 9 387 421-5480',wa:'5493874215480',hor:'Lunes a sábado de 10 a 21 h',sillas:6,color:'#d3263a',branch:'bcb-centro',reg:'bcr-centro',caja:1},
 {id:'norte',name:'Bacano Norte',short:'Norte',zona:'Zona Norte',dir:'Av. Bolivia 3150, Salta Capital',tel:'+54 9 387 439-3150',wa:'5493874393150',hor:'Lunes a sábado de 10 a 21 h',sillas:5,color:'#3b63d6',branch:'bcb-norte',reg:'bcr-norte',caja:2}];
const bcBr=id=>BC_BR.find(b=>b.id===id)||null;
const bcBrOfBranch=bid=>BC_BR.find(b=>b.branch===bid)||null;
/* [id empleado, nombre, apodo, sucursal, modelo, % comisión, alquiler mensual ($), habilidad, color, especialidad, desde] */
const BC_BARB=[['b1','Julián Ferreyra','El Maestro','centro','comision',50,0,1.55,'#e8e3da','Fades y diseños',2019],['b2','Nicolás Paz','Nico','centro','alquiler',0,185000,1.35,'#f08593','Barba y navaja',2021],
 ['b3','Tomás Gutiérrez','Tomi','centro','comision',45,0,1.0,'#7fd1ae','Cortes clásicos',2022],['b4','Brian Sosa','Bri','centro','comision',40,0,0.8,'#c4a6f0','Color y platinados',2024],
 ['b5','Lucas Medina','Luki','norte','alquiler',0,165000,1.45,'#8fa9f2','Degradés',2020],['b6','Facundo Ruiz','Facu','norte','comision',50,0,1.2,'#f2c46d','Corte + barba',2021],
 ['b7','Kevin Ortiz','Kevo','norte','comision',40,0,0.9,'#a8e070','Freestyle y diseños',2023],['b8','Santiago Vera','Santi','norte','alquiler',0,165000,1.0,'#f5a274','Cortes de niños',2022]];
/* servicios: [id, nombre, precio ($), minutos, popularidad, descripción] */
const BC_SVC=[['sv-corte','Corte clásico',9000,30,5,'Tijera y máquina, lavado y peinado.'],['sv-fade','Fade / degradé',11000,40,6,'Degradé a navaja o máquina, del 0 al que quieras.'],
 ['sv-cb','Corte + barba',14500,50,5,'Corte completo y barba perfilada con toalla caliente.'],['sv-barba','Perfilado de barba',6500,20,3,'Contorno, rebaje y aceite.'],
 ['sv-navaja','Afeitado a navaja',8000,30,2,'Afeitado clásico con toalla caliente y post afeitado.'],['sv-nino','Corte niño',7000,25,2,'Hasta 12 años.'],
 ['sv-color','Color / platinado',28000,90,.6,'Decoloración y matiz. Consultá antes por WhatsApp.'],['sv-diseno','Diseño freestyle',4500,15,1.2,'Líneas y dibujos a navaja (se suma a un corte).']];
const BC_TIP='sv-propina';
const BC_CATS=[['bc-svc','Servicios de barbería','#d3263a','Servicios','grid'],['bc-pei','Peinado','#a16207','Peinado','grid'],['bc-bar','Barba','#b45309','Barba','grid'],['bc-cui','Cuidado','#0f766e','Cuidado','grid'],['bc-acc','Accesorios y merch','#1d4ed8','Accesorios','grid']];
/* productos: [id, nombre, categoría, descripción, precio, costo, mínimo por sucursal, popularidad, proveedor, stock Centro, stock Norte] */
const BC_PROD=[['pr-pomada','Pomada fijación fuerte','bc-pei','Fijación todo el día y brillo medio.',12500,6200,8,5,'pv1',14,9],['pr-cera','Cera mate acabado natural','bc-pei','Textura y volumen sin brillo.',11800,5800,6,4,'pv1',10,4],
 ['pr-polvo','Polvo texturizador','bc-pei','Volumen instantáneo para cabello fino.',9500,4300,5,2,'pv2',6,7],['pr-spray','Spray fijador','bc-pei','Sella el peinado sin dejarlo duro.',10900,5200,5,2,'pv2',3,6],
 ['pr-gel','Gel de fijación extrema','bc-pei','Máxima fijación para diseños.',6800,3000,6,2,'pv1',12,10],['pr-aceite','Aceite para barba','bc-bar','Suaviza, hidrata y da brillo. Aroma a madera.',14500,6900,6,4,'pv2',9,2],
 ['pr-balsamo','Bálsamo para barba','bc-bar','Modela y controla los pelos rebeldes.',13900,6600,5,3,'pv2',7,6],['pr-shbarba','Shampoo para barba','bc-bar','Limpia sin resecar.',12800,6000,5,2.5,'pv2',5,5],
 ['pr-bigote','Cera para bigote','bc-bar','Fijación firme, formato de bolsillo.',7900,3400,3,.8,'pv2',4,0],['pr-kit','Kit barba completo','bc-bar','Aceite, bálsamo y peine de madera en caja de regalo.',32900,17000,3,1,'pv2',4,3],
 ['pr-shdiario','Shampoo de uso diario','bc-cui','Limpieza suave para todos los días.',11500,5600,5,2,'pv1',8,6],['pr-anticaspa','Shampoo anticaspa','bc-cui','Controla la caspa y calma el cuero cabelludo.',12300,6000,4,1.5,'pv1',5,3],
 ['pr-post','Crema post afeitado','bc-cui','Calma e hidrata después de la navaja. Sin alcohol.',13200,6300,4,1.5,'pv1',6,4],['pr-peine','Peine de madera','bc-acc','Artesanal, antiestático.',7500,3200,5,1.5,'pv2',11,8],
 ['pr-cepillo','Cepillo de barba','bc-acc','Cerdas naturales.',16900,8200,3,1,'pv2',3,2],['pr-gorra','Gorra Bacano','bc-acc','Bordada con el logo. Talle único regulable.',14000,6500,3,.8,'pv3',6,4],
 ['pr-remera','Remera Bacano','bc-acc','Algodón peinado con estampa del local.',22000,10500,3,.6,'pv3',5,1]];
const BC_PROV=[['pv1','Distribuidora Andina','Cosmética capilar','387 421-7700','ventas@andina.example',38500000],['pv2','Barber Supply NOA','Insumos de barbería','387 439-8800','pedidos@barbersupply.example',0],['pv3','Textil Salta','Merchandising','387 422-3300','hola@textilsalta.example',9200000]];
const BC_ORIG={web:'Turnero web',whatsapp:'WhatsApp',mostrador:'Mostrador',instagram:'Instagram',cola:'Cola de espera'};
const BC_ST={pend:{l:'A confirmar',c:'#7c3aed'},conf:{l:'Confirmado',c:'#2563eb'},llego:{l:'En el local',c:'#d97706'},atend:{l:'Atendiendo',c:'#ea580c'},hecho:{l:'Atendido',c:'#15803d'},novino:{l:'No vino',c:'#b91c1c'},cancel:{l:'Cancelado',c:'#6b7280'}};
const BC_LIVE=['pend','conf','llego','atend'];
function bcCuit(i){const b='3071'+String(2000000+i*7919).slice(-6);const w=[5,4,3,2,7,6,5,4,3,2];for(let x=0;x<20;x++){const s=b.slice(0,9)+x%10;let t=0;for(let k=0;k<10;k++)t+=w[k]*(+s[k]);let d=11-(t%11);if(d===11)d=0;if(d<10)return s+d;}return '30712345671';}
function bcCatalog(){const P=[];const ean=i=>typeof soloEan==='function'?soloEan(500+i):'';
 BC_SVC.forEach(([id,n,pr,dur,pop,desc],i)=>P.push({id,name:n,sub:'',grupo:'',rubro:'bc-svc',price:pr*100,cost:0,stock:0,unit:'u',barcode:'',plu:'',menu:true,active:true,desc,featured:i<3,demo:true,svc:{dur,pop},noStock:true}));
 P.push({id:BC_TIP,name:'Propina para el barbero',sub:'',grupo:'',rubro:'bc-svc',price:100000,cost:0,stock:0,unit:'u',barcode:'',plu:'',menu:false,active:true,desc:'Va 100 % al barbero que atendió.',demo:true,svc:{dur:0,pop:0,tip:true},noStock:true});
 BC_PROD.forEach(([id,n,cat,desc,pr,co,mi,pop,pv,sc,sn],i)=>P.push({id,name:n,sub:'',grupo:'',rubro:cat,price:pr*100,cost:co*100,stock:sc+sn,unit:'u',barcode:ean(i),plu:'',menu:true,active:true,desc,featured:pop>=4,demo:true,min:mi,prov:pv,bcs:{centro:sc,norte:sn},bcpop:pop}));
 return P;}
const bcIsSvc=p=>!!(p&&p.svc);
const bcIsTip=p=>!!(p&&p.svc&&p.svc.tip);

/* ---------- base de la demo (después de soloBase; antes de RR. HH.) ---------- */
function barberBase(d){if(typeof window==='undefined'||!window.__bcReady)return d;
 d.tenant=Object.assign({},d.tenant,{name:'Bacano',legal:'Bacano Show Room · Barber Shop (demo de ejemplo)',slogan:'Show Room · Barber Shop · Salta',address:'Balcarce 480 y Av. Bolivia 3150, Salta Capital (datos de ejemplo)',wa:'5493874215480',phone:'',caja:1,regId:'bcr-centro',ig:'',fb:''});
 d.menu=Object.assign({},d.menu,{title:'BACANO',sub:{es:'Show Room · Barber Shop',en:'Show Room · Barber Shop'},footer:{es:'Bacano · demo de evaluación',en:'Bacano · evaluation demo'},
  pitch:{es:'Tu corte, a tu hora. **Reservá online** en Centro o Norte.',en:'Your cut, your time. **Book online** in Centro or Norte.'},promo:{on:true,es:'**10 visitas = corte gratis** con el Club Bacano',en:'**10 visits = free cut** with Club Bacano'},mapQuery:'Bacano Barber Shop, Balcarce 480, Salta',mapUrl:'',reviewUrl:'',social:[],wifi:{on:false,ssid:'',pass:'',example:false}});
 const keep=d.rubros.filter(r=>r.kind==='cobr'||r.kind==='shared'||r.kind==='sysgen');
 d.rubros=BC_CATS.map(([id,name,color,mNom,layout])=>({id,name,color,mNom,mTitle:name,layout,owner:'',reparte:false,kind:'rubro',mHint:'',alcohol:false,active:true})).concat(keep);
 d.products=bcCatalog();
 d.cfg.comboSeeded=1;d.cfg.negStock=true;d.cfg.ticket=Object.assign({},d.cfg.ticket||{},{msg:'¡Gracias por elegir Bacano! Reservá tu próximo turno en la web.'});
 d.cfg.cashProfile='branches';d.cfg.xfer=Object.assign({},d.cfg.xfer||{},{strict:false,selfAuth:true,ownerV:1});
 d.branches=BC_BR.map((b,i)=>({id:b.branch,code:String(i+1),name:b.name,active:true}));
 d.registers=BC_BR.map(b=>({id:b.reg,code:String(b.caja),name:'Caja '+b.name,type:'operational',branchId:b.branch,parentId:'bcr-main',active:true})).concat([{id:'bcr-main',code:'P',name:'Caja principal (dueño)',type:'main',branchId:'bcb-centro',parentId:'',active:true}]);
 d.sessions=[];
 const today=new Date().toISOString().slice(0,10);
 d.coupons=[{id:'cp1',code:'BACANO10',type:'pct',value:10,min:0,from:'',to:'',maxUses:0,perCust:1,aud:'todos',active:true,public:true,note:'Bienvenida: 10 % en la segunda visita',uses:[]},
  {id:'cp2',code:'VUELVE15',type:'pct',value:15,min:0,from:'',to:addDays(today,30),maxUses:0,perCust:1,aud:'todos',active:true,public:false,note:'Para clientes que no vienen hace un tiempo',uses:[]},
  {id:'cp3',code:'CUMPLE20',type:'pct',value:20,min:0,from:'',to:'',maxUses:0,perCust:1,aud:'cumple',active:true,public:false,note:'Regalo de cumpleaños',uses:[]},
  {id:'cp4',code:'INVIERNO5',type:'pct',value:5,min:0,from:addDays(today,-90),to:addDays(today,-30),maxUses:0,perCust:0,aud:'todos',active:false,public:false,note:'Promo de invierno (vencida)',uses:[]}];
 d.plans=[{id:'pl1',name:'Bacano Pass',price:2500000,period:'mes',pct:15,desc:'15 % en todos los servicios y prioridad en la cola de espera (ejemplo)',active:true}];
 d.loyalty=Object.assign({},d.loyalty,{goal:10,reward:'Un corte clásico gratis',ledger:[],usedOtp:{}});
 d.puestos=[{id:'pu_soc',name:'Dueño',parent:'',holders:''},{id:'pu_enc',name:'Encargado de sucursal',parent:'pu_soc',holders:''},{id:'pu_bar',name:'Barbero',parent:'pu_enc',holders:''},{id:'pu_rec',name:'Recepción y caja',parent:'pu_enc',holders:''}];
 d.employees=BC_BARB.map(([id,name,apodo,br,mod,com,alq,sk,col,esp,desde],i)=>({id,name:name+' (ejemplo)',puestoId:(id==='b1'||id==='b5')?'pu_enc':'pu_bar',rate:0,pin:String(4400+i*17),active:true,
  dept:'Barbería',cargo:(id==='b1'||id==='b5')?'Encargado y barbero · '+bcBr(br).short:'Barbero · '+bcBr(br).short,bcFrom:i%2?'12:00':'10:00',bcTo:i%2?'21:00':'19:00',bcOff:0,
  bc:{br,apodo,modelo:mod,com,alq:alq*100,skill:sk,color:col,esp,desde}}));
 d.employees.push({id:'r1',name:'Micaela Arias (ejemplo)',puestoId:'pu_rec',rate:330000,pin:'4600',active:true,dept:'Recepción',cargo:'Recepción y caja · Centro',bcFrom:'10:00',bcTo:'18:00',bcOff:0,bcBr:'centro'},
  {id:'r2',name:'Rocío Cruz (ejemplo)',puestoId:'pu_rec',rate:330000,pin:'4617',active:true,dept:'Recepción',cargo:'Recepción y caja · Norte',bcFrom:'13:00',bcTo:'21:00',bcOff:0,bcBr:'norte'},
  {id:'a1',name:'Martín Bacano (ejemplo)',puestoId:'pu_soc',rate:0,pin:'4634',active:true,dept:'Administración',cargo:'Dueño',bcFrom:'11:00',bcTo:'17:00',bcOff:0});
 d.tasks=[{id:'t1',title:'Abrir caja y controlar el cambio',puestoId:'pu_rec',freq:'daily',active:true},{id:'t2',title:'Confirmar por WhatsApp los turnos de mañana',puestoId:'pu_rec',freq:'daily',active:true},
  {id:'t3',title:'Desinfectar herramientas y cambiar capas entre clientes',puestoId:'pu_bar',freq:'daily',active:true},{id:'t4',title:'Revisar stock bajo y pedir reposición',puestoId:'pu_enc',freq:'weekly',dow:1,active:true},
  {id:'t5',title:'Liquidar comisiones y cobrar alquiler de sillas',puestoId:'pu_soc',freq:'monthly',dom:1,active:true}];
 d.users=[{id:'u1',name:'Administrador',role:'admin',pin:'1111',empId:'a1'},{id:'u2',name:'Julián Ferreyra · Encargado Centro',role:'supervisor',pin:'2222',empId:'b1',bcBr:'centro'},
  {id:'u3',name:'Lucas Medina · Encargado Norte',role:'supervisor',pin:'3333',empId:'b5',bcBr:'norte'},{id:'u4',name:'Tomás Gutiérrez · Barbero Centro',role:'barbero',pin:'4444',empId:'b3',bcBr:'centro'},
  {id:'u5',name:'Recepción Centro · Micaela',role:'mostrador',pin:'0000',empId:'r1',bcBr:'centro'},{id:'u6',name:'Recepción Norte · Rocío',role:'mostrador',pin:'5555',empId:'r2',bcBr:'norte'},
  {id:'u-emp',name:'Portal del empleado',role:'empleado',pin:'7777',empId:'r1'}];
 d.roles=d.roles||{};const add=(r,L)=>{d.roles[r]=Array.from(new Set((d.roles[r]||[]).concat(L)));};
 add('admin',['bc_agenda','bc_barb','bc_rank','bc_stock','bc_mkt','bc_mis']);add('supervisor',['bc_agenda','bc_barb','bc_rank','bc_stock','bc_mkt','bc_mis','dashboard']);
 add('mostrador',['bc_agenda','bc_mkt']);
 d.roles.barbero=['bc_agenda','bc_mis','sell','customers','tasks','portal'];
 d.suppliers=BC_PROV.map(([id,n,rubro,tel,mail,saldo],i)=>({id,razon:n,cuit:bcCuit(i+1),iva:i%2?'Responsable Inscripto':'Monotributista',email:mail,tel,dir:'Salta (ejemplo) · '+rubro,saldo,activo:true,ts:Date.now()-90*BCD}));
 d.supLedger=d.suppliers.filter(s=>s.saldo>0).map((s,i)=>({id:'sl'+i,seq:i+1,provId:s.id,tipo:'Factura',monto:s.saldo,saldo:s.saldo,ts:Date.now()-(4+i*6)*BCD,ref:'FC A 0003-000'+(812+i)+' (ejemplo)'}));
 d.bc=null;
 return d;}

/* ---------- clientes, historial de 45 días, turnos y caja del día (después de los ejemplos generales) ---------- */
const BC_NOM=['Matías','Agustín','Joaquín','Franco','Gonzalo','Ignacio','Lautaro','Ezequiel','Rodrigo','Sebastián','Mauricio','Emiliano','Federico','Gastón','Leandro','Maximiliano','Cristian','Diego','Ramiro','Alejo','Bautista','Thiago','Benjamín','Valentín','Marcos','Pablo','Hernán','Damián','Esteban','Nahuel','Germán','Iván','Juan Cruz','Santino','Mateo','Gabriel','Lisandro','Axel','Elías','Martín','Tobías','Ulises','Ciro'];
const BC_APE=['Tolaba','Vilte','Saravia','Figueroa','Aguirre','Flores','Cruz','Guaymás','Mamaní','Zerpa','Cardozo','Arias','López','Romero','Ovejero','Ibarra','Villagrán','Burgos','Lamas','Rivero','Toledo','Correa','Gómez','Pereyra','Chocobar','Sajama','Torino'];
const BC_NOTE=['Prefiere degradé bajo, nunca rapado arriba','Viene con su hijo los sábados','Le gusta la barba bien marcada','Pide toalla caliente siempre','Cliente desde la apertura','Paga siempre por transferencia','Llega justo a horario, no hacerlo esperar','','','',''];
function bcRng(seed){let s=seed;return()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};}
const bcWpick=(R,a,w)=>{const t=a.reduce((x,y)=>x+w(y),0);let r=R()*t;for(const x of a){r-=w(x);if(r<=0)return x;}return a[a.length-1];};
function barberExtras(){if(!isBarberBuild())return;const t0=now();const R=bcRng(4417);const td=dkey(t0);
 /* 90 clientes del Club (ejemplo) */
 const used=new Set();const C=[];let i=0;
 while(C.length<90){const n=BC_NOM[Math.floor(R()*BC_NOM.length)],a=BC_APE[Math.floor(R()*BC_APE.length)];if(used.has(n+a))continue;used.add(n+a);i++;
  const br=R()<.55?'centro':'norte';const bs=BC_BARB.filter(b=>b[3]===br);const pref=bs[Math.floor(R()*bs.length)][0];const sv=bcWpick(R,BC_SVC.filter(s=>s[0]!=='sv-diseno'),s=>s[4])[0];
  const y=1975+Math.floor(R()*30),mo=1+Math.floor(R()*12),dd=1+Math.floor(R()*28);
  C.push({id:'bcc'+i,num:i,name:n,last:a+' (ejemplo)',birth:y+'-'+bcPad(mo)+'-'+bcPad(dd),wa:'+549387'+String(5100000+i*7331).slice(0,7),dni:String(28000000+i*91733).slice(0,8),cards:[],cardSecrets:{},origin:['Mostrador','Instagram','Recomendación','Google','Web'][Math.floor(R()*5)],
   consent:{club:true,comm:R()<.86,analytics:false,version:'v1-2026-demo',ts:t0-200*BCD},ts:t0-(60+Math.floor(R()*400))*BCD,status:'activo',limit:0,secret:'bc-'+i+'-tarjeta-ejemplo-0000',notes:BC_NOTE[Math.floor(R()*BC_NOTE.length)],channel:'minorista',
   bc:{br,barb:pref,svc:sv,freq:.35+R()*1.4,churn:i%9===4,nuevo:i>82}});}
 /* cumpleaños de hoy (para probar CUMPLE20 y la campaña) y uno que vuelve tras mucho tiempo */
 C[2].birth='1993'+td.slice(4);C[11].birth='1988'+td.slice(4);
 S.customers=C;
 /* sesiones históricas cerradas por sucursal */
 S.sessions=S.sessions.filter(s=>!s.demo);
 BC_BR.forEach(b=>S.sessions.push({id:'hist-'+b.id,caja:b.caja,openedBy:b.id==='centro'?'Recepción Centro · Micaela':'Recepción Norte · Rocío',openedAt:t0-50*BCD,opening:0,closedAt:t0-12*BCH,demo:true,regId:b.reg,regName:'Caja '+b.name,branchId:b.branch}));
 /* caja de hoy abierta en cada sucursal */
 BC_BR.forEach(b=>{if(!S.sessions.some(s=>!s.closedAt&&s.regId===b.reg))S.sessions.push({id:'bc-hoy-'+b.id,caja:b.caja,openedBy:b.id==='centro'?'Recepción Centro · Micaela':'Recepción Norte · Rocío',openedAt:new Date(td+'T09:52:00').getTime(),opening:2000000,closedAt:0,regId:b.reg,regName:'Caja '+b.name,branchId:b.branch});});
 S.sales=S.sales.filter(s=>!s.demo);BC_BR.forEach(b=>{S.seq[b.caja]=0;});
 const met=[['efectivo',4],['transferencia',3],['qr',3],['debito',2],['credito',1]];
 const D={v:1,seedAt:t0,turnos:[],cola:[],seq:{turno:0},liqs:[],sent:[],moves:[],br:{}};
 const svcP=id=>BC_SVC.find(s=>s[0]===id);
 const mkSale=(o)=>{const b=bcBr(o.br);S.seq[b.caja]=(S.seq[b.caja]||0)+1;const items=o.svcs.map(id=>{const p=prod(id);return{pid:id,name:p.name,rubro:p.rubro,qty:1,price:p.price,cost:0,list:p.price,disc:0};});
  (o.prods||[]).forEach(pid=>{const p=prod(pid);items.push({pid,name:p.name,rubro:p.rubro,qty:1,price:p.price,cost:p.cost,list:p.price,disc:0});});
  if(o.tip){items.push({pid:BC_TIP,name:'Propina para el barbero',rubro:'bc-svc',qty:1,price:o.tip,cost:0,list:o.tip,disc:0});}
  let disc=0,coupon='',benefit=null;if(o.cup){const cp=S.coupons.find(x=>x.code===o.cup);const it=items[0];it.disc=Math.round(it.price*cp.value/100);disc=it.disc;coupon=cp.code;benefit={kind:'coupon',label:'Cupón '+cp.code,disc,couponId:cp.id};cp.uses.push({ts:o.ts,sale:'x',cust:o.cust||'',demo:true});}
  if(o.free){const it=items[0];it.disc=it.price;disc=it.price;benefit={kind:'reward',label:'Premio del Club',disc};}
  const total=items.reduce((a,x)=>a+x.qty*x.price,0)-disc;const m=total>0?bcWpick(R,met,x=>x[1])[0]:'efectivo';const cu=o.cust?C.find(c=>c.id===o.cust):null;
  const s={id:'bs'+(o.id||uid()),n:b.caja+'-'+S.seq[b.caja],ts:o.ts,user:b.id==='centro'?'Recepción Centro · Micaela':'Recepción Norte · Rocío',caja:b.caja,sessId:o.sess,items,total,method:m,doc:'ticket_interno',status:'ok',fee:0,channel:'local',
   cust:cu?cu.id:'',custName:cu?custFull(cu):'',coupon,benefit,recv:0,fiado:false,demo:true,pays:[{m,a:total,fee:0}],fiadoAmt:0,paid:total,balance:0,pstate:'pagada',vuelto:0,
   bc:{barb:o.barb,br:o.br,turno:o.turno||'',tip:o.tip||0}};
  S.sales.push(s);return s;};
 const visits={};C.forEach(c=>visits[c.id]=[]);
 const nT=()=>++D.seq.turno;
 /* 45 días de historia (lunes a sábado) */
 for(let dd=45;dd>=1;dd--){const day=addDays(td,-dd);if(bcDow(day)===0)continue;const sat=bcDow(day)===6;
  BC_BR.forEach(b=>{const bs=BC_BARB.filter(x=>x[3]===b.id);const n=(b.id==='centro'?15:12)+(sat?6:0)+Math.floor(R()*5);
   for(let k=0;k<n;k++){const cli=R()<.82?bcWpick(R,C.filter(c=>c.bc.br===b.id&&!c.bc.nuevo&&(!c.bc.churn||dd>34)),c=>c.bc.freq):null;const pref=cli?bs.find(x=>x[0]===cli.bc.barb):null;
    const bar=pref&&R()<.62?pref:bcWpick(R,bs,x=>x[7]);const sv=cli&&R()<.58?cli.bc.svc:bcWpick(R,BC_SVC,x=>x[4])[0];const svcs=[sv];if(sv!=='sv-diseno'&&R()<.08)svcs.push('sv-diseno');if(sv==='sv-diseno')svcs.unshift('sv-corte');
    const t=BC_OPEN+Math.floor(R()*((BC_CLOSE-60-BC_OPEN)/15))*15;const ts=new Date(day+'T'+bcHM(t)+':00').getTime()+Math.floor(R()*10)*BCM;
    const tip=R()<.22?Math.round(svcP(svcs[0])[2]*(.08+R()*.08)/500)*50000:0;const prods=R()<.16?[bcWpick(R,BC_PROD,x=>x[7])[0]]:[];
    let cup='';if(cli&&visits[cli.id].length===1&&R()<.4)cup='BACANO10';
    let free=false;if(cli&&visits[cli.id].length&&(visits[cli.id].length+1)%10===0)free=true;
    const fromT=R()<.7;let tid='';if(fromT&&dd<=10){tid='bt'+nT();D.turnos.push({id:tid,n:D.seq.turno,br:b.id,barb:bar[0],day,t,dur:svcs.reduce((a,x)=>a+svcP(x)[3],0),svcs,cust:cli?cli.id:'',name:cli?custFull(cli).replace(' (ejemplo)',''):'Cliente de paso',tel:cli?cli.wa:'',st:'hecho',origin:['web','whatsapp','mostrador','instagram'][Math.floor(R()*4)],note:'',created:ts-3*BCD,log:[{s:'hecho',t:ts,by:'ejemplo'}]});}
    const s=mkSale({id:dd+'_'+b.id+'_'+k,br:b.id,barb:bar[0],svcs,prods,tip,cust:cli?cli.id:'',ts,sess:'hist-'+b.id,cup,free,turno:tid});if(tid){D.turnos[D.turnos.length-1].saleId=s.id;}
    if(cli)visits[cli.id].push(ts);}
   /* algún turno que no vino */
   if(dd<=10&&R()<.6){const bar=bs[Math.floor(R()*bs.length)];const cli=C.filter(c=>c.bc.br===b.id)[Math.floor(R()*30)];if(cli)D.turnos.push({id:'bt'+nT(),n:D.seq.turno,br:b.id,barb:bar[0],day,t:BC_OPEN+Math.floor(R()*40)*15,dur:30,svcs:['sv-corte'],cust:cli.id,name:custFull(cli).replace(' (ejemplo)',''),tel:cli.wa,st:'novino',origin:'web',note:'',created:t0-(dd+2)*BCD,log:[{s:'novino',t:t0-dd*BCD,by:'ejemplo'}]});}
  });}
 /* clientes nuevos: vinieron una sola vez (campaña «segunda visita») */
 C.filter(c=>c.bc.nuevo).forEach((c,j)=>{const day=addDays(td,-(9+j*2));if(bcDow(day)===0)return;const bs=BC_BARB.filter(x=>x[3]===c.bc.br);const ts=new Date(day+'T'+bcHM(BC_OPEN+60+j*45)+':00').getTime();
  mkSale({id:'nv'+j,br:c.bc.br,barb:c.bc.barb,svcs:[c.bc.svc],prods:[],tip:0,cust:c.id,ts,sess:'hist-'+c.bc.br});visits[c.id].push(ts);c.ts=ts-BCD;});
 /* sellos del Club: cada visita suma uno (cada 10, premio canjeado) */
 const L=[];C.forEach(c=>{const v=visits[c.id];v.forEach((ts,j)=>{L.push({id:'bl'+c.id+'_'+j,cust:c.id,ts,kind:'stamp',n:1,ref:'visita (ejemplo)',user:'sistema'});if((j+1)%10===0)L.push({id:'br'+c.id+'_'+j,cust:c.id,ts:ts+60000,kind:'redeem',n:-10,ref:'premio canjeado (ejemplo)',user:'sistema'});});});
 /* dos socios a un sello del premio (para la campaña) */
 [C[5],C[8]].forEach((c,k)=>{const have=visits[c.id].length%10;for(let j=have;j<9;j++)L.push({id:'bx'+c.id+'_'+j,cust:c.id,ts:t0-(20-j)*BCD,kind:'stamp',n:1,ref:'visita (ejemplo)',user:'sistema'});});
 S.loyalty.ledger=L;
 S.members=[{id:'mbc1',cust:'bcc1',plan:'pl1',from:t0-9*BCD,to:t0+21*BCD,status:'activa',method:'transferencia',price:2500000,terms:'ejemplo'},{id:'mbc2',cust:'bcc4',plan:'pl1',from:t0-20*BCD,to:t0+10*BCD,status:'activa',method:'qr',price:2500000,terms:'ejemplo'}];
 /* hoy y los próximos 7 días: agenda */
 const nowM=bcNowMin();
 for(let dd=0;dd<=7;dd++){const day=addDays(td,dd);if(bcDow(day)===0)continue;
  const usedDay=new Set();BC_BR.forEach(b=>{BC_BARB.filter(x=>x[3]===b.id).forEach(bar=>{const fill=dd===0?.5:dd<=2?.45:.3;let t=BC_OPEN+(bar[0].charCodeAt(1)%2?120:0);
   while(t<BC_CLOSE-30){if(R()<fill){const pool=C.filter(c=>c.bc.br===b.id&&!usedDay.has(c.id)&&!c.bc.churn);const cli=R()<.85&&pool.length?pool[Math.floor(R()*pool.length)]:null;if(cli)usedDay.add(cli.id);const sv=cli&&R()<.6?cli.bc.svc:bcWpick(R,BC_SVC.filter(s=>s[0]!=='sv-diseno'&&s[0]!=='sv-color'),s=>s[4])[0];
     const dur=svcP(sv)[3];if(t+dur>BC_CLOSE)break;let st=dd===0?(t+dur<=nowM?'hecho':t<=nowM?'atend':t<nowM+40?'llego':'conf'):(dd===1?(R()<.6?'conf':'pend'):dd===2?(R()<.75?'conf':'pend'):(R()<.88?'conf':'pend'));
     if(dd===0&&st==='hecho'&&R()<.07)st='novino';if(dd===0&&st==='llego'&&t>nowM+20)st='conf';
     const tr={id:'bt'+nT(),n:D.seq.turno,br:b.id,barb:bar[0],day,t,dur,svcs:[sv],cust:cli?cli.id:'',name:cli?custFull(cli).replace(' (ejemplo)',''):['Ariel M.','Lucio P.','Bruno T.','Pedro V.'][Math.floor(R()*4)],tel:cli?cli.wa:'+5493874'+String(100000+Math.floor(R()*899999)),st,origin:['web','web','whatsapp','mostrador','instagram'][Math.floor(R()*5)],note:R()<.15?'Viene con el hijo':'',created:t0-Math.floor(R()*6)*BCD,log:[{s:st,t:t0-BCH,by:'ejemplo'}]};
     if(st==='hecho'){const s=mkSale({id:'h'+tr.id,br:b.id,barb:bar[0],svcs:[sv],prods:R()<.15?[bcWpick(R,BC_PROD,x=>x[7])[0]]:[],tip:R()<.25?100000:0,cust:tr.cust,ts:new Date(day+'T'+bcHM(t+dur)+':00').getTime(),sess:'bc-hoy-'+b.id,turno:tr.id});s.demo=false;s.bcToday=1;tr.saleId=s.id;
      if(cli)L.push({id:'bt'+tr.id,cust:cli.id,ts:s.ts,kind:'stamp',n:1,ref:'visita '+s.n,user:'sistema'});}
     D.turnos.push(tr);t+=dur;t=Math.ceil(t/15)*15;}else t+=30;}});});}
 /* cola de espera de ahora */
 if(nowM>=BC_OPEN&&nowM<BC_CLOSE-30){D.cola.push({id:'bq1',br:'centro',name:'Joaquín (sin turno)',cust:'',tel:'',svcs:['sv-fade'],barb:'',ts:t0-14*BCM,st:'espera'},{id:'bq2',br:'centro',name:custFull(C[7]).replace(' (ejemplo)',''),cust:C[7].id,tel:C[7].wa,svcs:['sv-cb'],barb:'b1',ts:t0-6*BCM,st:'espera'},{id:'bq3',br:'norte',name:'Nahuel (sin turno)',cust:'',tel:'',svcs:['sv-corte'],barb:'',ts:t0-9*BCM,st:'espera'});}
 S.sales.sort((a,b)=>a.ts-b.ts);S.bc=D;
 /* fichadas de hoy: quien ya empezó su turno marcó la entrada */
 try{(S.hrShifts||[]).filter(sh=>sh.day===td).forEach((sh,k)=>{const a=new Date(td+'T'+sh.from+':00').getTime()+(k===3?14:k%4)*BCM;if(a>t0||S.punches.some(p=>p.empId===sh.empId&&dkey(p.ts)===td))return;S.punches.push({id:'bpt'+k,empId:sh.empId,ts:a,kind:'in',method:'pin kiosco',device:'ejemplo',by:'terminal'});});}catch(e){}}

/* ---------- estado de la capa (S.bc) ---------- */
function G(){if(!S.bc||!S.bc.turnos){S.bc={v:1,seedAt:now(),turnos:[],cola:[],seq:{turno:0},liqs:[],sent:[],moves:[],br:{}};save();}return S.bc;}
const bcEmp=id=>S.employees.find(e=>e.id===id);
const bcBarbs=br=>S.employees.filter(e=>e.active&&e.bc&&(!br||e.bc.br===br));
const bcBN=id=>{const e=bcEmp(id);return e?String(e.name).replace(/ \(ejemplo\)$/,''):'Sin asignar';};
const bcBF=id=>bcFirst(bcBN(id));
const bcTur=id=>G().turnos.find(t=>t.id===id);
const bcSvcName=ids=>(ids||[]).map(id=>(prod(id)||{name:'?'}).name).join(' + ');
const bcSvcTot=ids=>(ids||[]).reduce((a,id)=>a+((prod(id)||{}).price||0),0);
const bcSvcDur=ids=>(ids||[]).reduce((a,id)=>a+(((prod(id)||{}).svc||{}).dur||0),0)||30;
/* sucursal del usuario y del equipo */
const bcUserBr=()=>user&&user.bcBr?user.bcBr:'';
function bcViewBr(){const u=bcUserBr();if(u)return u;const D=G();return D.br.view||'';}
function bcEquipoBr(){const r=(S.registers||[]).find(x=>x.id===S.tenant.regId);const b=r?bcBrOfBranch(r.branchId):null;return b?b.id:'centro';}
function bcSetEquipo(br){const b=bcBr(br);if(!b)return;S.tenant.caja=b.caja;S.tenant.regId=b.reg;}
const bcBrTabs=(cur,act)=>bcUserBr()?`<span class="bc-brpill" style="--c:${bcBr(bcUserBr()).color}">${ico('sucur')} ${esc(bcBr(bcUserBr()).name)}</span>`
 :`<div class="ux-tabs" role="tablist" aria-label="Sucursal">${[['','Las dos sucursales']].concat(BC_BR.map(b=>[b.id,b.name])).map(([k,l])=>`<a role="tab" tabindex="0" aria-selected="${cur===k}" class="${cur===k?'on':''}" data-act="${act||'bcBrView'}" data-v="${k}">${esc(l)}</a>`).join('')}</div>`;
const bcBrOk=br=>{const u=bcUserBr();return !u||u===br;};
/* ventas de la barbería */
const bcSaleBr=s=>{if(s.bc&&s.bc.br)return s.bc.br;const se=S.sessions.find(x=>x.id===s.sessId);const b=se?bcBrOfBranch(se.branchId):null;return b?b.id:'centro';};
function bcSalesIn(from,to,br){return S.sales.filter(s=>s.status==='ok'&&s.ts>=from&&s.ts<to&&(!br||bcSaleBr(s)===br));}
const bcLineNet=it=>lineTotal(it);
function bcSplit(s){/* servicios, propinas y productos de una venta (netos de descuento) */const o={svc:0,tip:0,prod:0,n:0};s.items.forEach(it=>{const p=prod(it.pid);const v=bcLineNet(it);if(p&&bcIsTip(p)||it.pid===BC_TIP)o.tip+=v;else if(p&&bcIsSvc(p)||String(it.pid).startsWith('sv-')){o.svc+=v;o.n+=it.qty;}else o.prod+=v;});return o;}
/* liquidación de un barbero en un período: comisión = % de los servicios; alquiler = 100 % de los servicios para el barbero y paga la silla al mes */
function bcLiq(e,from,to){const ss=bcSalesIn(from,to).filter(s=>s.bc&&s.bc.barb===e.id);let svc=0,tip=0,n=0,prodv=0;const cl=new Set();ss.forEach(s=>{const x=bcSplit(s);svc+=x.svc;tip+=x.tip;n+=x.n;prodv+=x.prod;if(s.cust)cl.add(s.cust);});
 const m=e.bc.modelo;const days=Math.max(1,Math.round((to-from)/BCD));const alq=m==='alquiler'?Math.round(e.bc.alq*Math.min(1,days/30)/100)*100:0;
 const barb=m==='comision'?Math.round(svc*e.bc.com/100):svc;const bacano=m==='comision'?svc-barb:alq;
 return{ss,n,svc,tip,prodv,alq,barb,pagar:barb+tip-(m==='alquiler'?alq:0),bacano,clients:cl.size,ticket:ss.length?Math.round(svc/ss.length/100)*100:0};}
function bcPeriod(k){const d=new Date(now());d.setHours(0,0,0,0);const t=d.getTime();
 if(k==='hoy')return[t,t+BCD,'Hoy'];if(k==='7')return[t-6*BCD,t+BCD,'Últimos 7 días'];if(k==='30')return[t-29*BCD,t+BCD,'Últimos 30 días'];
 const m0=new Date(d.getFullYear(),d.getMonth(),1).getTime();if(k==='mes')return[m0,t+BCD,'Este mes'];const p0=new Date(d.getFullYear(),d.getMonth()-1,1).getTime();return[p0,m0,'Mes pasado'];}
const BC_PER=[['hoy','Hoy'],['7','7 días'],['mes','Este mes'],['ant','Mes pasado'],['30','30 días']];
const bcPerTabs=(cur,act)=>`<div class="ux-tabs" role="tablist" aria-label="Período">${BC_PER.map(([k,l])=>`<a role="tab" tabindex="0" aria-selected="${cur===k}" class="${cur===k?'on':''}" data-act="${act}" data-v="${k}">${l}</a>`).join('')}</div>`;

/* ---------- disponibilidad de turnos ---------- */
const bcBusy=(barb,day,ex)=>G().turnos.filter(t=>t.barb===barb&&t.day===day&&t.st!=='cancel'&&t.st!=='novino'&&t.id!==ex);
function bcFree(barb,day,t,dur,ex){if(bcDow(day)===0)return false;if(t<BC_OPEN||t+dur>BC_CLOSE)return false;return !bcBusy(barb,day,ex).some(x=>t<x.t+x.dur&&x.t<t+dur);}
function bcSlots(br,barb,day,dur){const out=[];if(bcDow(day)===0)return out;const td=dkey(now());const min=day===td?bcNowMin()+20:0;const bs=barb?[bcEmp(barb)].filter(Boolean):bcBarbs(br);
 for(let t=BC_OPEN;t+dur<=BC_CLOSE;t+=BC_STEP){if(t<min)continue;const free=bs.filter(e=>bcFree(e.id,day,t,dur));if(free.length){const pick=free.sort((a,b)=>bcBusy(a.id,day).length-bcBusy(b.id,day).length)[0];out.push({t:bcHM(t),barb:pick.id});}}
 return out;}

/* ---------- acciones sobre un turno ---------- */
function bcLog(t,s,by){t.st=s;(t.log=t.log||[]).push({s,t:now(),by:by||bcActor()});}
function bcNewTurno(o){const D=G();D.seq.turno++;const t={id:'bt'+D.seq.turno+'-'+uid().slice(-4),n:D.seq.turno,br:o.br,barb:o.barb,day:o.day,t:o.t,dur:o.dur||bcSvcDur(o.svcs),svcs:o.svcs,cust:o.cust||'',name:o.name,tel:o.tel||'',st:o.st||'pend',origin:o.origin||'mostrador',note:o.note||'',created:now(),log:[]};
 bcLog(t,t.st,o.by);D.turnos.push(t);audit('TURNO_NUEVO','#'+t.n+' · '+t.name+' · '+bcBr(t.br).short+' · '+bcBF(t.barb)+' · '+t.day+' '+bcHM(t.t)+' · '+(BC_ORIG[t.origin]||t.origin));return t;}
const bcCustByTel=tel=>{const w=String(tel||'').replace(/\D/g,'').slice(-10);if(w.length<8)return null;return S.customers.find(c=>String(c.wa||'').replace(/\D/g,'').slice(-10)===w)||null;};
function bcWaText(t,k){const b=bcBr(t.br);const nm=bcFirst(t.name);const when=bcDayLbl(t.day).toLowerCase()+' '+t.day.split('-').reverse().slice(0,2).join('/')+' a las '+bcHM(t.t);
 if(k==='rec')return `Hola ${nm}! Te recordamos tu turno en ${b.name} ${when} con ${bcBF(t.barb)} (${bcSvcName(t.svcs)}). Si no podés venir, avisanos por acá así liberamos el lugar. ¡Te esperamos! 💈`;
 return `Hola ${nm}! Tu turno en ${b.name} quedó confirmado para el ${when} con ${bcBF(t.barb)}: ${bcSvcName(t.svcs)} (${money(bcSvcTot(t.svcs))}). Dirección: ${b.dir}. Si necesitás cambiarlo, respondé este mensaje. 💈`;}
function bcGcal(t){const b=bcBr(t.br);const s=new Date(t.day+'T'+bcHM(t.t)+':00'),e=new Date(s.getTime()+t.dur*BCM);const f=d=>d.getFullYear()+bcPad(d.getMonth()+1)+bcPad(d.getDate())+'T'+bcPad(d.getHours())+bcPad(d.getMinutes())+'00';
 return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('Turno en '+b.name+' · '+bcSvcName(t.svcs))+'&dates='+f(s)+'/'+f(e)+'&details='+encodeURIComponent('Con '+bcBN(t.barb)+'. Reservado con el Sistema VB.')+'&location='+encodeURIComponent(b.dir)+'&ctz=America/Argentina/Salta';}

/* ---------- piezas de pantalla ---------- */
const bcStp=s=>`<span class="dp-st" style="--c:${BC_ST[s].c}">${BC_ST[s].l}</span>`;
function bcHead(title,desc,btns){return `<div class="row" style="flex-wrap:wrap;gap:.5rem"><h1 class="sp">${esc(title)}</h1>${btns||''}</div>${desc?`<p class="ux-desc dp-desc">${desc}</p>`:''}`;}
function bcKpi(l,v,d,c,act){return `<div class="card kpi dp-kpi${c?' '+c:''}"${act?` data-act="nav" data-id="${act}" role="button" tabindex="0"`:''}><span>${esc(l)}</span><b>${v}</b>${d?`<small>${d}</small>`:''}</div>`;}
const bcAv=(e,sz)=>`<span class="bc-av" style="--c:${e&&e.bc?e.bc.color:'#888'};${sz?'width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.4)+'px':''}" aria-hidden="true">${esc(initial(e?e.name:'?'))}${esc((String(e?e.name:'').split(' ')[1]||'')[0]||'')}</span>`;
let BCU={agDay:'',agBarb:'',per:'mes',rper:'mes',mk:'rec',stq:''};

/* ===== Pantalla: Hoy en el local ===== */
reg('bchoy','Hoy en el local','silla','bc_agenda',()=>{const D=G();const vb=bcViewBr();const td=dkey(now());const nm=bcNowMin();
 const T=D.turnos.filter(t=>t.day===td&&(!vb||t.br===vb));const Q=D.cola.filter(q=>q.st==='espera'&&(!vb||q.br===vb));
 const sales=bcSalesIn(new Date(td+'T00:00:00').getTime(),new Date(td+'T00:00:00').getTime()+BCD,vb);const fact=sales.reduce((a,s)=>a+s.total,0);
 const eq=bcEquipoBr();const open=bcDow(td)!==0&&nm>=BC_OPEN-30&&nm<BC_CLOSE;let nxd=td;if(!open){nxd=addDays(td,nm>=BC_CLOSE||bcDow(td)===0?1:0);if(bcDow(nxd)===0)nxd=addDays(nxd,1);}
 const NX=D.turnos.filter(t=>t.day===nxd&&BC_LIVE.includes(t.st)&&(!vb||t.br===vb)).sort((a,b)=>a.t-b.t);
 const closedBox=open?'':`<div class="warnbox" style="margin:.8rem 0">El local está <b>cerrado</b> ahora (lunes a sábado de 10 a 21 h). Abre ${esc(bcDayLbl(nxd).toLowerCase())} a las 10 h con <b>${NX.length} turnos</b> reservados: ${NX.slice(0,4).map(t=>bcHM(t.t)+' '+esc(bcFirst(t.name))+' con '+esc(bcBF(t.barb))).join(' · ')}${NX.length>4?'…':''} <button class="btn sm" data-act="bcGoDay" data-v="${nxd}">Ver la agenda</button></div>`;
 const cards=BC_BR.filter(b=>!vb||b.id===vb).map(b=>{const bs=bcBarbs(b.id);
  return `<div class="card bc-suc" style="--c:${b.color}"><div class="row" style="flex-wrap:wrap;gap:.4rem"><h2 class="sp" style="margin:0">${esc(b.name)}</h2><span class="sm mut">${b.sillas} sillas · ${esc(b.hor)}</span>${!bcUserBr()?`<button class="btn sm${eq===b.id?' gold':''}" data-act="bcEquipo" data-v="${b.id}" title="Las ventas de este equipo entran en la caja de esta sucursal">${eq===b.id?'Este equipo cobra acá':'Cobrar en esta sucursal'}</button>`:''}</div>
  <div class="bc-chairs">${bs.map(e=>{const mine=T.filter(t=>t.barb===e.id&&t.br===b.id);const cur=mine.find(t=>t.st==='atend');const nx=mine.filter(t=>['pend','conf','llego'].includes(t.st)).sort((a,c)=>a.t-c.t)[0];const done=mine.filter(t=>t.st==='hecho').length;
   const cl=cur?'busy':nx&&nx.st==='llego'?'wait':'free';
   return `<div class="bc-chair ${cl}"><div class="row" style="gap:.5rem;align-items:center">${bcAv(e,38)}<div class="sp"><b>${esc(bcBN(e.id))}</b><small class="mut" style="display:block">${esc(e.bc.esp)} · ${done} atendido(s) hoy</small></div></div>
    ${cur?`<div class="bc-now"><span class="dp-st" style="--c:${BC_ST.atend.c}">Atendiendo</span> <b>${esc(cur.name)}</b><small>${esc(bcSvcName(cur.svcs))} · termina ${bcHM(cur.t+cur.dur)}</small><div class="row" style="gap:.3rem;margin-top:.35rem"><button class="btn sm gold" data-act="bcCobrar" data-id="${cur.id}">${ico('cash')} Cobrar</button><button class="btn sm" data-act="bcTurno" data-id="${cur.id}">Ver</button></div></div>`
     :`<div class="bc-now"><span class="dp-st" style="--c:#15803d">Silla libre</span>${Q.length&&Q.some(q=>q.br===b.id&&(!q.barb||q.barb===e.id))?` <button class="btn sm gold" data-act="bcColaTomar" data-b="${e.id}">Tomar de la cola</button>`:''}</div>`}
    ${nx?`<div class="bc-next" data-act="bcTurno" data-id="${nx.id}" role="button" tabindex="0"><small class="mut">Próximo</small> <b>${bcHM(nx.t)}</b> ${esc(nx.name)} ${bcStp(nx.st)}${nx.st!=='llego'?` <button class="btn sm" data-act="bcSt" data-id="${nx.id}" data-v="llego">Llegó</button>`:` <button class="btn sm gold" data-act="bcSt" data-id="${nx.id}" data-v="atend">Empezar</button>`}</div>`:'<div class="bc-next"><small class="mut">Sin más turnos hoy</small></div>'}</div>`;}).join('')}</div></div>`;}).join('');
 return bcHead('Hoy en el local','Las sillas en vivo, los próximos turnos y la cola de espera. <b>Llegó → Empezar → Cobrar</b>: el cobro se hace en Vender, entra en la caja de la sucursal, liquida al barbero y suma el sello del Club.',
  `<button class="btn" data-act="bcColaAdd">${ico('users')} Sumar a la cola</button><button class="btn gold" data-act="bcNuevo">${ico('agenda')} Nuevo turno</button>`)
 +bcBrTabs(vb)+closedBox
 +`<div class="grid g4">${bcKpi('Turnos de hoy',T.filter(t=>t.st!=='cancel').length,T.filter(t=>t.st==='hecho').length+' atendidos · '+T.filter(t=>t.st==='novino').length+' no vinieron','','bcagenda')}${bcKpi('En el local ahora',T.filter(t=>t.st==='atend'||t.st==='llego').length+Q.length,Q.length+' en la cola de espera',Q.length>2?'warn':'')}${bcKpi('Facturación de hoy',money(fact),sales.length+' cobros','ok')}${bcKpi('Próxima hora',T.filter(t=>['pend','conf'].includes(t.st)&&t.t>=nm&&t.t<nm+60).length+' turnos',T.filter(t=>t.st==='pend'&&t.t>=nm).length+' sin confirmar',T.filter(t=>t.st==='pend'&&t.t>=nm&&t.t<nm+120).length?'warn':'')}</div>`
 +`<div class="card" style="margin-top:1rem"><div class="row"><h2 class="sp" style="margin:0">Cola de espera</h2><button class="btn sm" data-act="bcColaAdd">+ Sumar</button></div>${Q.length?`<ul class="bc-q">${Q.sort((a,b)=>a.ts-b.ts).map((q,i)=>`<li><b>${i+1}.</b> <span class="sp"><b>${esc(q.name)}</b> <small class="mut">${esc(bcSvcName(q.svcs))} · ${esc(bcBr(q.br).short)}${q.barb?' · espera a '+esc(bcBF(q.barb)):' · cualquier barbero'} · hace ${Math.max(1,Math.round((now()-q.ts)/BCM))} min</small></span><button class="btn sm gold" data-act="bcColaTomar" data-id="${q.id}">Tomar</button><button class="btn sm ghost" data-act="bcColaX" data-id="${q.id}" aria-label="Quitar de la cola">✕</button></li>`).join('')}</ul>`:'<p class="mut sm">No hay nadie esperando. Cuando entra un cliente sin turno, sumalo acá y el primer barbero libre lo toma.</p>'}</div>`
 +cards;},null,'Barbería');

/* ===== Pantalla: Agenda de turnos ===== */
reg('bcagenda','Agenda de turnos','agenda','bc_agenda',()=>{const D=G();const vb=bcViewBr()||'centro';const day=BCU.agDay||dkey(now());const b=bcBr(vb);
 const me=user&&user.role==='barbero'?user.empId:'';const bs=bcBarbs(vb).filter(e=>(!BCU.agBarb||e.id===BCU.agBarb)&&(!me||e.id===me||!BCU.mine));
 const T=D.turnos.filter(t=>t.day===day&&t.br===vb);const closed=bcDow(day)===0;const rows=(BC_CLOSE-BC_OPEN)/5;const td=dkey(now());const nm=bcNowMin();
 const head=`<div class="row" style="flex-wrap:wrap;gap:.4rem;margin:.6rem 0"><button class="btn sm" data-act="bcDay" data-v="-1" aria-label="Día anterior">◀</button><button class="btn sm${day===td?' gold':''}" data-act="bcDay" data-v="0">Hoy</button><button class="btn sm" data-act="bcDay" data-v="1" aria-label="Día siguiente">▶</button><input type="date" id="bc-agd" value="${day}" style="max-width:170px" aria-label="Elegir día"><b class="sp">${esc(bcDayLbl(day))} · ${esc(b.name)}</b>
  <select id="bc-agb" aria-label="Barbero" style="max-width:200px"><option value="">Todos los barberos</option>${bcBarbs(vb).map(e=>`<option value="${e.id}" ${BCU.agBarb===e.id?'selected':''}>${esc(bcBN(e.id))}</option>`).join('')}</select></div>`;
 const cnt=k=>T.filter(t=>t.st===k).length;
 let grid='';if(closed)grid='<div class="card"><p>Domingo: <b>cerrado</b>. Elegí otro día.</p></div>';else{
  grid=`<div class="bc-gridw"><div class="bc-grid" style="grid-template-columns:56px repeat(${bs.length},minmax(150px,1fr));grid-template-rows:auto repeat(${rows},9px)">
   <div class="bc-gh"></div>${bs.map((e,i)=>`<div class="bc-gh" style="grid-column:${i+2}">${bcAv(e,28)} <b>${esc(bcBF(e.id))}</b><small>${esc(e.bc.apodo)}</small></div>`).join('')}
   ${Array.from({length:(BC_CLOSE-BC_OPEN)/BC_STEP},(_,r)=>{const t=BC_OPEN+r*BC_STEP;const gr=r*3+2;return (t%30===0?`<div class="bc-gt${t%60===0?' hr':''}" style="grid-row:${gr}/span 6">${bcHM(t)}</div>`:'')+bs.map((e,i)=>{const past=day<td||(day===td&&t+BC_STEP<=nm);return `<div class="bc-gc${t%60===0?' hr':''}${past?' past':''}" style="grid-row:${gr}/span 3;grid-column:${i+2}" ${past?'':`data-act="bcSlot" data-b="${e.id}" data-t="${t}" role="button" tabindex="-1" aria-label="Nuevo turno ${bcHM(t)} con ${esc(bcBF(e.id))}"`}></div>`;}).join('');}).join('')}
   ${T.filter(t=>bs.some(e=>e.id===t.barb)).map(t=>{const col=bs.findIndex(e=>e.id===t.barb)+2;const r0=Math.round((t.t-BC_OPEN)/5)+2;const sp=Math.max(3,Math.round(t.dur/5));
    return `<button class="bc-tb st-${t.st}${sp<5?' xs':''}" style="grid-column:${col};grid-row:${r0}/span ${sp};--c:${BC_ST[t.st].c}" data-act="bcTurno" data-id="${t.id}" aria-label="${bcHM(t.t)} ${esc(t.name)}: ${BC_ST[t.st].l}"><b>${bcHM(t.t)} ${esc(t.name)}</b>${sp>=4?`<small>${esc(bcSvcName(t.svcs))}</small>`:''}${sp>=6?`<small>${BC_ST[t.st].l}${t.origin==='web'?' · web':''}</small>`:''}</button>`;}).join('')}
   ${day===td&&nm>=BC_OPEN&&nm<BC_CLOSE?`<div class="bc-nowline" style="grid-column:1/-1;grid-row:${Math.floor((nm-BC_OPEN)/5)+2}"></div>`:''}</div></div>`;}
 return bcHead('Agenda de turnos','Por día, sucursal y barbero. Tocá un hueco para dar un turno o un turno para confirmarlo por WhatsApp, marcar que llegó, cobrarlo en Vender o reprogramarlo. Los turnos de la web entran solos como <b>a confirmar</b>.',
  `<button class="btn" data-act="bcPub">${ico('globe')} Ver el turnero web</button><button class="btn gold" data-act="bcNuevo">${ico('agenda')} Nuevo turno</button>`)
 +(bcUserBr()?bcBrTabs(vb):`<div class="ux-tabs" role="tablist" aria-label="Sucursal">${BC_BR.map(x=>`<a role="tab" tabindex="0" aria-selected="${vb===x.id}" class="${vb===x.id?'on':''}" data-act="bcBrView" data-v="${x.id}">${esc(x.name)}</a>`).join('')}</div>`)
 +`<div class="grid g4">${bcKpi('Turnos del día',T.filter(t=>t.st!=='cancel').length,cnt('hecho')+' atendidos')}${bcKpi('A confirmar',cnt('pend'),'mandá el WhatsApp de confirmación',cnt('pend')?'warn':'')}${bcKpi('Ocupación',closed?'—':Math.round(T.filter(t=>t.st!=='cancel'&&t.st!=='novino').reduce((a,t)=>a+t.dur,0)/(bcBarbs(vb).length*(BC_CLOSE-BC_OPEN))*100)+' %','de las horas de silla')}${bcKpi('Facturación prevista',money(T.filter(t=>t.st!=='cancel'&&t.st!=='novino').reduce((a,t)=>a+bcSvcTot(t.svcs),0)),'según los servicios reservados')}</div>`
 +head+grid
 +`<p class="sm mut" style="margin-top:.5rem">${Object.entries(BC_ST).map(([k,s])=>`<span class="dp-st" style="--c:${s.c}">${s.l}</span>`).join(' ')}</p>`;},
 ()=>{const d=$('#bc-agd');if(d)d.addEventListener('change',()=>{if(d.value){BCU.agDay=d.value;rerender();}});const s=$('#bc-agb');if(s)s.addEventListener('change',()=>{BCU.agBarb=s.value;rerender();});},'Barbería');

/* ===== Pantalla: Barberos y liquidación ===== */
reg('bcbarb','Barberos y liquidación','tijera','bc_barb',()=>{const vb=bcViewBr();const [f,t,lbl]=bcPeriod(BCU.per);const E=bcBarbs(vb);const adm=isAdm();
 const L=E.map(e=>({e,l:bcLiq(e,f,t)}));const tot=L.reduce((a,x)=>({svc:a.svc+x.l.svc,tip:a.tip+x.l.tip,barb:a.barb+x.l.barb,bac:a.bac+x.l.bacano,alq:a.alq+x.l.alq,n:a.n+x.l.n}),{svc:0,tip:0,barb:0,bac:0,alq:0,n:0});
 return bcHead('Barberos y liquidación','Dos modelos de trabajo: <b>alquiler de silla</b> (el barbero se queda con sus servicios y paga un monto fijo por mes) o <b>comisión por corte</b> (un % de cada servicio). Las propinas van 100 % al barbero y los productos 100 % a Bacano. Cada cobro guarda quién atendió.',
  `${expBarBC()}`)
 +bcBrTabs(vb)+bcPerTabs(BCU.per,'bcPer')
 +`<div class="grid g4">${bcKpi('Servicios · '+lbl,tot.n,money(tot.svc)+' facturados')}${bcKpi('A pagar a barberos',money(L.filter(x=>x.e.bc.modelo==='comision').reduce((a,x)=>a+x.l.barb,0)+tot.tip),'comisiones + propinas')}${bcKpi('Alquiler de sillas',money(tot.alq),'proporcional al período')}${bcKpi('Aporte a Bacano',money(tot.bac),'comisiones retenidas + alquileres','ok')}</div>
 <div class="tw" style="margin-top:1rem"><table><thead><tr><th>Barbero</th><th>Modelo</th><th class="r">Servicios</th><th class="r">Facturado</th><th class="r">Propinas</th><th class="r">Para el barbero</th><th class="r">Alquiler</th><th class="r">Neto a pagar</th><th class="r">Aporte a Bacano</th><th></th></tr></thead><tbody>
 ${L.map(({e,l})=>`<tr><td style="white-space:nowrap"><div class="row" style="gap:.4rem;align-items:center;flex-wrap:nowrap">${bcAv(e,28)}<span><b>${esc(bcBN(e.id))}</b><small class="mut" style="display:block">${esc(bcBr(e.bc.br).short)}</small></span></div></td><td style="white-space:nowrap">${e.bc.modelo==='comision'?'Comisión '+e.bc.com+' %':'Silla · '+money(e.bc.alq)+'/mes'}</td><td class="r">${l.n}</td><td class="r">${money(l.svc)}</td><td class="r">${money(l.tip)}</td><td class="r">${money(l.barb)}</td><td class="r">${l.alq?'− '+money(l.alq):'—'}</td><td class="r"><b>${money(l.pagar)}</b></td><td class="r">${money(l.bacano)}</td>
  <td class="r" style="white-space:nowrap"><button class="btn sm" data-act="bcBDet" data-id="${e.id}">Ver</button>${bcCan('bc_barb')?`<button class="btn sm gold" data-act="bcLiqOk" data-id="${e.id}">Liquidar</button>`:''}</td></tr>`).join('')}</tbody></table></div>
 <p class="sm mut">Neto a pagar = lo que le corresponde por sus servicios + propinas − alquiler de la silla. Si da negativo, el barbero le debe ese monto a Bacano. Sólo el administrador cambia el modelo y los porcentajes.</p>
 ${G().liqs.length?`<div class="card" style="margin-top:1rem"><h3>Liquidaciones registradas</h3><ul class="sm" style="padding-left:1.1rem;margin:0">${G().liqs.slice(-8).reverse().map(q=>`<li>${fmtDT(q.ts)} · <b>${esc(bcBN(q.barb))}</b> · ${esc(q.per)} · neto ${money(q.neto)} · ${esc(q.by)}${q.mov?' · salió de caja':''}</li>`).join('')}</ul></div>`:''}`;},null,'Barbería');
function expBarBC(){return bcCan('impex')?`<button class="btn sm" data-act="bcExp">Exportar liquidación (Excel)</button>`:'';}

/* ===== Pantalla: Ranking ===== */
reg('bcrank','Ranking y trazabilidad','trofeo','bc_rank',()=>{const vb=bcViewBr();const [f,t,lbl]=bcPeriod(BCU.rper);const E=bcBarbs(vb);
 const rows=E.map(e=>{const l=bcLiq(e,f,t);const back=l.ss.filter(s=>s.cust&&S.sales.some(x=>x.cust===s.cust&&x.ts<s.ts&&x.bc&&x.bc.barb===e.id)).length;return{e,l,ret:l.ss.length?Math.round(back/l.ss.length*100):0};}).sort((a,b)=>b.l.svc-a.l.svc);
 const ss=bcSalesIn(f,t,vb);const sv={};ss.forEach(s=>s.items.forEach(it=>{if(String(it.pid).startsWith('sv-')&&it.pid!==BC_TIP){sv[it.pid]=sv[it.pid]||{n:0,v:0};sv[it.pid].n+=it.qty;sv[it.pid].v+=bcLineNet(it);}}));
 const svL=Object.entries(sv).sort((a,b)=>b[1].n-a[1].n);const mx=Math.max(1,...svL.map(x=>x[1].n));
 const cmp=BC_BR.map(b=>{const s=bcSalesIn(f,t,b.id);const x=s.reduce((a,y)=>{const q=bcSplit(y);a.svc+=q.svc;a.prod+=q.prod;a.n+=q.n;return a;},{svc:0,prod:0,n:0});const ns=G().turnos.filter(q=>q.br===b.id&&new Date(q.day+'T12:00:00').getTime()>=f&&new Date(q.day+'T12:00:00').getTime()<t);
  return{b,fact:s.reduce((a,y)=>a+y.total,0),svc:x.svc,prod:x.prod,n:x.n,tk:s.length?Math.round(s.reduce((a,y)=>a+y.total,0)/s.length/100)*100:0,nov:ns.length?Math.round(ns.filter(q=>q.st==='novino').length/ns.length*100):0};});
 const medal=i=>['🥇','🥈','🥉'][i]||(i+1)+'.';
 return bcHead('Ranking y trazabilidad','Quién hizo cada servicio, cuánto facturó, cuánto le dejó a Bacano y cuántos de sus clientes vuelven. Se arma solo con cada cobro.','')
 +bcBrTabs(vb)+bcPerTabs(BCU.rper,'bcRPer')
 +`<div class="bc-podium">${rows.slice(0,3).map((r,i)=>`<div class="card bc-pod p${i}">${bcAv(r.e,54)}<span class="bc-medal">${medal(i)}</span><b>${esc(bcBN(r.e.id))}</b><small class="mut">${esc(bcBr(r.e.bc.br).short)} · ${esc(r.e.bc.apodo)}</small><span class="bc-big">${money(r.l.svc)}</span><small>${r.l.n} servicios · ${r.ret} % vuelven</small></div>`).join('')}</div>
 <div class="tw" style="margin-top:1rem"><table><thead><tr><th>#</th><th>Barbero</th><th class="r">Servicios</th><th class="r">Facturación</th><th class="r">Aporte a Bacano</th><th class="r">Ticket promedio</th><th class="r">Clientes</th><th class="r">Vuelven</th></tr></thead><tbody>
 ${rows.map((r,i)=>`<tr><td>${medal(i)}</td><td><b>${esc(bcBN(r.e.id))}</b> <small class="mut">${esc(bcBr(r.e.bc.br).short)}</small></td><td class="r">${r.l.n}</td><td class="r">${money(r.l.svc)}</td><td class="r">${money(r.l.bacano)}</td><td class="r">${money(r.l.ticket)}</td><td class="r">${r.l.clients}</td><td class="r">${r.ret} %</td></tr>`).join('')}</tbody></table></div>
 <div class="grid g2" style="margin-top:1rem"><div class="card"><h3>Servicios más pedidos · ${esc(lbl)}</h3>${svL.length?svL.map(([id,x])=>`<div class="bc-bar"><span>${esc((prod(id)||{name:id}).name)}</span><i style="width:${Math.round(x.n/mx*100)}%"></i><b>${x.n}</b></div>`).join(''):'<p class="mut">Sin servicios en el período.</p>'}</div>
 <div class="card"><h3>Centro vs. Norte</h3><div class="tw"><table><thead><tr><th></th>${cmp.map(c=>`<th class="r" style="color:${c.b.color}">${esc(c.b.short)}</th>`).join('')}</tr></thead><tbody>
  ${[['Facturación','fact',money],['Servicios','n',v=>v],['Ventas de productos','prod',money],['Ticket promedio','tk',money],['Turnos que no vinieron','nov',v=>v+' %']].map(([l,k,fm])=>`<tr><td>${l}</td>${cmp.map(c=>`<td class="r">${fm(c[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>`;},null,'Barbería');

/* ===== Pantalla: Mis números (barbero) ===== */
reg('bcmis','Mis números','money2','bc_mis',()=>{const id=user&&user.empId;const e=bcEmp(id);if(!e||!e.bc)return bcHead('Mis números','Esta pantalla es para los barberos: tu usuario no está vinculado a un barbero. Mirá «Barberos y liquidación».','');
 const [f,t]=bcPeriod('mes');const l=bcLiq(e,f,t);const [h0,h1]=bcPeriod('hoy');const lh=bcLiq(e,h0,h1);const td=dkey(now());const nx=G().turnos.filter(x=>x.barb===id&&x.day>=td&&BC_LIVE.includes(x.st)).sort((a,b)=>(a.day+bcHM(a.t)).localeCompare(b.day+bcHM(b.t))).slice(0,8);
 return bcHead('Mis números · '+bcBF(id),'Lo tuyo, en claro: servicios, propinas y lo que te corresponde este mes según tu modelo ('+(e.bc.modelo==='comision'?'comisión '+e.bc.com+' %':'alquiler de silla '+money(e.bc.alq)+' por mes')+').','')
 +`<div class="grid g4">${bcKpi('Hoy',lh.n+' servicios',money(lh.svc)+' · propinas '+money(lh.tip))}${bcKpi('Este mes',l.n+' servicios',money(l.svc)+' facturados')}${bcKpi('Propinas del mes',money(l.tip),'100 % tuyas','ok')}${bcKpi('Te corresponde',money(l.pagar),e.bc.modelo==='alquiler'?'ya descontado el alquiler':'comisión + propinas','ok')}</div>
 <div class="card" style="margin-top:1rem"><h3>Tus próximos turnos</h3>${nx.length?`<ul class="bc-q">${nx.map(x=>`<li><b>${esc(bcDayLbl(x.day))} ${bcHM(x.t)}</b><span class="sp">${esc(x.name)} <small class="mut">${esc(bcSvcName(x.svcs))}</small></span>${bcStp(x.st)}<button class="btn sm" data-act="bcTurno" data-id="${x.id}">Ver</button></li>`).join('')}</ul>`:'<p class="mut">No tenés turnos por delante.</p>'}</div>`;},null,'Barbería');

/* ===== Pantalla: Stock por sucursal ===== */
reg('bcstock','Stock por sucursal','sucur','bc_stock',()=>{const vb=bcViewBr();const P=S.products.filter(p=>p.active&&!p.archived&&!bcIsSvc(p)&&p.bcs);bcSyncAll();const q=bcNorm(BCU.stq);
 const L=P.filter(p=>!q||bcNorm(p.name).includes(q));const low=br=>P.filter(p=>(p.bcs[br]||0)<=(p.min||0));const val=P.reduce((a,p)=>a+p.stock*p.cost,0);
 const prov={};BC_BR.filter(b=>!vb||b.id===vb).forEach(b=>low(b.id).forEach(p=>{const k=p.prov||'';(prov[k]=prov[k]||[]).push({p,b,q:Math.max(1,(p.min||0)*2-(p.bcs[b.id]||0))});}));
 return bcHead('Stock por sucursal','Cada sucursal ve y mueve su stock; las ventas de Vender descuentan de la sucursal de la caja que cobró. Transferí entre Centro y Norte en dos toques. El alta de productos y precios es del administrador (en Stock e inventario).',
  `<button class="btn" data-act="bcXfer">${ico('sucur')} Transferir entre sucursales</button><button class="btn gold" data-act="bcIngreso">+ Ingreso de mercadería</button>`)
 +bcBrTabs(vb)
 +`<div class="grid g4">${BC_BR.map(b=>bcKpi('Bajo el mínimo · '+b.short,low(b.id).length,low(b.id).filter(p=>(p.bcs[b.id]||0)<=0).length+' agotados',low(b.id).length?'red':'ok')).join('')}${bcKpi('Unidades en stock',P.reduce((a,p)=>a+p.stock,0),P.length+' productos')}${can('view_cost')?bcKpi('Valor del stock (costo)',money(val),'las dos sucursales'):''}</div>
 <div class="row" style="margin:.8rem 0"><input id="bc-stq" placeholder="Buscar producto…" value="${esc(BCU.stq)}" style="max-width:320px" aria-label="Buscar producto"></div>
 <div class="tw"><table><thead><tr><th>Producto</th><th>Categoría</th><th class="r">Precio</th>${BC_BR.filter(b=>!vb||b.id===vb).map(b=>`<th class="r">${esc(b.short)}</th>`).join('')}<th class="r">Mínimo</th><th class="r">Vendidos 30 días</th><th></th></tr></thead><tbody>
 ${L.map(p=>{const [f]=bcPeriod('30');const sold=bcSalesIn(f,now()+1,vb).reduce((a,s)=>a+s.items.filter(i=>i.pid===p.id).reduce((x,i)=>x+i.qty,0),0);
  return `<tr><td><b>${esc(p.name)}</b></td><td>${esc(rubName(p.rubro))}</td><td class="r">${money(p.price)}</td>${BC_BR.filter(b=>!vb||b.id===vb).map(b=>{const v=p.bcs[b.id]||0;return `<td class="r ${v<=0?'dp-low':v<=(p.min||0)?'bc-warn':''}">${v}${v<=0?' · agotado':v<=(p.min||0)?' · bajo':''}</td>`;}).join('')}<td class="r">${p.min||0}</td><td class="r">${sold}</td><td class="r" style="white-space:nowrap"><button class="btn sm" data-act="bcXfer" data-id="${p.id}">Transferir</button><button class="btn sm" data-act="bcAdj" data-id="${p.id}">Conteo</button><button class="btn sm" data-act="bcMovs" data-id="${p.id}">Historial</button></td></tr>`;}).join('')}</tbody></table></div>
 <div class="card" style="margin-top:1rem"><h3>Pedido de reposición sugerido (por proveedor)</h3>${Object.keys(prov).length?Object.entries(prov).map(([k,it])=>{const s=(S.suppliers||[]).find(x=>x.id===k);const txt='Hola '+(s?s.razon:'')+'! Pedido de Bacano: '+it.map(x=>x.q+' × '+x.p.name+' ('+x.b.short+')').join(', ')+'. Gracias.';
  return `<div class="dp-mo"><div class="row"><b class="sp">${esc(s?s.razon:'Sin proveedor')}</b>${s&&s.tel?`<a class="btn sm" href="${waLink(txt,'549'+String(s.tel).replace(/\D/g,''))}" target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>`:''}</div><ul class="sm" style="margin:.3rem 0 0;padding-left:1.1rem">${it.map(x=>`<li>${x.q} × ${esc(x.p.name)} · para ${esc(x.b.short)} (hay ${x.p.bcs[x.b.id]||0}, mínimo ${x.p.min})</li>`).join('')}</ul></div>`;}).join(''):'<p class="mut">Todo el stock está sobre el mínimo.</p>'}</div>`;},
 ()=>{const i=$('#bc-stq');if(i)i.addEventListener('input',()=>{BCU.stq=i.value;clearTimeout(i._t);i._t=setTimeout(()=>{rerender();const j=$('#bc-stq');if(j){j.focus();j.setSelectionRange(j.value.length,j.value.length);}},250);});},'Barbería');
/* el stock total del núcleo es la suma de las sucursales: si cambió por fuera (compras, mermas), la diferencia va a la sucursal de este equipo */
function bcSync(p){if(!p||!p.bcs)return;const s=BC_BR.reduce((a,b)=>a+(p.bcs[b.id]||0),0);const d=Math.round((p.stock-s)*1000)/1000;if(d){const br=bcEquipoBr();p.bcs[br]=Math.round(((p.bcs[br]||0)+d)*1000)/1000;}}
function bcSyncAll(){S.products.forEach(p=>{if(p.bcs)bcSync(p);});}
function bcMove(p,br,q,kind,note){p.bcs[br]=Math.round(((p.bcs[br]||0)+q)*1000)/1000;G().moves.push({id:uid(),ts:now(),pid:p.id,br,q,kind,note:note||'',by:bcActor()});if(G().moves.length>600)G().moves.shift();}

/* ===== Pantalla: Campañas por WhatsApp ===== */
const BC_MK=[['rec','Recordatorio de mañana'],['ina','Recuperar inactivos'],['cum','Cumpleaños'],['sel','A un sello del premio'],['seg','Segunda visita'],['res','Pedir reseña']];
function bcLastVisit(cid){let m=0;S.sales.forEach(s=>{if(s.cust===cid&&s.status==='ok'&&s.ts>m)m=s.ts;});return m;}
function bcVisits(cid){return S.sales.filter(s=>s.cust===cid&&s.status==='ok'&&s.items.some(i=>String(i.pid).startsWith('sv-')&&i.pid!==BC_TIP)).length;}
function bcMkList(k){const vb=bcViewBr();const td=dkey(now());const goal=+S.loyalty.goal||10;const okC=c=>c.status!=='baja'&&c.consent&&c.consent.comm&&(!vb||!c.bc||c.bc.br===vb);
 if(k==='rec')return G().turnos.filter(t=>t.day===addDays(td,1)&&BC_LIVE.includes(t.st)&&(!vb||t.br===vb)).map(t=>({id:t.id,name:t.name,tel:t.tel,info:bcHM(t.t)+' · '+bcSvcName(t.svcs)+' · '+bcBF(t.barb),txt:bcWaText(t,'rec')}));
 const C=S.customers.filter(okC);
 if(k==='ina')return C.map(c=>({c,l:bcLastVisit(c.id)})).filter(x=>x.l&&now()-x.l>28*BCD).sort((a,b)=>a.l-b.l).map(({c,l})=>({id:c.id,name:custFull(c),tel:c.wa,info:'Última visita hace '+Math.round((now()-l)/BCD)+' días',txt:`Hola ${c.name}! Hace un tiempo que no te vemos por Bacano 💈 Te guardamos un 15 % de descuento en tu próximo corte con el código VUELVE15. Reservá en la web o respondé este mensaje.`}));
 if(k==='cum')return C.filter(c=>c.birth&&c.birth.slice(5,7)===td.slice(5,7)).sort((a,b)=>a.birth.slice(8).localeCompare(b.birth.slice(8))).map(c=>({id:c.id,name:custFull(c),tel:c.wa,info:'Cumple el '+c.birth.slice(8)+'/'+c.birth.slice(5,7)+(c.birth.slice(5)===td.slice(5)?' · ¡hoy!':''),txt:`¡Feliz cumple, ${c.name}! 🎉 De regalo, un 20 % en tu corte durante tu semana de cumpleaños con el código CUMPLE20. Te esperamos en Bacano.`}));
 if(k==='sel')return C.map(c=>({c,s:stampsOf(c.id)%goal})).filter(x=>x.s===goal-1).map(({c})=>({id:c.id,name:custFull(c),tel:c.wa,info:(goal-1)+' de '+goal+' sellos',txt:`Hola ${c.name}! Te falta UN sello para tu corte gratis en Bacano ✂️ Reservá tu próximo turno y la siguiente visita va por nuestra cuenta.`}));
 if(k==='seg')return C.filter(c=>bcVisits(c.id)===1&&now()-bcLastVisit(c.id)>7*BCD).map(c=>({id:c.id,name:custFull(c),tel:c.wa,info:'Vino una vez · hace '+Math.round((now()-bcLastVisit(c.id))/BCD)+' días',txt:`Hola ${c.name}! Gracias por elegir Bacano. Para tu segunda visita tenés 10 % de descuento con el código BACANO10. ¡Reservá cuando quieras!`}));
 if(k==='res')return G().turnos.filter(t=>t.day===td&&t.st==='hecho'&&t.tel&&(!vb||t.br===vb)).map(t=>({id:t.id,name:t.name,tel:t.tel,info:'Atendido hoy a las '+bcHM(t.t)+' por '+bcBF(t.barb),txt:`Hola ${bcFirst(t.name)}! ¿Cómo quedó el corte con ${bcBF(t.barb)}? Si te gustó, nos ayudás mucho con una reseña en Google ⭐ ¡Gracias!`}));
 return[];}
reg('bcmkt','Campañas por WhatsApp','mega','bc_mkt',()=>{const k=BCU.mk;const L=bcMkList(k);const sent=new Set(G().sent.filter(x=>x.k===k&&now()-x.ts<20*BCH).map(x=>x.id));
 return bcHead('Campañas por WhatsApp','Las listas se arman solas con los datos del sistema y sólo incluyen a quienes aceptaron recibir mensajes. Tocá <b>Enviar</b>: se abre WhatsApp con el mensaje listo y queda registrado.','')
 +bcBrTabs(bcViewBr())
 +`<div class="ux-tabs" role="tablist" aria-label="Campaña">${BC_MK.map(([x,l])=>`<a role="tab" tabindex="0" aria-selected="${k===x}" class="${k===x?'on':''}" data-act="bcMk" data-v="${x}">${l} <span class="ux-bd ${bcMkList(x).length?'amber':''}">${bcMkList(x).length}</span></a>`).join('')}</div>
 <div class="card">${L.length?`<ul class="bc-q">${L.map(x=>`<li><span class="sp"><b>${esc(String(x.name).replace(' (ejemplo)',''))}</b> <small class="mut">${esc(x.info)}</small></span>${sent.has(x.id)?'<span class="tag ok">Enviado</span>':''}<a class="btn sm ${sent.has(x.id)?'':'gold'}" href="${waLink(x.txt,x.tel)}" target="_blank" rel="noopener noreferrer" data-act="bcSent" data-k="${k}" data-id="${x.id}">Enviar</a></li>`).join('')}</ul>
  <details style="margin-top:.6rem"><summary class="sm">Ver el mensaje</summary><p class="sm" style="white-space:pre-wrap">${esc(L[0].txt)}</p></details>`:'<p class="mut">No hay nadie en esta lista hoy.</p>'}</div>
 <p class="sm mut">Los cupones de las campañas (BACANO10, VUELVE15, CUMPLE20) se administran en Clientes → Cupones y se aplican solos en Vender.</p>`;},null,'Barbería');

/* ---------- acciones ---------- */
A.bcBrView=el=>{G().br.view=el.dataset.v;rerender();};
A.bcEquipo=el=>{const b=bcBr(el.dataset.v);if(!b)return;bcSetEquipo(b.id);audit('CAJA_EQUIPO','Este equipo cobra en '+b.name);save();toast('Las ventas de este equipo entran en la caja de '+b.name+'.');rerender();};
A.bcGoDay=el=>{BCU.agDay=el.dataset.v;go('bcagenda');};
A.bcDay=el=>{const v=+el.dataset.v;const td=dkey(now());BCU.agDay=v===0?td:addDays(BCU.agDay||td,v);rerender();};
A.bcPer=el=>{BCU.per=el.dataset.v;rerender();};A.bcRPer=el=>{BCU.rper=el.dataset.v;rerender();};A.bcMk=el=>{BCU.mk=el.dataset.v;rerender();};
A.bcSent=el=>{G().sent.push({k:el.dataset.k,id:el.dataset.id,ts:now(),by:bcActor()});audit('CAMPANA_WA',el.dataset.k+' · '+el.dataset.id);save();setTimeout(rerender,300);};
A.bcSlot=el=>bcTurnoForm({barb:el.dataset.b,t:+el.dataset.t,day:BCU.agDay||dkey(now()),br:bcViewBr()||'centro'});
A.bcNuevo=()=>bcTurnoForm({br:bcViewBr()||bcEquipoBr(),day:BCU.agDay||dkey(now())});
A.bcPub=()=>{const w=modal('Turnero web (como lo ve el cliente)',`<div class="dp-phone"><iframe title="Página pública de Bacano" id="bc-pubf"></iframe></div><p class="sm mut" style="text-align:center">Es la misma página pública: reservá un turno y aparece en la agenda como <b>a confirmar</b>.</p>`,{ok:false,cancelText:'Cerrar',wide:true});
 const f=w.querySelector('#bc-pubf');f.srcdoc=PUB_DOC.replace('<body>','<body><script>window.__BCEMBED=1;<\/script>');};
function bcSvcPick(sel){return `<div class="bc-svp">${BC_SVC.map(([id])=>{const p=prod(id);if(!p||!p.active)return '';return `<label class="chk"><input type="checkbox" class="bc-sv" value="${id}" ${sel.includes(id)?'checked':''}> ${esc(p.name)} <small class="mut">${money(p.price)} · ${p.svc.dur} min</small></label>`;}).join('')}</div>`;}
function bcTurnoForm(o,t){const ed=!!t;o=Object.assign({br:'centro',day:dkey(now()),t:BC_OPEN,barb:'',svcs:['sv-corte']},o||{},t||{});if(!bcBrOk(o.br))o.br=bcUserBr();
 const barbOpts=br=>bcBarbs(br).map(e=>`<option value="${e.id}" ${o.barb===e.id?'selected':''}>${esc(bcBN(e.id))} · ${esc(e.bc.esp)}</option>`).join('');
 const times=Array.from({length:(BC_CLOSE-BC_OPEN)/BC_STEP},(_,i)=>BC_OPEN+i*BC_STEP);
 const w=modal(ed?'Reprogramar turno #'+t.n:'Nuevo turno',`<div class="grid g2"><div><label for="bt-n">Cliente</label><input id="bt-n" list="bt-cl" maxlength="50" value="${esc(o.name||'')}" placeholder="Nombre o buscar socio" autocomplete="off"><datalist id="bt-cl">${S.customers.slice(0,400).map(c=>`<option value="${esc(custFull(c).replace(' (ejemplo)',''))}">`).join('')}</datalist></div>
  <div><label for="bt-w">WhatsApp</label><input id="bt-w" inputmode="tel" maxlength="20" value="${esc(o.tel||'')}" placeholder="387 …"></div></div>
  <div class="grid g2"><div><label for="bt-b">Sucursal</label><select id="bt-b" ${bcUserBr()?'disabled':''}>${BC_BR.map(b=>`<option value="${b.id}" ${o.br===b.id?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div><div><label for="bt-e">Barbero</label><select id="bt-e">${barbOpts(o.br)}</select></div></div>
  <div class="grid g2"><div><label for="bt-d">Día</label><input type="date" id="bt-d" value="${o.day}"></div><div><label for="bt-t">Hora</label><select id="bt-t">${times.map(x=>`<option value="${x}" ${x===o.t?'selected':''}>${bcHM(x)}</option>`).join('')}</select></div></div>
  <label>Servicios</label>${bcSvcPick(o.svcs)}
  <div class="grid g2"><div><label for="bt-o">Cómo llegó</label><select id="bt-o">${Object.entries(BC_ORIG).filter(([k])=>k!=='cola').map(([k,l])=>`<option value="${k}" ${(o.origin||'mostrador')===k?'selected':''}>${l}</option>`).join('')}</select></div><div><label for="bt-x">Nota</label><input id="bt-x" maxlength="80" value="${esc(o.note||'')}"></div></div>
  <p class="sm mut" id="bt-av"></p>`,{okText:ed?'Guardar cambios':'Dar el turno',onOk:w=>{const name=val('bt-n').trim(),tel=val('bt-w').trim(),br=$('#bt-b',w).value,barb=val('bt-e'),day=val('bt-d'),tm=+val('bt-t');const svcs=$$('.bc-sv',w).filter(x=>x.checked).map(x=>x.value);
   if(name.length<2)return w._err('Falta el nombre del cliente.'),false;if(!svcs.length)return w._err('Elegí al menos un servicio.'),false;if(!day)return w._err('Elegí el día.'),false;if(bcDow(day)===0)return w._err('Los domingos Bacano está cerrado.'),false;
   const dur=bcSvcDur(svcs);if(!bcFree(barb,day,tm,dur,ed?t.id:''))return w._err(bcBF(barb)+' no está libre de '+bcHM(tm)+' a '+bcHM(tm+dur)+'. Elegí otro horario o barbero.'),false;
   const c=S.customers.find(x=>bcNorm(custFull(x).replace(' (ejemplo)',''))===bcNorm(name))||bcCustByTel(tel);
   if(ed){const old=t.day+' '+bcHM(t.t)+' '+bcBF(t.barb);Object.assign(t,{name,tel:tel||(c?c.wa:''),br,barb,day,t:tm,dur,svcs,cust:c?c.id:t.cust,origin:val('bt-o'),note:val('bt-x')});(t.log=t.log||[]).push({s:t.st,t:now(),by:bcActor(),note:'reprogramado'});audit('TURNO_REPROGRAMADO','#'+t.n+' · de '+old+' a '+day+' '+bcHM(tm)+' '+bcBF(barb));}
   else{const nt=bcNewTurno({br,barb,day,t:tm,svcs,dur,name,tel:tel||(c?c.wa:''),cust:c?c.id:'',origin:val('bt-o'),note:val('bt-x'),st:'conf'});BCU.agDay=day;G().br.view=bcUserBr()?G().br.view:br;toast('Turno #'+nt.n+' para '+name+' · '+bcDayLbl(day)+' '+bcHM(tm));}
   save();rerender();}});
 const upd=()=>{const br=$('#bt-b',w).value;const day=val('bt-d');const svcs=$$('.bc-sv',w).filter(x=>x.checked).map(x=>x.value);const dur=bcSvcDur(svcs);const sl=bcSlots(br,val('bt-e'),day,dur).slice(0,10);
  const av=$('#bt-av',w);if(av)av.innerHTML=bcDow(day)===0?'Domingo: cerrado.':'Duración: <b>'+dur+' min</b> · '+money(bcSvcTot(svcs))+'. Libres con '+esc(bcBF(val('bt-e')))+': '+(sl.length?sl.map(s=>`<button type="button" class="btn sm" data-bt="${bcMin(s.t)}">${s.t}</button>`).join(' '):'sin horarios ese día');};
 $('#bt-b',w).addEventListener('change',()=>{$('#bt-e',w).innerHTML=barbOpts($('#bt-b',w).value);upd();});['bt-e','bt-d'].forEach(i=>$('#'+i,w).addEventListener('change',upd));w.addEventListener('change',e=>{if(e.target.classList.contains('bc-sv'))upd();});
 w.addEventListener('click',e=>{const b=e.target.closest('[data-bt]');if(b){$('#bt-t',w).value=b.dataset.bt;}});
 $('#bt-n',w).addEventListener('change',()=>{const c=S.customers.find(x=>bcNorm(custFull(x).replace(' (ejemplo)',''))===bcNorm(val('bt-n')));if(c){if(!val('bt-w'))$('#bt-w',w).value=c.wa;if(c.bc&&!ed){const ch=$$('.bc-sv',w);ch.forEach(x=>x.checked=x.value===c.bc.svc);upd();}}});
 upd();}
A.bcTurno=el=>{const t=bcTur(el.dataset.id);if(!t)return;const c=t.cust?custById(t.cust):null;const b=bcBr(t.br);const st=t.st;const live=BC_LIVE.includes(st);
 const btn=(v,l,cl)=>`<button class="btn ${cl||''}" data-bts="${v}">${l}</button>`;
 const w=modal('Turno #'+t.n+' · '+t.name,`<div class="row" style="gap:.5rem;flex-wrap:wrap">${bcStp(st)}<span class="dp-chip">${esc(BC_ORIG[t.origin]||t.origin)}</span>${c?`<span class="dp-chip">Socio ${pad4(c.num)} · ${stampsOf(c.id)%(+S.loyalty.goal||10)}/${S.loyalty.goal} sellos</span>`:''}</div>
  <p style="margin:.6rem 0"><b>${esc(bcDayLbl(t.day))} ${t.day.split('-').reverse().join('/')} · ${bcHM(t.t)} a ${bcHM(t.t+t.dur)}</b><br>${esc(b.name)} · con <b>${esc(bcBN(t.barb))}</b><br>${esc(bcSvcName(t.svcs))} · ${money(bcSvcTot(t.svcs))}${t.note?`<br><i>“${esc(t.note)}”</i>`:''}${c&&c.notes?`<br><small class="mut">Ficha: ${esc(c.notes)}</small>`:''}</p>
  ${t.tel?`<div class="row" style="gap:.4rem;flex-wrap:wrap"><a class="btn sm" href="${waLink(bcWaText(t,'conf'),t.tel)}" target="_blank" rel="noopener noreferrer" data-bwa="conf">💬 Confirmar por WhatsApp</a><a class="btn sm" href="${waLink(bcWaText(t,'rec'),t.tel)}" target="_blank" rel="noopener noreferrer" data-bwa="rec">Recordatorio</a><a class="btn sm" href="${bcGcal(t)}" target="_blank" rel="noopener noreferrer">Google Calendar</a></div>`:''}
  <div class="row" style="gap:.4rem;flex-wrap:wrap;margin-top:.8rem">${st==='pend'?btn('conf','Confirmado','gold'):''}${['pend','conf'].includes(st)?btn('llego','Llegó'):''}${['pend','conf','llego'].includes(st)?btn('atend','Empezar a atender',st==='llego'?'gold':''):''}${live&&bcCan('sell')?btn('cobrar','Cobrar en Vender','gold'):''}${live?btn('edit','Reprogramar'):''}${['pend','conf'].includes(st)?btn('novino','No vino','red'):''}${live?btn('cancel','Cancelar','ghost'):''}${t.saleId?`<span class="sm mut">Cobrado: venta ${esc((S.sales.find(s=>s.id===t.saleId)||{}).n||'')}</span>`:''}</div>
  <details style="margin-top:.6rem"><summary class="sm">Historial del turno</summary><ul class="sm" style="padding-left:1.1rem">${(t.log||[]).map(l=>`<li>${fmtDT(l.t)} · ${esc((BC_ST[l.s]||{l:l.s}).l)}${l.note?' ('+esc(l.note)+')':''} · ${esc(l.by)}</li>`).join('')}</ul></details>`,{ok:false,cancelText:'Cerrar'});
 w.addEventListener('click',e=>{const a=e.target.closest('[data-bwa]');if(a){if(a.dataset.bwa==='conf'&&t.st==='pend'){bcLog(t,'conf');audit('TURNO_CONFIRMADO','#'+t.n+' · por WhatsApp');save();}return;}
  const b=e.target.closest('[data-bts]');if(!b)return;const v=b.dataset.bts;w.remove();
  if(v==='cobrar')return A.bcCobrar({dataset:{id:t.id}});if(v==='edit')return bcTurnoForm({},t);
  if(v==='cancel'||v==='novino')return confirmBox(v==='cancel'?'Cancelar turno':'Marcar que no vino','Turno #'+t.n+' de '+esc(t.name)+' · '+bcHM(t.t)+'. El horario queda libre.',()=>{bcLog(t,v);audit(v==='cancel'?'TURNO_CANCELADO':'TURNO_NO_VINO','#'+t.n+' · '+t.name);save();rerender();});
  bcLog(t,v);audit('TURNO_ESTADO','#'+t.n+' · '+BC_ST[v].l);save();rerender();});};
A.bcSt=el=>{const t=bcTur(el.dataset.id);if(!t)return;bcLog(t,el.dataset.v);audit('TURNO_ESTADO','#'+t.n+' · '+BC_ST[el.dataset.v].l);save();rerender();};
/* cobrar un turno en Vender (pagos mixtos, cupón, sellos, caja de la sucursal) */
A.bcCobrar=el=>{if(!bcCan('sell'))return toast('Cobrar lo hace recepción o un encargado.',1);const t=bcTur(el.dataset.id);if(!t)return;
 if(pos.lines.length&&!(pos.bcSrc&&pos.bcSrc.turno===t.id))return toast('Hay una venta en curso en Vender: terminala o borrala primero.',1);
 const w=modal('Cobrar turno #'+t.n,`<p><b>${esc(t.name)}</b> · ${esc(bcSvcName(t.svcs))} con ${esc(bcBN(t.barb))}</p><label>Servicios realizados</label>${bcSvcPick(t.svcs)}
  <div class="grid g2"><div><label for="bc-tip">Propina para ${esc(bcBF(t.barb))} ($)</label>${numIn('bc-tip',0,'0')}</div><div><label>&nbsp;</label><div class="row" style="gap:.3rem">${[1000,1500,2000].map(v=>`<button type="button" class="btn sm" data-tp="${v}">$ ${v.toLocaleString('es-AR')}</button>`).join('')}</div></div></div>
  <p class="sm mut">Se carga en Vender con la caja de <b>${esc(bcBr(t.br).name)}</b>. Los productos se suman en Vender. La propina va 100 % al barbero; la visita suma un sello del Club.</p>`,{okText:'Pasar a Vender',onOk:w=>{const svcs=$$('.bc-sv',w).filter(x=>x.checked).map(x=>x.value);if(!svcs.length)return w._err('Elegí al menos un servicio.'),false;const tip=cents(val('bc-tip'))||0;
   bcSetEquipo(t.br);if(t.st!=='atend'&&t.st!=='llego'){bcLog(t,'atend');}t.svcs=svcs;
   pos.lines=svcs.map(id=>{const p=prod(id);return{pid:p.id,name:pfull(p),rubro:p.rubro,qty:1,price:p.price,cost:0,unit:'u',list:p.price};});
   if(tip>0){const p=prod(BC_TIP);pos.lines.push({pid:p.id,name:p.name+' · '+bcBF(t.barb),rubro:p.rubro,qty:1,price:tip,cost:0,unit:'u',list:tip});}
   pos.sel=pos.lines.length-1;if(t.cust)pos.cust=t.cust;pos.bcSrc={turno:t.id,barb:t.barb,br:t.br,label:'turno #'+t.n+' · '+t.name+' con '+bcBF(t.barb)};pos.bcBarb=t.barb;
   audit('TURNO_A_COBRO','#'+t.n+' · '+money(pos.lines.reduce((a,l)=>a+l.price*l.qty,0)));save();go('vender');setTimeout(()=>{try{if(typeof posCart==='function')posCart();A.cobrar();}catch(e){}},200);}});
 w.addEventListener('click',e=>{const b=e.target.closest('[data-tp]');if(b){$('#bc-tip',w).value=b.dataset.tp;}});};
/* cola de espera */
A.bcColaAdd=()=>{const br=bcViewBr()||bcEquipoBr();modal('Sumar a la cola de espera',`<label for="bq-n">Nombre</label><input id="bq-n" maxlength="40" list="bt-cl2" autocomplete="off"><datalist id="bt-cl2">${S.customers.slice(0,400).map(c=>`<option value="${esc(custFull(c).replace(' (ejemplo)',''))}">`).join('')}</datalist>
 <div class="grid g2"><div><label for="bq-b">Sucursal</label><select id="bq-b" ${bcUserBr()?'disabled':''}>${BC_BR.map(b=>`<option value="${b.id}" ${br===b.id?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div><div><label for="bq-e">Barbero</label><select id="bq-e"><option value="">El primero libre</option>${bcBarbs().map(e=>`<option value="${e.id}">${esc(bcBN(e.id))} (${esc(bcBr(e.bc.br).short)})</option>`).join('')}</select></div></div><label>Servicio</label>${bcSvcPick(['sv-corte'])}`,
 {okText:'Sumar',onOk:w=>{const n=val('bq-n').trim();if(n.length<2)return w._err('Falta el nombre.'),false;const svcs=$$('.bc-sv',w).filter(x=>x.checked).map(x=>x.value);if(!svcs.length)return w._err('Elegí el servicio.'),false;
  const c=S.customers.find(x=>bcNorm(custFull(x).replace(' (ejemplo)',''))===bcNorm(n));const b=$('#bq-b',w).value;const e=val('bq-e');if(e&&bcEmp(e).bc.br!==b)return w._err('Ese barbero trabaja en la otra sucursal.'),false;
  G().cola.push({id:uid(),br:b,name:n,cust:c?c.id:'',tel:c?c.wa:'',svcs,barb:e,ts:now(),st:'espera'});audit('COLA_ESPERA','+ '+n+' · '+bcBr(b).short);save();rerender();}});};
A.bcColaX=el=>{const q=G().cola.find(x=>x.id===el.dataset.id);if(!q)return;q.st='fuera';audit('COLA_ESPERA','− '+q.name);save();rerender();};
A.bcColaTomar=el=>{const D=G();let q=el.dataset.id?D.cola.find(x=>x.id===el.dataset.id):null;const td=dkey(now());const nm=Math.floor(bcNowMin()/5)*5;
 let barb=el.dataset.b||'';if(!q)q=D.cola.filter(x=>x.st==='espera'&&(!barb||(!x.barb||x.barb===barb)&&x.br===bcEmp(barb).bc.br)).sort((a,b)=>a.ts-b.ts)[0];if(!q)return toast('No hay nadie esperando.',1);
 if(!barb)barb=q.barb||(bcBarbs(q.br).find(e=>!D.turnos.some(t=>t.barb===e.id&&t.day===td&&t.st==='atend'))||{}).id;if(!barb)return toast('No hay sillas libres en '+bcBr(q.br).short+'.',1);
 const dur=bcSvcDur(q.svcs);const t=bcNewTurno({br:q.br,barb,day:td,t:nm,svcs:q.svcs,dur,name:q.name,tel:q.tel,cust:q.cust,origin:'cola',st:'atend'});q.st='tomado';q.turno=t.id;
 const clash=bcBusy(barb,td,t.id).filter(x=>x.st!=='hecho'&&nm<x.t+x.dur&&x.t<nm+dur);if(clash.length)toast('Atención: se superpone con el turno de las '+bcHM(clash[0].t)+' ('+clash[0].name+').',1);else toast(bcBF(barb)+' atiende a '+q.name+'.');save();rerender();};
/* barberos */
A.bcBEdit=el=>{if(!isAdm())return toast('Sólo el administrador cambia el modelo de trabajo.',1);const e=bcEmp(el.dataset.id);if(!e)return;
 modal('Modelo de trabajo · '+bcBN(e.id),`<label for="bm-m">Modelo</label><select id="bm-m"><option value="comision" ${e.bc.modelo==='comision'?'selected':''}>Comisión por corte</option><option value="alquiler" ${e.bc.modelo==='alquiler'?'selected':''}>Alquiler de silla</option></select>
  <div class="grid g2"><div><label for="bm-c">Comisión para el barbero (%)</label><input id="bm-c" inputmode="decimal" value="${e.bc.com||''}" placeholder="45"></div><div><label for="bm-a">Alquiler mensual de la silla ($)</label>${numIn('bm-a',e.bc.alq,'0')}</div></div>
  <label for="bm-s">Especialidad</label><input id="bm-s" maxlength="40" value="${esc(e.bc.esp)}"><p class="sm mut">El cambio rige desde ahora; los cobros ya hechos conservan cómo se registraron.</p>`,{onOk:w=>{const m=val('bm-m'),c=parseNum(val('bm-c')),a=cents(val('bm-a'));
  if(m==='comision'&&(isNaN(c)||c<=0||c>90))return w._err('La comisión va de 1 a 90 %.'),false;if(m==='alquiler'&&!(a>0))return w._err('Indicá el alquiler mensual.'),false;
  const old=e.bc.modelo+' '+(e.bc.modelo==='comision'?e.bc.com+'%':money(e.bc.alq));Object.assign(e.bc,{modelo:m,com:m==='comision'?c:0,alq:m==='alquiler'?a:0,esp:val('bm-s').trim()||e.bc.esp});
  audit('BARBERO_MODELO',bcBN(e.id)+' · de '+old+' a '+m+' '+(m==='comision'?c+'%':money(a)),{ent:'empleado',eid:e.id,old,nw:m});save();rerender();}});};
A.bcBDet=el=>{const e=bcEmp(el.dataset.id);if(!e)return;const [f,t,lbl]=bcPeriod(BCU.per);const l=bcLiq(e,f,t);
 const w=modal(bcBN(e.id)+' · '+lbl,`<div class="row" style="gap:.5rem;flex-wrap:wrap;align-items:center">${bcAv(e,40)}<span class="sp"><b>${esc(e.bc.esp)}</b> · ${esc(bcBr(e.bc.br).name)} · desde ${e.bc.desde}<br><span class="sm">${e.bc.modelo==='comision'?'Comisión por corte: '+e.bc.com+' % para el barbero':'Alquiler de silla: '+money(e.bc.alq)+' por mes'}</span></span>${isAdm()?`<button class="btn sm" data-bm="1">Cambiar modelo</button>`:''}</div><p class="sm mut">${l.ss.length} cobros · ${l.n} servicios · ${money(l.svc)} · propinas ${money(l.tip)}</p><div class="tw" style="max-height:55vh;overflow:auto"><table><thead><tr><th>Fecha</th><th>Venta</th><th>Cliente</th><th>Servicios</th><th class="r">Importe</th><th class="r">Propina</th></tr></thead><tbody>
  ${l.ss.slice().reverse().slice(0,300).map(s=>{const x=bcSplit(s);return `<tr><td>${fmtDT(s.ts)}</td><td>${esc(s.n)}</td><td>${esc(String(s.custName||'—').replace(' (ejemplo)',''))}</td><td>${esc(s.items.filter(i=>String(i.pid).startsWith('sv-')&&i.pid!==BC_TIP).map(i=>i.name).join(' + '))}</td><td class="r">${money(x.svc)}</td><td class="r">${x.tip?money(x.tip):'—'}</td></tr>`;}).join('')}</tbody></table></div>`,{ok:false,cancelText:'Cerrar',wide:true});w.addEventListener('click',ev=>{if(ev.target.closest('[data-bm]')){w.remove();A.bcBEdit({dataset:{id:e.id}});}});};
A.bcLiqOk=el=>{const e=bcEmp(el.dataset.id);if(!e)return;const [f,t,lbl]=bcPeriod(BCU.per);const l=bcLiq(e,f,t);const s=openSess();
 modal('Liquidar a '+bcBN(e.id),`<p>${esc(lbl)} · ${l.n} servicios · ${money(l.svc)} facturados.</p><ul class="sm"><li>Por sus servicios (${e.bc.modelo==='comision'?e.bc.com+' %':'100 %, alquila la silla'}): <b>${money(l.barb)}</b></li><li>Propinas: <b>${money(l.tip)}</b></li>${l.alq?`<li>Alquiler de la silla: <b>− ${money(l.alq)}</b></li>`:''}</ul><p>Neto: <b>${money(l.pagar)}</b> ${l.pagar<0?'(el barbero le debe a Bacano)':''}</p>
  ${l.pagar>0&&s&&can('cash_mov')?`<label class="chk"><input type="checkbox" id="bl-c"> Pagar ahora en efectivo desde la caja abierta (${esc(s.regName||'caja')})</label>`:''}`,{okText:'Registrar liquidación',onOk:w=>{let mov=false;
  if($('#bl-c',w)&&$('#bl-c',w).checked){const er=addMov('egreso',ownerRubro(),'Liquidación '+bcBN(e.id)+' · '+lbl,l.pagar);if(er)return w._err(er),false;mov=true;}
  G().liqs.push({id:uid(),ts:now(),barb:e.id,per:lbl,svc:l.svc,tip:l.tip,alq:l.alq,neto:l.pagar,by:bcActor(),mov});audit('LIQUIDACION_BARBERO',bcBN(e.id)+' · '+lbl+' · neto '+money(l.pagar)+(mov?' · pagado de caja':''));save();rerender();toast('Liquidación registrada.');}});};
A.bcExp=()=>{if(!can('impex'))return toast('Sin permiso',1);const [f,t,lbl]=bcPeriod(BCU.per);const rows=bcBarbs(bcViewBr()).map(e=>{const l=bcLiq(e,f,t);return[bcBN(e.id),bcBr(e.bc.br).short,e.bc.modelo,e.bc.com||'',e.bc.alq/100,l.n,l.svc/100,l.tip/100,l.barb/100,l.alq/100,l.pagar/100,l.bacano/100];});
 download('bacano-liquidacion.xls',toXLS(['barbero','sucursal','modelo','comision_%','alquiler_mes','servicios','facturado','propinas','para_el_barbero','alquiler_periodo','neto_a_pagar','aporte_bacano'],rows),'application/vnd.ms-excel;charset=utf-8');audit('EXPORTAR','liquidación barberos · '+lbl);};
/* stock por sucursal */
A.bcXfer=el=>{if(!bcCan('bc_stock'))return toast('Sin permiso',1);const P=S.products.filter(p=>p.active&&p.bcs);const sel=el&&el.dataset&&el.dataset.id||'';const ub=bcUserBr();
 const w=modal('Transferir entre sucursales',`<label for="bx-p">Producto</label><select id="bx-p">${P.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name)} · Centro ${p.bcs.centro||0} · Norte ${p.bcs.norte||0}</option>`).join('')}</select>
  <div class="grid g2"><div><label for="bx-f">Desde</label><select id="bx-f">${BC_BR.map(b=>`<option value="${b.id}" ${(ub?ub===b.id:b.id==='centro')?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div><div><label for="bx-q">Cantidad</label><input id="bx-q" inputmode="numeric" value="1"></div></div>
  <p class="sm mut">Va a la otra sucursal. El stock total no cambia; queda en el historial de los dos lados.</p>`,{okText:'Transferir',onOk:w=>{const p=prod(val('bx-p'));const f=val('bx-f');const to=f==='centro'?'norte':'centro';const q=parseInt(val('bx-q'),10);
  if(!p)return false;if(!(q>0))return w._err('Cantidad inválida.'),false;if((p.bcs[f]||0)<q)return w._err('En '+bcBr(f).short+' hay '+(p.bcs[f]||0)+'.'),false;if(ub&&ub!==f&&!isAdm())return w._err('Sólo podés mandar desde tu sucursal.'),false;
  bcMove(p,f,-q,'transferencia','a '+bcBr(to).short);bcMove(p,to,q,'transferencia','desde '+bcBr(f).short);audit('STOCK_TRANSFERENCIA',p.name+' · '+q+' u · '+bcBr(f).short+' → '+bcBr(to).short);save();rerender();toast('Transferidas '+q+' u a '+bcBr(to).short+'.');}});};
A.bcIngreso=()=>{if(!bcCan('bc_stock'))return toast('Sin permiso',1);const P=S.products.filter(p=>p.active&&p.bcs);const ub=bcUserBr();
 modal('Ingreso de mercadería',`<label for="bi-p">Producto</label><select id="bi-p">${P.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select><div class="grid g2"><div><label for="bi-b">Sucursal</label><select id="bi-b" ${ub?'disabled':''}>${BC_BR.map(b=>`<option value="${b.id}" ${ub===b.id?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div><div><label for="bi-q">Cantidad</label><input id="bi-q" inputmode="numeric" value="6"></div></div><label for="bi-n">Remito / nota</label><input id="bi-n" maxlength="60" placeholder="Remito 0001-…">
  <p class="sm mut">Para cargar la factura del proveedor y su cuenta corriente usá Compras y proveedores.</p>`,{okText:'Ingresar',onOk:w=>{const p=prod(val('bi-p'));const b=$('#bi-b',w).value;const q=parseInt(val('bi-q'),10);if(!p||!(q>0))return w._err('Cantidad inválida.'),false;
  bcSyncAll();p.stock=Math.round((p.stock+q)*1000)/1000;bcMove(p,b,q,'ingreso',val('bi-n'));audit('STOCK_INGRESO',p.name+' · +'+q+' u · '+bcBr(b).short+(val('bi-n')?' · '+val('bi-n'):''));save();rerender();}});};
A.bcAdj=el=>{if(!bcCan('bc_stock'))return toast('Sin permiso',1);const p=prod(el.dataset.id);if(!p)return;const ub=bcUserBr();const br=ub||bcViewBr()||'centro';
 modal('Conteo · '+p.name,`<div class="grid g2"><div><label for="ba-b">Sucursal</label><select id="ba-b" ${ub?'disabled':''}>${BC_BR.map(b=>`<option value="${b.id}" ${br===b.id?'selected':''}>${esc(b.name)} (sistema: ${p.bcs[b.id]||0})</option>`).join('')}</select></div><div><label for="ba-q">Contado</label><input id="ba-q" inputmode="numeric" value="${p.bcs[br]||0}"></div></div><label for="ba-r">Motivo</label><input id="ba-r" maxlength="60" placeholder="Conteo semanal, rotura, uso interno…">`,
 {okText:'Ajustar',onOk:w=>{const b=$('#ba-b',w).value;const q=parseInt(val('ba-q'),10);if(isNaN(q)||q<0)return w._err('Cantidad inválida.'),false;if(!val('ba-r').trim())return w._err('Indicá el motivo.'),false;const d=q-(p.bcs[b]||0);if(!d)return true;
  bcSyncAll();p.stock=Math.round((p.stock+d)*1000)/1000;bcMove(p,b,d,'conteo',val('ba-r'));audit('STOCK_CONTEO',p.name+' · '+bcBr(b).short+' · '+(d>0?'+':'')+d+' · '+val('ba-r'));save();rerender();}});};
A.bcMovs=el=>{const p=prod(el.dataset.id);if(!p)return;const M=G().moves.filter(m=>m.pid===p.id).slice(-60).reverse();const V=S.sales.filter(s=>s.status==='ok'&&s.items.some(i=>i.pid===p.id)).slice(-30).reverse();
 modal('Historial · '+p.name,`<h4 style="margin:.2rem 0">Movimientos</h4>${M.length?`<ul class="sm" style="padding-left:1.1rem">${M.map(m=>`<li>${fmtDT(m.ts)} · ${esc(bcBr(m.br).short)} · ${esc(m.kind)} ${m.q>0?'+':''}${m.q}${m.note?' · '+esc(m.note):''} · ${esc(m.by)}</li>`).join('')}</ul>`:'<p class="sm mut">Sin movimientos manuales todavía.</p>'}
  <h4 style="margin:.6rem 0 .2rem">Últimas ventas</h4><ul class="sm" style="padding-left:1.1rem">${V.map(s=>`<li>${fmtDT(s.ts)} · ${esc(bcBr(bcSaleBr(s)).short)} · venta ${esc(s.n)} · ${s.items.filter(i=>i.pid===p.id).reduce((a,i)=>a+i.qty,0)} u</li>`).join('')}</ul>`,{ok:false,cancelText:'Cerrar'});};

/* ---------- integración con Vender: barbero que atendió, sucursal, sello por visita y stock de la sucursal ---------- */
if(isBarberBuild()){
 const _cs=commitSale;commitSale=function(method,arca,channel,lines,opts){const src=pos.bcSrc&&lines===pos.lines?pos.bcSrc:null;const barb=lines===pos.lines?(pos.bcBarb||''):'';const r=_cs.apply(this,arguments);
  if(r&&r.sale){try{const s=r.sale;const se=S.sessions.find(x=>x.id===s.sessId);const b=se?bcBrOfBranch(se.branchId):null;const br=b?b.id:bcEquipoBr();
   const tip=s.items.filter(i=>i.pid===BC_TIP).reduce((a,i)=>a+lineTotal(i),0);s.bc={barb:src?src.barb:barb,br,turno:src?src.turno:'',tip};
   /* stock de la sucursal */
   s.items.forEach(it=>{const p=prod(it.pid);if(p&&p.bcs&&!bcIsSvc(p)){p.bcs[br]=Math.round(((p.bcs[br]||0)-it.qty)*1000)/1000;}});
   /* el turno queda atendido */
   if(src){const t=bcTur(src.turno);if(t){bcLog(t,'hecho');t.saleId=s.id;}}
   /* cada visita con servicio suma un sello del Club (los productos solos no suman) */
   if(s.cust&&!s.stamped&&s.items.some(i=>String(i.pid).startsWith('sv-')&&i.pid!==BC_TIP&&lineTotal(i)>0)){S.loyalty.ledger.push({id:uid(),cust:s.cust,ts:now(),kind:'stamp',n:1,ref:'visita '+s.n,user:user?user.name:'sistema'});s.stamped=true;s.bcStamp=1;}
   if(s.bc.barb)audit('VENTA_BARBERO',s.n+' · atendió '+bcBN(s.bc.barb)+' · '+bcBr(br).short+(tip?' · propina '+money(tip):''));
   pos.bcSrc=null;pos.bcBarb='';save();}catch(e){console.warn(e);}}
  return r;};
 const _vR=SCREENS.vender&&SCREENS.vender.render;if(_vR)SCREENS.vender.render=function(){const h=_vR.apply(this,arguments);const svc=pos.lines.some(l=>String(l.pid).startsWith('sv-'));const eb=bcBr(bcEquipoBr());
  let bar=`<div class="bc-vbar"><span>${ico('sucur')} Caja de <b>${esc(eb.name)}</b></span>`;
  if(pos.bcSrc)bar+=`<span>Cobrando el <b>${esc(pos.bcSrc.label)}</b>: al cobrar el turno queda atendido y suma el sello.</span><button class="btn sm" data-act="bcSrcX">Soltar el turno</button>`;
  else if(svc)bar+=`<label class="row" style="gap:.4rem;align-items:center;margin:0"><span>Barbero que atendió</span><select id="bc-vb" style="max-width:220px"><option value="">— elegir —</option>${bcBarbs(eb.id).map(e=>`<option value="${e.id}" ${pos.bcBarb===e.id?'selected':''}>${esc(bcBN(e.id))}</option>`).join('')}</select></label>${pos.bcBarb?'':'<span class="bc-warn">Sin barbero, el servicio no entra en su liquidación.</span>'}<button class="btn sm" data-act="bcTipAdd">+ Propina</button>`;
  return bar+'</div>'+h;};
 const _vA=SCREENS.vender&&SCREENS.vender.after;SCREENS.vender.after=function(){const r=_vA?_vA.apply(this,arguments):undefined;const s=$('#bc-vb');if(s)s.addEventListener('change',()=>{pos.bcBarb=s.value;rerender();});return r;};
 A.bcSrcX=()=>{pos.bcSrc=null;rerender();toast('La venta sigue en Vender, sin cerrar el turno.');};
 A.bcTipAdd=()=>{if(!pos.bcBarb)return toast('Elegí primero el barbero que atendió.',1);modal('Propina para '+bcBF(pos.bcBarb),`<label for="bc-tp2">Importe ($)</label>${numIn('bc-tp2',100000,'0')}`,{okText:'Sumar',onOk:w=>{const v=cents(val('bc-tp2'));if(!(v>0))return w._err('Importe inválido.'),false;const p=prod(BC_TIP);pos.lines.push({pid:p.id,name:p.name+' · '+bcBF(pos.bcBarb),rubro:p.rubro,qty:1,price:v,cost:0,unit:'u',list:v});pos.sel=pos.lines.length-1;rerender();}});};
}

/* ---------- API para la página pública (mismo equipo; datos de la demo) ---------- */
window.BC_API={
 ctx:()=>({brs:BC_BR.map(b=>({id:b.id,name:b.name,short:b.short,zona:b.zona,dir:b.dir,tel:b.tel,wa:b.wa,hor:b.hor,color:b.color,sillas:b.sillas})),
  barbs:bcBarbs().map(e=>({id:e.id,name:bcBN(e.id),apodo:e.bc.apodo,esp:e.bc.esp,br:e.bc.br,color:e.bc.color,desde:e.bc.desde})),
  svcs:BC_SVC.map(([id])=>prod(id)).filter(p=>p&&p.active).map(p=>({id:p.id,n:p.name,d:p.desc||'',price:p.price/100,dur:p.svc.dur,star:!!p.featured})),
  cats:BC_CATS.filter(c=>c[0]!=='bc-svc').map(c=>({id:c[0],n:c[3]})),
  prods:S.products.filter(p=>p.active&&p.menu&&p.bcs&&!p.archived).map(p=>({id:p.id,cat:p.rubro,n:p.name,d:p.desc||'',price:p.price/100,st:{centro:Math.max(0,Math.floor(p.bcs.centro||0)),norte:Math.max(0,Math.floor(p.bcs.norte||0))},star:!!p.featured})),
  club:{goal:+S.loyalty.goal||10,reward:String(S.loyalty.reward||'')},plan:(S.plans||[]).filter(p=>p.active).map(p=>({n:p.name,price:p.price/100,pct:p.pct,d:p.desc}))[0]||null}),
 days:()=>{const td=dkey(now());const out=[];for(let i=0;i<14&&out.length<10;i++){const d=addDays(td,i);if(bcDow(d)!==0)out.push({k:d,l:bcDayLbl(d),dn:+d.slice(8),dw:BC_DIAS[bcDow(d)].slice(0,3)});}return out;},
 slots:(br,barb,day,svcs)=>{if(!bcBr(br))return[];const ok=(svcs||[]).filter(id=>{const p=prod(id);return p&&p.active&&bcIsSvc(p)&&!bcIsTip(p);});if(!ok.length)return[];if(barb&&!(bcEmp(barb)&&bcEmp(barb).bc&&bcEmp(barb).bc.br===br))return[];
  return bcSlots(br,barb||'',String(day||''),bcSvcDur(ok)).map(s=>({t:s.t,barb:s.barb,bn:bcBF(s.barb)}));},
 book:o=>{const br=bcBr(o&&o.br)?o.br:'';const svcs=(o&&Array.isArray(o.svcs)?o.svcs:[]).filter(id=>{const p=prod(id);return p&&p.active&&bcIsSvc(p)&&!bcIsTip(p);}).slice(0,4);
  const nm=String(o&&o.name||'').replace(/[<>]/g,'').trim().slice(0,40);const tel=String(o&&o.tel||'').replace(/[^\d+ -]/g,'').slice(0,20);const day=String(o&&o.day||'');const t=bcMin(o&&o.t);
  if(!br)return{ok:false,msg:'Elegí la sucursal.'};if(!svcs.length)return{ok:false,msg:'Elegí al menos un servicio.'};if(nm.length<2)return{ok:false,msg:'Falta tu nombre.'};if(tel.replace(/\D/g,'').length<8)return{ok:false,msg:'Revisá tu WhatsApp.'};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||isNaN(t))return{ok:false,msg:'Elegí día y horario.'};const dur=bcSvcDur(svcs);
  let barb=String(o.barb||'');if(barb&&!(bcEmp(barb)&&bcEmp(barb).bc&&bcEmp(barb).bc.br===br))return{ok:false,msg:'Ese barbero no está en esa sucursal.'};
  if(!barb){const s=bcSlots(br,'',day,dur).find(x=>x.t===bcHM(t));barb=s?s.barb:'';}
  if(!barb||!bcFree(barb,day,t,dur)||(day===dkey(now())&&t<bcNowMin()+20))return{ok:false,msg:'Ese horario se acaba de ocupar. Elegí otro.'};
  const c=bcCustByTel(tel);const tr=bcNewTurno({br,barb,day,t,svcs,dur,name:nm,tel,cust:c?c.id:'',origin:'web',note:String(o.note||'').replace(/[<>]/g,'').slice(0,80),st:'pend',by:'Turnero web'});save();
  return{ok:true,n:tr.n,barb:bcBN(barb),br:bcBr(br).name,dir:bcBr(br).dir,when:bcDayLbl(day)+' '+day.split('-').reverse().slice(0,2).join('/')+' · '+bcHM(t),svc:bcSvcName(svcs),total:bcSvcTot(svcs)/100,dur,
   wa:waLink('Hola Bacano! Reservé el turno #'+tr.n+' en '+bcBr(br).name+' para el '+bcDayLbl(day).toLowerCase()+' '+day.split('-').reverse().slice(0,2).join('/')+' a las '+bcHM(t)+' con '+bcBF(barb)+' ('+bcSvcName(svcs)+'). Soy '+nm+'.',bcBr(br).wa),gcal:bcGcal(tr),socio:!!c};},
 order:o=>{const br=bcBr(o&&o.br);if(!br)return{ok:false,msg:'Elegí la sucursal donde retirás.'};const L=(Array.isArray(o.lines)?o.lines:[]).slice(0,20).map(l=>{const p=prod(l&&l.pid);const q=Math.max(1,Math.min(20,parseInt(l&&l.qty,10)||1));return p&&p.bcs&&p.active?{p,q}:null;}).filter(Boolean);
  if(!L.length)return{ok:false,msg:'El pedido está vacío.'};const bad=L.find(x=>x.q>(x.p.bcs[br.id]||0));if(bad)return{ok:false,msg:'En '+br.short+' quedan '+Math.max(0,bad.p.bcs[br.id]||0)+' de '+bad.p.name+'.'};
  const nm=String(o.name||'').replace(/[<>]/g,'').trim().slice(0,40);const tot=L.reduce((a,x)=>a+x.p.price*x.q,0);
  S.orderReqs.push({id:uid(),ts:now(),total:tot,n:L.length,coupon:'',br:br.id});if(S.orderReqs.length>300)S.orderReqs.shift();audit('PEDIDO_WEB','retiro en '+br.short+' · '+L.length+' producto(s) · '+money(tot));save();
  return{ok:true,wa:waLink('Hola '+br.name+'! Quiero reservar para retirar y pagar en el local:\n'+L.map(x=>'• '+x.q+' × '+x.p.name+' ('+money(x.p.price*x.q)+')').join('\n')+'\nTotal: '+money(tot)+(nm?'\nSoy '+nm+'.':''),br.wa)};},
 openPanel:()=>{location.hash='#acceso';}};

/* ---------- integración con la navegación, el Resumen, los avisos y el ingreso ---------- */
if(isBarberBuild()){
 const sec='Barbería';UX_SEC_ORDER.splice(1,0,sec);
 const items=[['bchoy','Hoy en el local'],['bcagenda','Agenda de turnos'],['bcmis','Mis números'],['bcbarb','Barberos y liquidación'],['bcrank','Ranking'],['bcstock','Stock por sucursal'],['bcmkt','Campañas por WhatsApp']];
 items.forEach(([k])=>{UX_SEC_OF[k]=sec;});NAV.splice(1,0,...items.map(([k])=>[k,sec]));
 ['bchoy','bcagenda','bcmis'].forEach(k=>{if(!UX_COMPACT_OK.includes(k))UX_COMPACT_OK.push(k);});
 delete SCREENS.pedidos;
 Object.assign(UX_TITLE,{inventario:'Stock e inventario'});
 SCREENS.bcmis.show=()=>!!(user&&user.role==='barbero');
 const _uxB=uxBadges;uxBadges=function(){const b=_uxB();try{delete b.pedidos;const D=S.bc;if(!D)return b;const td=dkey(now());const vb=bcViewBr();
  const pend=D.turnos.filter(t=>t.st==='pend'&&t.day>=td&&(!vb||t.br===vb)).length;if(pend)b.bcagenda={n:pend,c:'amber',t:pend+' turno(s) para confirmar'};
  const q=D.cola.filter(x=>x.st==='espera'&&(!vb||x.br===vb)).length;const lg=D.turnos.filter(t=>t.day===td&&t.st==='llego'&&(!vb||t.br===vb)).length;if(q||lg)b.bchoy={n:q+lg,c:'red',pulse:q?1:0,t:[q?q+' en la cola de espera':'',lg?lg+' cliente(s) ya llegaron':''].filter(Boolean).join(' · ')};
  const low=S.products.filter(p=>p.active&&p.bcs&&BC_BR.some(x=>(!vb||x.id===vb)&&(p.bcs[x.id]||0)<=(p.min||0))).length;if(low)b.bcstock={n:low,c:'red',t:low+' producto(s) bajo el mínimo en alguna sucursal'};
  delete b.inventario;}catch(e){}return b;};
 const _ut=uxToday;uxToday=function(){const T=_ut.apply(this,arguments);try{T.orders-=T.pya;T.pya=0;T.low=S.products.filter(p=>p.active&&p.bcs&&BC_BR.some(x=>(p.bcs[x.id]||0)<=(p.min||0))).length;}catch(e){}return T;};
 const _uth=uxTodayHTML;uxTodayHTML=function(){let h=_uth.apply(this,arguments);try{const td=dkey(now());const T=G().turnos.filter(t=>t.day===td&&t.st!=='cancel');
  h=h.replace(/<span>Pedidos delivery \(PedidosYa\)<\/span><b>\d+<\/b><small>en curso<\/small>/,`<span>Turnos de hoy</span><b>${T.length}</b><small>${T.filter(t=>t.st==='hecho').length} atendidos · ${T.filter(t=>BC_LIVE.includes(t.st)).length} por atender</small>`).replace('productos con 5 o menos','productos bajo el mínimo en alguna sucursal');}catch(e){}return h;};
 const _hs=homeScreen;homeScreen=function(){try{const r=user&&user.role;if(r==='barbero'&&scrOk('bcagenda'))return 'bcagenda';if((r==='mostrador'||r==='supervisor')&&scrOk('bchoy'))return 'bchoy';}catch(e){}return _hs.apply(this,arguments);};
 if(typeof A.login==='function'){const _lg=A.login;A.login=function(){const r=_lg.apply(this,arguments);try{if(user){if(user.bcBr){bcSetEquipo(user.bcBr);save();}
   const k=user.role==='barbero'?'bcagenda':(user.role==='mostrador'||user.role==='supervisor')?'bchoy':'';if(user.role==='barbero')BCU.mine=1;if(k&&scrOk(k))location.hash='#panel/'+k;}}catch(e){}return r;};}
 const _inR=SCREENS.inicio&&SCREENS.inicio.render;if(_inR)SCREENS.inicio.render=function(){const h=_inR.apply(this,arguments);let card='';try{const D=G();const td=dkey(now());const T=D.turnos.filter(t=>t.day===td);
  card=`<div class="card dp-hoy"><div class="row" style="flex-wrap:wrap;gap:.5rem"><h2 class="sp" style="margin:0">La barbería hoy</h2><button class="btn sm" data-act="nav" data-id="bchoy">Ver las sillas</button><button class="btn sm gold" data-act="nav" data-id="bcagenda">Abrir la agenda</button></div>
   <div class="grid g4" style="margin-top:.6rem">${BC_BR.map(b=>{const tb=T.filter(t=>t.br===b.id);const f=bcSalesIn(new Date(td+'T00:00:00').getTime(),new Date(td+'T00:00:00').getTime()+BCD,b.id).reduce((a,s)=>a+s.total,0);return bcKpi(b.name,money(f),tb.filter(t=>t.st==='hecho').length+' atendidos · '+tb.filter(t=>BC_LIVE.includes(t.st)).length+' por atender','','bchoy');}).join('')}
   ${bcKpi('A confirmar',D.turnos.filter(t=>t.st==='pend'&&t.day>=td).length,'turnos de la web y WhatsApp',D.turnos.filter(t=>t.st==='pend'&&t.day>=td).length?'warn':'','bcagenda')}${bcKpi('Cola de espera',D.cola.filter(q=>q.st==='espera').length,'clientes sin turno','','bchoy')}</div></div>`;}catch(e){}
  const i=h.indexOf('</h1>');if(i<0)return card+h;const j=h.indexOf('</div>',i);return j<0?card+h:h.slice(0,j+6)+card+h.slice(j+6);};
 /* reloj: la agenda y las sillas se refrescan solas cada minuto */
 setInterval(()=>{try{if(!$('#panel')||$('#panel').hidden)return;if(['bchoy','bcagenda'].includes(curScreen)&&!$$('#modal-root .ov').length&&!(document.activeElement&&/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)))rerender();}catch(e){}},60000);
}
if(typeof window!=='undefined')window.__bcReady=1;
