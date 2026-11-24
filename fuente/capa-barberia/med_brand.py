"""V27.33 · Marca de la demo VB-CentrodeSalud (se aplica después de bc_brand sobre el mismo motor de turnos).
Colores clínicos, logo propio, título, tema y nombres. Los textos del rubro los cambia p11h-salud.js en vivo."""
import re,base64
SVG='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" rx="70" fill="#0e7490"/><path d="M130 70h60v60h60v60h-60v60h-60v-60H70v-60h60z" fill="#ffffff"/><circle cx="160" cy="160" r="22" fill="#0e7490"/></svg>'
TK='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#ffffff"/><path d="M40 50h30v30h30v30H70v30H40v-30H10V80h30z" fill="#000"/><text x="120" y="98" font-family="Arial" font-size="30" font-weight="700" fill="#000">CENTRO DE SALUD</text></svg>'
def uri(s):return 'data:image/svg+xml;base64,'+base64.b64encode(s.encode()).decode()
def brand(h):
    h=re.sub(r'const LOGO_MENU="[^"]*"','const LOGO_MENU="%s"'%uri(SVG),h,count=1)
    h=re.sub(r'const LOGO_TICKET="[^"]*"','const LOGO_TICKET="%s"'%uri(TK),h,count=1)
    h=re.sub(r'<link rel="icon" href="[^"]*"','<link rel="icon" href="%s"'%uri(SVG),h,count=1)
    h=h.replace('--gold:#d3263a;','--gold:#0e7490;',1).replace('--gold2:#a81d2e;','--gold2:#0b5f76;',1)
    h=h.replace("localStorage.getItem('rave.theme.bacano')","localStorage.getItem('rave.theme.salud')",1).replace("localStorage.setItem('rave.theme.bacano',n)","localStorage.setItem('rave.theme.salud',n)",1)
    h=re.sub(r'<title>[^<]*</title>','<title>Mi Centro de Salud · Sistema VB para consultorios y clínicas · demo</title>',h,count=1)
    for o,n in [('Club Mi Barbería','Club de pacientes'),('Pase Mi Barbería','Plan de salud del centro'),('PRIMERA10','PRIMERA10'),
                ('Mi Barbería · Barbería y estética','Mi Centro de Salud'),('BARBERÍA · ESTÉTICA','CENTRO DE SALUD'),('"Mi Barbería"','"Mi Centro de Salud"')]:
        h=h.replace(o,n)
    # el botón dorado pasa a texto blanco sobre el azul petróleo
    h=h.replace('</style>','.btn.gold,.fk.gold,.fk.gold small,html[data-theme=dark] .btn.gold,html[data-theme=dark] .fk.gold,html[data-theme=dark] .fk.gold small{color:#fff!important}#side a.on,html[data-theme=dark] #side a.on{color:#fff!important}\n</style>',1)
    return h
