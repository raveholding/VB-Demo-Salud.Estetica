#!/usr/bin/env python3
"""Aplica la capa de barbería Bacano (perfil `barber`) a una copia de AlmacenRAVE/fuente (Sistema VB V26.65).
Uso: python3 patch_bc.py <dir fuente>   (idempotente: si ya está aplicado, no cambia nada)
Mismo método que las capas de gimnasios y de pizzería: el núcleo del Sistema VB no se reescribe; sólo se agregan
ganchos de una línea (detrás de isBarberBuild) y el módulo p11-barber.js."""
import sys,os,shutil
D=sys.argv[1]
def rd(f):return open(os.path.join(D,f),encoding='utf8').read()
def wr(f,s):open(os.path.join(D,f),'w',encoding='utf8').write(s)
def rep(f,old,new,marker):
    s=rd(f)
    if marker in s:return
    assert s.count(old)==1,(f,old[:80],s.count(old))
    wr(f,s.replace(old,new))
here=os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(D,'assets'),exist_ok=True)
for a,b in [('p11-barber.js','p11-barber.js'),('bacano-logo.jpg','assets/bacano-logo.jpg')]:
    shutil.copy(os.path.join(here,a),os.path.join(D,b))
# 1 · datos iniciales: después de la base de un solo dueño, la base de la barbería
rep('p2-core.js',"if(typeof isSoloBuild==='function'&&isSoloBuild())soloBase(r);",
    "if(typeof isSoloBuild==='function'&&isSoloBuild())soloBase(r);if(typeof isBarberBuild==='function'&&isBarberBuild())barberBase(r);",'barberBase(r)')
# 2 · la barbería usa la base de un solo dueño (sin rubros por persona ni mayorista)
rep('p3o-solo.js',"function isSoloBuild(){return!!(typeof window!=='undefined'&&window.RAVE_BUILD&&(window.RAVE_BUILD.profile==='solo'||window.RAVE_BUILD.profile==='v3'));}",
    "function isSoloBuild(){return!!(typeof window!=='undefined'&&window.RAVE_BUILD&&['solo','v3','barber'].includes(window.RAVE_BUILD.profile));} /* V27.6: la barbería Bacano (barber) usa la base de un solo dueño */",'\'barber\']')
rep('p3o-solo.js'," S.sales=S.sales.filter(s=>s.wch!=='mayorista');}"," S.sales=S.sales.filter(s=>s.wch!=='mayorista');if(typeof barberExtras==='function')barberExtras();}",'barberExtras()')
# 3 · RR. HH.: áreas, horario de lunes a sábado (domingo cerrado) y turnos de cada barbero
rep('p4f-rrhh.js',"const deps=V3?['Comercial','Finanzas','Operaciones','Soporte técnico','Recursos Humanos']:['Ventas','Depósito','Administración'];",
    "const deps=V3?['Comercial','Finanzas','Operaciones','Soporte técnico','Recursos Humanos']:(typeof isBarberBuild==='function'&&isBarberBuild())?['Barbería','Recepción','Administración']:['Ventas','Depósito','Administración'];",'\'Barbería\',\'Recepción\'')
rep('p4f-rrhh.js',"if(w===0||w===6)continue;E.forEach((e,j)=>d.hrShifts.push({id:e.id+':'+day,empId:e.id,day,from:j%2?'13:00':'08:00',to:j%2?'21:00':'16:00'}));",
    "const BB=typeof isBarberBuild==='function'&&isBarberBuild();if(BB?w===0:(w===0||w===6))continue;E.forEach((e,j)=>{if(BB&&e.bcOff&&e.bcOff===w)return;d.hrShifts.push({id:e.id+':'+day,empId:e.id,day,from:BB?(e.bcFrom||'10:00'):(j%2?'13:00':'08:00'),to:BB?(e.bcTo||'19:00'):(j%2?'21:00':'16:00')});});",'e.bcFrom||')
# 4 · los servicios no tienen stock: no se descuentan ni se exigen al cobrar
rep('p3b-pos.js',"for(const pid in need){const p=prod(pid);if(!p)return{err:'Producto no disponible.'};if(!canOver(p)&&need[pid]>p.stock+1e-9)",
    "for(const pid in need){const p=prod(pid);if(!p)return{err:'Producto no disponible.'};if(p.svc)continue;if(!canOver(p)&&need[pid]>p.stock+1e-9)",'if(p.svc)continue;if(!canOver')
