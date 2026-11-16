"""Marca de la demo Bacano Show Room · Barber Shop (perfil `barber`): logo, negro carbón y rojo del poste de barbería,
página pública propia (turnero, servicios, equipo, productos, Club Bacano, sucursales) y estilos de la capa.
Los créditos de Vincular Business no se tocan (se cambia la presentación, nunca se eliminan)."""
import os,re,json,base64,io
HERE=os.path.dirname(os.path.abspath(__file__))
def _logo():
    from PIL import Image
    src=os.path.join(HERE,'generic-logo.jpg')  # V27.7 · demo genérica de Vincular Business
    im=Image.open(src).convert('RGB')
    b0=io.BytesIO();im.save(b0,'JPEG',quality=88,optimize=True)
    menu='data:image/jpeg;base64,'+base64.b64encode(b0.getvalue()).decode()
    # ticket térmico: blanco y negro (el logo es claro sobre fondo oscuro: se invierte)
    g=im.convert('L');W=384;H=round(g.height*W/g.width);g=g.resize((W,H),Image.LANCZOS)
    bw=g.point(lambda v:0 if v>110 else 255).convert('1');b=io.BytesIO();bw.save(b,'PNG',optimize=True)
    ticket='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
    ic=im.resize((180,180),Image.LANCZOS);b2=io.BytesIO();ic.save(b2,'PNG',optimize=True)
    icon='data:image/png;base64,'+base64.b64encode(b2.getvalue()).decode()
    return menu,ticket,icon
