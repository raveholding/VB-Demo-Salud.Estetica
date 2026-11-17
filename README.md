# Mi Barbería · Barbería y estética · Sistema VB (demo)

Demo de evaluación del **Sistema Vincular Business V26.65** (la misma base que Almacén RAVE, esqueleto V27.2) con la **capa de barbería** de Mi Barbería (Salta Capital, sucursales Centro y Norte).
Un solo archivo (`index.html`): página pública adelante y panel del equipo en `#acceso`.

**Demo en línea:** https://raveholding.github.io/VB-Demo-Salud.Estetica/

- Página pública con turnero: `/`
- Acceso del equipo: `/#acceso`

| Usuario | Rol | PIN | Qué ve |
|---|---|---|---|
| Administrador | Dueño | 1111 | Todo, las dos sucursales (Resumen, RR. HH., liquidaciones, modelos de trabajo, configuración) |
| Julián Ferreyra | Encargado · Centro | 2222 | Su sucursal: hoy en el local, agenda, caja, barberos y liquidación, ranking, stock, campañas |
| Lucas Medina | Encargado · Norte | 3333 | Ídem, sucursal Norte |
| Tomás Gutiérrez | Barbero · Centro | 4444 | Su agenda, Vender, Club y **Mis números** |
| Recepción Centro · Micaela | Caja | 0000 | Hoy en el local, agenda, caja, Club y campañas de Centro |
| Recepción Norte · Rocío | Caja | 5555 | Ídem, Norte |
| Portal del empleado | Empleado | 7777 | Fichaje, recibos, licencias |

**Es una demo.** Servicios, precios, barberos, clientes, turnos y ventas son de ejemplo y se guardan sólo en el navegador de quien la prueba (*Configuración → Restablecer datos de demostración* vuelve al inicio). La factura ARCA es de demostración (sin validez fiscal).

## Qué cambió respecto de la versión anterior
La demo anterior era una aplicación aparte. Ahora corre **sobre el Sistema VB completo y actualizado**, así que suma todo lo nuevo del núcleo:
- **Diseño V27.2:** barra lateral por secciones con **Vender POS [F1]**, búsqueda global **Ctrl + K**, campana de avisos, avisos con número en el menú, **tema claro/oscuro**, panel «Hoy» en el Resumen y ayuda de una línea en cada pantalla.
- **Gestión de caja completa y multisucursal:** una caja por sucursal (Centro y Norte) más la caja principal del dueño, tablero del turno, pagos mixtos, vuelto, Fiado / Cuenta corriente, recargos por medio de pago, Corte X / Corte Z sellados, historial verificable y traspasos entre cajas.
- **Club Mi Barbería completo:** sellos (cada visita cobrada suma uno, 10 = corte gratis; los productos no suman), niveles por consumo, cumpleaños, monedero, gift cards, cupones (PRIMERA10, VUELVE15, CUMPLE20) y la membresía **Pase Mi Barbería**.
- **Recursos Humanos:** legajos de los 11 integrantes, fichaje por PIN, QR, NFC y geocerca, turnos de lunes a sábado (domingo cerrado), licencias con aprobación, documentos, reclutamiento, portal del empleado.
- **Atención al cliente** (CRM), **compras y proveedores** con cuenta corriente, presupuestos, mermas, importar/exportar y auditoría encadenada.

## Lo propio de la barbería (sección «Barbería»)
- **Hoy en el local:** las sillas en vivo (atendiendo, libre, próximo turno), **Llegó → Empezar → Cobrar** y la **cola de espera** para clientes sin turno.
- **Agenda de turnos:** grilla por día, sucursal y barbero, con estados (a confirmar, confirmado, en el local, atendiendo, atendido, no vino, cancelado), confirmación y recordatorio por WhatsApp, Google Calendar, reprogramación y control de superposición.
- **Turnero web en 4 pasos** (servicios → sucursal y barbero → día y horario libre → datos): el turno entra solo a la agenda como *a confirmar*.
- **Cobro en Vender:** el turno pasa a Vender con sus servicios, la propina y el socio; entra en la caja de la sucursal, guarda quién atendió, deja el turno atendido y suma el sello.
- **Barberos y liquidación:** alquiler de silla (monto fijo mensual) o comisión por corte (% configurable sólo por el administrador); propinas 100 % al barbero, productos 100 % a Mi Barbería; liquidación con pago desde la caja y exportación a Excel.
- **Ranking y trazabilidad:** servicios, facturación, aporte a Mi Barbería, ticket promedio, clientes que vuelven, servicios más pedidos y Centro vs. Norte.
- **Stock por sucursal:** cada venta descuenta de la sucursal que cobró; transferencias, conteos, ingresos e historial; pedido de reposición por proveedor por WhatsApp.
- **Campañas por WhatsApp** que se arman solas: recordatorio de mañana, recuperar inactivos, cumpleaños, a un sello del premio, segunda visita y pedir reseña (sólo a quienes aceptaron mensajes).
- **Página pública:** servicios, equipo, productos con disponibilidad por sucursal (pedido por WhatsApp para retirar), Club Mi Barbería (alta y tarjeta) y sucursales con «Cómo llegar».

## Recorrido sugerido
1. Abrí la página pública y **reservá un turno** con un barbero de Norte.
2. Ingresá como **Recepción Norte (5555)**: el turno aparece en la agenda como *a confirmar*; confirmalo por WhatsApp.
3. En **Hoy en el local** tocá **Cobrar** en una silla ocupada: sumá propina, agregá una pomada en Vender y cobrá con F12.
4. Mirá **Gestión de caja** (Corte X / Z), **Barberos y liquidación**, **Ranking** y **Stock por sucursal**.
5. Ingresá como **Tomás (4444)** para ver la agenda y los números de un barbero.

## Tienda online en la página pública (2026-11-17)

- Chat **«Escribinos»** y **«Mi cuenta»** (contacto por WhatsApp, cómo llegar, redes e instalar la app en el celular), con el mismo kit que la tienda de Almacén RAVE (`fuente/capa-barberia/vb-kit.js`).
- Productos: además de retirar en la sucursal, **envío a domicilio** con la dirección en el pedido de WhatsApp (el costo del envío lo confirma el local).
- Prueba: `fuente/capa-barberia/pruebas/kit1.py <index.html>`.

## Cómo se compila
`fuente/` es la fuente del Sistema VB (Almacén RAVE, V26.65) con la capa ya aplicada. La capa está en `fuente/capa-barberia/` (`patch_bc.py`, `p11-barber.js`, `p11-pub-barber.html`, `bc_brand.py`); para aplicarla a una fuente nueva: `python3 capa-barberia/patch_bc.py <fuente>`.

```
cd fuente && python3 build.py barber ../index.html
```
Prueba en navegador real: `fuente/capa-barberia/pruebas/bc1.py`.

Límites honestos: el aislamiento de datos por sucursal en el servidor está pendiente (en la demo cada usuario ve su sucursal en las pantallas de barbería); textos legales son plantillas [VERIFICAR]; periféricos y NFC sin probar con equipos reales; ARCA real necesita el certificado del comercio.

Desarrollado por **VINCULAR BUSINESS** · Celular (387) 4484132 · https://www.vincularbusiness.com.ar/ · vincularbusiness@gmail.com · *“Tu idea, en buenas manos.”*