rep('p3b-pos.js',"const neg=[];for(const pid in need){const p=prod(pid);p.stock=",
    "const neg=[];for(const pid in need){const p=prod(pid);if(p.svc)continue;p.stock=",'if(p.svc)continue;p.stock=')
# 4b · en la grilla de Vender un servicio muestra su duración, no un stock
rep('p3b-pos.js',"· <span class=\"${stockOf(p)<0?'negs':''}\">stock ${stockTxt(p)}</span></span></button>",
    "${p.svc?' · '+(p.svc.tip?'va 100 % al barbero':p.svc.dur+' min'):`· <span class=\"${stockOf(p)<0?'negs':''}\">stock ${stockTxt(p)}</span>`}</span></button>",'va 100 % al barbero')
# 4c · los servicios no cuentan como «stock bajo» en el Resumen, la campana ni Atención al cliente
for fn,old in [('p2c-ux.js',"p=>p.active&&!p.archived&&stockOf(p)<=5"),('p6j-crm.js',"p=>p.active&&!p.archived&&stockOf(p)<=5"),('p7a-dash.js',"p=>p.active&&!isKit(p)&&p.stock<=5")]:
    t=rd(fn)
    if '/*bcsvc*/' not in t:
        assert old in t,(fn,old)
        wr(fn,t.replace(old,old.replace('p=>p.active&&','p=>/*bcsvc*/!p.svc&&p.active&&')))
# 5 · perfil de compilación
b=rd('build.py')
if "'barber'" not in b:
    b=b.replace("assert V in('demo','cliente','kini','solo','v3')","assert V in('demo','cliente','kini','solo','v3','barber')",1)
    b=b.replace("PROFILE=V if V in('kini','solo','v3') else ''","PROFILE=V if V in('kini','solo','v3','barber') else ''",1)
    b=b.replace("if PROFILE=='v3': pub=os.environ.get('PUBLIC_URL','https://raveholding.github.io/raveV3/')",
      "if PROFILE=='v3': pub=os.environ.get('PUBLIC_URL','https://raveholding.github.io/raveV3/')\n"
      "# V27.6 · barber = Bacano Show Room · Barber Shop (raveholding/Bacano)\n"
      "if PROFILE=='barber': pub=os.environ.get('PUBLIC_URL','https://raveholding.github.io/Bacano/')",1)
    b=b.replace("'v3':'rave-v3-demo-v2'}","'v3':'rave-v3-demo-v2','barber':'rave-bacano-demo-v1'}",1)
    b=b.replace("parts=[p for p in parts if os.path.exists(p)]",
      "parts=[p for p in parts if os.path.exists(p)]\nif PROFILE=='barber': parts.insert(parts.index('p5c-menusec.js'),'p11-barber.js')",1)
    b=b.replace("if (V in ('demo','cliente') and PROFILE not in('kini','solo'))","if (V in ('demo','cliente') and PROFILE not in('kini','solo','barber'))",1)
    b=b.replace("if PROFILE in('solo','v3'): html=solo_brand(html,PROFILE=='v3')",
      "if PROFILE in('solo','v3'): html=solo_brand(html,PROFILE=='v3')\n"
      "if PROFILE=='barber':\n"
      "    sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'capa-barberia'))\n"
      "    import bc_brand\n"
      "    html=bc_brand.brand(html)",1)
    assert b.count("'barber'")>=4 and 'bc_brand.brand' in b
    wr('build.py',b)
# la capa queda también dentro de la fuente (para recompilar desde el repositorio de la demo)
dst=os.path.join(D,'capa-barberia')
if os.path.abspath(dst)!=os.path.abspath(here):
    os.makedirs(dst,exist_ok=True)
    for f in os.listdir(here):
        if os.path.isfile(os.path.join(here,f)):shutil.copy(os.path.join(here,f),os.path.join(dst,f))
    if os.path.isdir(os.path.join(here,'pruebas')):
        shutil.copytree(os.path.join(here,'pruebas'),os.path.join(dst,'pruebas'),dirs_exist_ok=True)
print('capa Bacano aplicada en',D)