BC_CSS='''
/* ===== Capa Bacano (perfil barber) ===== */
html{--gold:#d3263a;--gold2:#a81d2e}html[data-theme=dark]{--gold2:#ff6b7d;--selbg:#3a1a1e}
#side,html[data-theme=dark] #side{background:#141414!important}
#side a.on,#side a.on:hover{background:var(--gold)!important;color:#fff!important}
.ux-pos-btn{box-shadow:0 6px 18px rgba(211,38,58,.3)!important}
.btn.gold,.fk.gold,.fk.gold small,.cmp .btn.gold,html[data-theme=dark] .btn.gold,html[data-theme=dark] .fk.gold,html[data-theme=dark] .fk.gold small{color:#fff!important}
.dp-desc{margin:.2rem 0 .8rem}
.dp-kpi{display:flex;flex-direction:column;gap:.15rem;border-left:4px solid var(--line)}.dp-kpi b{font-size:1.6rem;line-height:1.1}.dp-kpi small{color:var(--mut)}
.dp-kpi.red{border-left-color:var(--red)}.dp-kpi.warn{border-left-color:#d97706}.dp-kpi.ok{border-left-color:var(--ok)}.dp-kpi[data-act]{cursor:pointer}
.dp-st{display:inline-flex;align-items:center;gap:.3rem;font-size:.78rem;font-weight:700;border-radius:99px;padding:.2rem .6rem;background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c);border:1px solid color-mix(in srgb,var(--c) 35%,transparent);white-space:nowrap}
html[data-theme=dark] .dp-st{color:color-mix(in srgb,var(--c) 55%,#fff)}
.dp-st::before{content:"";width:.5rem;height:.5rem;border-radius:50%;background:var(--c)}
.dp-chip{display:inline-block;font-size:.72rem;font-weight:700;border-radius:99px;padding:.15rem .5rem;border:1px solid var(--line);color:var(--mut)}
.dp-mo{border:1px solid var(--line);border-radius:12px;padding:.6rem;margin:.4rem 0}
.dp-low{color:var(--red);font-weight:700}.bc-warn{color:#b45309;font-weight:700}html[data-theme=dark] .bc-warn{color:#f2c46d}
.dp-hoy{margin:1rem 0;border-top:4px solid var(--gold)}
.dp-phone{width:min(400px,100%);height:min(720px,70vh);margin:0 auto;border-radius:38px;border:10px solid #1d1b1a;overflow:hidden;background:#141414;box-shadow:0 20px 50px rgba(0,0,0,.4)}.dp-phone iframe{width:100%;height:100%;border:0;display:block}
.bc-av{display:inline-grid;place-items:center;flex:none;width:34px;height:34px;border-radius:50%;background:var(--c);color:#141414;font-weight:800;font-size:13px;letter-spacing:-.02em;box-shadow:0 0 0 2px var(--card),0 0 0 3px var(--c)}
.bc-brpill{display:inline-flex;gap:.4rem;align-items:center;font-weight:700;border-radius:99px;padding:.3rem .8rem;margin:.2rem 0 .6rem;border:1px solid var(--c);color:var(--c)}.bc-brpill svg{width:16px;height:16px}
html[data-theme=dark] .bc-brpill{color:color-mix(in srgb,var(--c) 55%,#fff)}
.bc-suc{margin-top:1rem;border-top:4px solid var(--c)}
.bc-chairs{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.7rem;margin-top:.7rem}
.bc-chair{border:1px solid var(--line);border-radius:16px;padding:.7rem;display:flex;flex-direction:column;gap:.5rem;background:var(--card)}
.bc-chair.busy{border-color:color-mix(in srgb,#ea580c 55%,var(--line));background:color-mix(in srgb,#ea580c 6%,var(--card))}.bc-chair.wait{border-color:color-mix(in srgb,#d97706 55%,var(--line))}
.bc-now small{display:block;color:var(--mut);font-size:.8rem;margin-top:.15rem}
.bc-next{border-top:1px dashed var(--line);padding-top:.45rem;display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;cursor:pointer}
.bc-q{list-style:none;margin:.4rem 0 0;padding:0;display:flex;flex-direction:column}.bc-q li{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;padding:.5rem 0;border-bottom:1px solid var(--line)}.bc-q li:last-child{border-bottom:0}.bc-q .sp{flex:1;min-width:180px}
.bc-gridw{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--card)}
.bc-grid{display:grid;position:relative;min-width:max-content}
.bc-gh{position:sticky;top:0;z-index:2;background:var(--card);border-bottom:1px solid var(--line);padding:.45rem .5rem;display:flex;gap:.4rem;align-items:center;grid-row:1}.bc-gh small{color:var(--mut);font-size:.75rem}

.bc-gc{border-right:1px solid color-mix(in srgb,var(--line) 60%,transparent);border-top:1px dashed color-mix(in srgb,var(--line) 45%,transparent);cursor:pointer}.bc-gc.hr{border-top:1px solid var(--line)}.bc-gc:hover{background:color-mix(in srgb,var(--gold) 10%,transparent)}.bc-gc.past{cursor:default;background:repeating-linear-gradient(45deg,transparent 0 6px,color-mix(in srgb,var(--line) 30%,transparent) 6px 7px)}.bc-gc.past:hover{background:repeating-linear-gradient(45deg,transparent 0 6px,color-mix(in srgb,var(--line) 30%,transparent) 6px 7px)}
.bc-tb{margin:1px 3px;z-index:1;text-align:left;border:0;border-left:4px solid var(--c);border-radius:8px;background:color-mix(in srgb,var(--c) 16%,var(--card));color:inherit;font:inherit;padding:.2rem .4rem;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;gap:.05rem;min-height:0}
.bc-tb b{font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bc-tb small{font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bc-tb.st-hecho,.bc-tb.st-cancel,.bc-tb.st-novino{opacity:.62}.bc-tb.st-cancel b,.bc-tb.st-novino b{text-decoration:line-through}.bc-tb.st-pend{border-left-style:dashed;background:repeating-linear-gradient(-45deg,color-mix(in srgb,var(--c) 12%,var(--card)) 0 6px,color-mix(in srgb,var(--c) 20%,var(--card)) 6px 12px)}
.bc-tb:hover{box-shadow:0 0 0 2px var(--c)}
.bc-nowline{height:2px;background:var(--red);z-index:3;pointer-events:none;align-self:start;box-shadow:0 0 0 1px rgba(211,38,58,.25)}.bc-tb.xs{flex-direction:row;align-items:center}.bc-tb.xs b{font-size:.74rem}.bc-q a.btn{text-decoration:none}.bc-gt{grid-column:1;font-size:.72rem;color:var(--mut);padding:.1rem .4rem 0;border-right:1px solid var(--line);border-top:1px solid color-mix(in srgb,var(--line) 60%,transparent);line-height:1}
.bc-svp{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.1rem .8rem}.bc-svp .chk{margin:.2rem 0}
.bc-vbar{display:flex;flex-wrap:wrap;gap:.5rem .9rem;align-items:center;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:12px;padding:.5rem .8rem;margin-bottom:.6rem;background:var(--card)}.bc-vbar svg{width:16px;height:16px;vertical-align:-3px}
.bc-podium{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin-top:.8rem}@media (max-width:700px){.bc-podium{grid-template-columns:1fr}}
.bc-pod{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.2rem;position:relative}.bc-pod.p0{border-top:4px solid #d4a017}.bc-pod.p1{border-top:4px solid #9ca3af}.bc-pod.p2{border-top:4px solid #b45309}
.bc-medal{position:absolute;top:.5rem;right:.7rem;font-size:1.4rem}.bc-big{font-size:1.5rem;font-weight:800}
.bc-bar{display:grid;grid-template-columns:minmax(120px,1fr) 2fr auto;gap:.5rem;align-items:center;margin:.35rem 0}.bc-bar i{display:block;height:10px;border-radius:99px;background:var(--gold)}.bc-bar span{font-size:.88rem}
@media (prefers-reduced-motion:reduce){.bc-tb{transition:none}}
'''
def brand(h):
    menu,ticket,icon=_logo()
    h=re.sub(r'const LOGO_MENU="[^"]*"','const LOGO_MENU="%s"'%menu,h,count=1)
    h=re.sub(r'const LOGO_TICKET="[^"]*"','const LOGO_TICKET="%s"'%ticket,h,count=1)
    h=h.replace('--ink:#242220;','--ink:#1a1a1a;',1).replace('--gold:#c9963e;','--gold:#d3263a;',1).replace('--gold2:#a87a28;','--gold2:#a81d2e;',1)
    h=h.replace('name="theme-color" content="#242220"','name="theme-color" content="#141414"',1)
    h=re.sub(r'<link rel="icon" href="[^"]*"','<link rel="icon" href="%s"'%icon,h,count=1)
    h=h.replace('style="width:48px;height:27px;object-fit:cover;border-radius:6px"','style="width:40px;height:40px;object-fit:cover;border-radius:50%"')
    h=h.replace('<span>Sistema RAVE</span></a>','<span>Bacano</span></a>',1)
    h=h.replace('Sistema RAVE','Sistema VB').replace('alt="RAVE"','alt="Bacano Show Room · Barber Shop"')
    h=re.sub(r'<title>[^<]*</title>','<title>Bacano · Show Room · Barber Shop · Sistema VB · demo</title>',h,count=1)
    h=h.replace("club:{t:()=>IS_CLIENT?'Club RAVE':'Club de clientes'","club:{t:()=>'Club Bacano'",1)
    for o,n in [('Club RAVE','Club Bacano'),('RAVE Club','Bacano Club'),('que RAVE guarde','que Bacano guarde'),
                ('Almacén y Licorería RAVE, Urquiza 1052, Salta, Argentina. Contacto: WhatsApp 387 4574892.','Bacano Show Room · Barber Shop (demo de evaluación, datos de ejemplo).'),
                ('Almacén y Licorería RAVE','Bacano Barber Shop'),('Almacén y Licorería · Salta','Show Room · Barber Shop · Salta')]:
        h=h.replace(o,n)
    old='Usuarios de prueba: ADMIN · 1234 / Supervisor · 1111 / Mostrador · 0000${S.users.some(u=>u.role===\'empleado\'&&u.pin===\'2222\')?\' / Empleado (portal) · 2222\':\'\'}'
    assert old in h,'texto de usuarios de prueba no encontrado'
    h=h.replace(old,'Usuarios de prueba: Administrador 1111 · Julián, encargado Centro 2222 · Lucas, encargado Norte 3333 · Tomás, barbero 4444 · Recepción Centro 0000 · Recepción Norte 5555 · Portal del empleado 7777',1)
    # tema propio de este sitio (los repositorios comparten el origen raveholding.github.io)
    h=h.replace("localStorage.getItem('rave.theme')","localStorage.getItem('rave.theme.bacano')",1).replace("localStorage.setItem('rave.theme',n)","localStorage.setItem('rave.theme.bacano',n)",1)
    assert "rave.theme.bacano" in h
    h=h.replace('</style>',BC_CSS+'\n</style>',1)
    # página pública propia
    i=h.find('const PUB_DOC="');assert i>=0
    k=i+len('const PUB_DOC=');e=k+1
    while h[e]!='"':
        e+=2 if h[e]=='\\' else 1
    e+=1
    doc=open(os.path.join(HERE,'p11-pub-barber.html'),encoding='utf8').read().replace('__LOGO__',menu)
    h=h[:k]+json.dumps(doc,ensure_ascii=False).replace('</','<\\/')+h[e:]
    # V27.7 · demo genérica de Vincular Business: sin la marca, direcciones ni teléfonos de un cliente real (sólo textos visibles)
    for o,n in [('Bacano Show Room · Barber Shop','Mi Barbería · Barbería y estética'),('SHOW ROOM · BARBER SHOP','BARBERÍA · ESTÉTICA'),('Show Room · Barber Shop','Barbería y estética'),
                ('Bacano Pass','Pase Mi Barbería'),('Bacano Barber Shop','Mi Barbería'),('BACANO10','PRIMERA10'),('BACANO','MI BARBERÍA'),('Bacano','Mi Barbería'),
                ('bacano-liquidacion','liquidacion-barberos'),('Balcarce 480','Av. Ejemplo 123'),('Av. Bolivia 3150','Calle Ejemplo 456'),
                ('5493874215480','5493870000001'),('5493874393150','5493870000002')]:
        h=h.replace(o,n)
    return h
