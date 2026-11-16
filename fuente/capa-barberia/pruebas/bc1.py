# Prueba de la capa Bacano: servir el index.html en http://127.0.0.1:8765/ (python3 -m http.server 8765) y correr: python3 bc1.py
# Recorre: turnero web 4 pasos, alta al Club, pedido de productos, recepción, cobro de un turno con propina y producto, barbero y encargado.
from playwright.sync_api import sync_playwright
import datetime
B='http://127.0.0.1:8765/'
errs=[]
def ok(c,m):print(('OK   ' if c else 'FALLA ')+m)
T0=int(datetime.datetime.now().replace(hour=15,minute=7,second=0).timestamp()*1000)
init="(()=>{const s=Date.now();window.__now=()=>%d+(Date.now()-s);})();"%T0
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-proxy-server'])
    ctx=b.new_context(viewport={'width':1366,'height':900});ctx.add_init_script(init)
    pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append('P '+str(e)[:400]));pg.on('console',lambda m:errs.append('C '+m.text[:300]) if m.type=='error' else None)
    pg.goto(B);pg.wait_for_timeout(2500)
    fr=pg.frame_locator('#pubframe')
    # turnero web: 4 pasos
    fr.locator('.hero [data-a=book]').click();fr.locator('[data-a=bsvc][data-id=sv-fade]').click();fr.locator('[data-a=bnext]').click()
    fr.locator('[data-a=bbr][data-id=norte]').click();fr.locator('[data-a=bbarb][data-id=b6]').click();fr.locator('[data-a=bnext]').click()
    fr.locator('.days button').nth(1).click();pg.wait_for_timeout(300);n=fr.locator('.slots button').count();ok(n>0,'hay horarios libres hoy con Facundo (%d)'%n)
    pg.screenshot(path='s_book3.png')
    fr.locator('.slots button').first.click();fr.locator('[data-a=bnext]').click();pg.wait_for_timeout(400)
    fr.locator('#bk-n').fill('Pablo Prueba');fr.locator('#bk-w').fill('387 555 1234');fr.locator('[data-a=bnext]').click();pg.wait_for_timeout(500)
    pg.screenshot(path='s_book_ok.png')
    ok('Turno #' in fr.locator('.dlg').inner_text(),'turno reservado desde la web')
    fr.locator('.dlg [data-a=bclose]').first.click()
    # club
    fr.locator('#cj-n').fill('Ramiro Socio Nuevo');fr.locator('#cj-w').fill('3874990011');fr.locator('#cj-b').fill('1990-04-12');fr.locator('[data-a=cjoin]').click();pg.wait_for_timeout(2200)
    ok('socio' in fr.locator('#cbox').inner_text().lower(),'alta al Club Bacano y tarjeta: '+fr.locator('#cbox').inner_text()[:80].replace('\n',' '))
    # pedido de productos
    fr.locator('#prods [data-a=pq]').first.click();ok(not fr.locator('#pbar').is_hidden(),'carrito de productos')
    # ingreso recepción centro
    pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u5');pg.fill('#lp','0000');pg.click('[data-act=login]');pg.wait_for_timeout(1800)
    ok('bchoy' in pg.url,'recepción entra a Hoy en el local: '+pg.url.split('#')[1])
    pg.screenshot(path='s_hoy_dia.png')
    t=pg.evaluate("S.bc.turnos.find(t=>t.name==='Pablo Prueba')");ok(t and t['st']=='pend' and t['origin']=='web','el turno web llega a la agenda como a confirmar (%s %s)'%(t and t['day'],t and t['t']))
    # cobrar un turno atendiendo en centro
    tid=pg.evaluate("(S.bc.turnos.find(t=>t.br==='centro'&&t.day===dkey(now())&&t.st==='atend')||S.bc.turnos.find(t=>t.br==='centro'&&t.day===dkey(now())&&t.st==='conf')).id")
    info=pg.evaluate(f"(()=>{{const t=bcTur('{tid}');return [t.name,t.barb,t.cust,t.cust?stampsOf(t.cust):0]}})()");print('turno a cobrar',info)
    pg.evaluate(f"A.bcCobrar({{dataset:{{id:'{tid}'}}}})");pg.wait_for_timeout(400);pg.fill('#bc-tip','1500');pg.click('.mf [data-m=ok]');pg.wait_for_timeout(1500)
    pg.screenshot(path='s_cobro.png')
    # agrego producto y cobro: cierro modal, agrego pomada, cobrar con efectivo justo
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    pg.evaluate("A.padd({dataset:{id:'pr-pomada'}})");pg.wait_for_timeout(300)
    st0=pg.evaluate("prod('pr-pomada').bcs.centro")
    pg.evaluate("A.cobrar()");pg.wait_for_timeout(600)
    j=pg.locator('[data-act=rcvJusto], button:has-text("Justo")').first
    if j.count():j.click()
    pg.wait_for_timeout(300);pg.click('.mf [data-m=ok]');pg.wait_for_timeout(1500)
    s=pg.evaluate("(()=>{const s=S.sales[S.sales.length-1];return {n:s.n,bc:s.bc,total:s.total,cust:s.cust,items:s.items.map(i=>i.pid)}})()");print('venta',s)
    ok(s['bc'] and s['bc']['barb']==info[1] and s['bc']['br']=='centro' and s['bc']['tip']==150000,'la venta guarda barbero, sucursal y propina')
    ok(pg.evaluate(f"bcTur('{tid}').st")=='hecho','el turno queda atendido')
    ok(pg.evaluate("prod('pr-pomada').bcs.centro")==st0-1,'la pomada se descuenta del stock de Centro')
    if info[2]:ok(pg.evaluate(f"stampsOf('{info[2]}')")==info[3]+1,'suma un sello al socio')
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    # transferencia
    pg.evaluate("location.hash='#panel/bcstock'");pg.wait_for_timeout(600)
    for scn in ['bcagenda','bcbarb','bcrank','bcmkt','inicio']:
        pg.evaluate(f"location.hash='#panel/{scn}'");pg.wait_for_timeout(800);pg.screenshot(path=f's2_{scn}.png')
    # barbero
    pg.keyboard.press('Escape');pg.evaluate("A.logout&&A.logout()");pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u4');pg.fill('#lp','4444');pg.click('[data-act=login]');pg.wait_for_timeout(1800)
    ok('bcagenda' in pg.url,'el barbero entra a su agenda');pg.screenshot(path='s_barbero.png')
    nav=pg.evaluate("[...document.querySelectorAll('#side a')].map(a=>a.textContent.trim()).join(' | ')");print('menú barbero:',nav)
    pg.evaluate("location.hash='#panel/bcmis'");pg.wait_for_timeout(700);pg.screenshot(path='s_mis.png')
    # encargado norte
    pg.keyboard.press('Escape');pg.evaluate("A.logout&&A.logout()");pg.goto(B+'#acceso');pg.wait_for_selector('#lu');pg.select_option('#lu','u3');pg.fill('#lp','3333');pg.click('[data-act=login]');pg.wait_for_timeout(1800)
    ok(pg.evaluate("bcEquipoBr()")=='norte','el encargado de Norte cobra en la caja de Norte');pg.screenshot(path='s_norte.png')
    pg.evaluate("location.hash='#panel/rrhh'");pg.wait_for_timeout(900);pg.screenshot(path='s_rrhh.png')
    b.close()
print('\n'.join(errs[:30]))
