# mcafee.com.pa — Solutech Panamá

Sitio web del revendedor independiente Solutech Panamá para licencias McAfee.

## Estructura

```
/
├── index.html                 ← Home
├── licencias-1.html           ← Producto: 1 PC
├── licencias-10.html          ← Producto: 10 dispositivos
├── mcafee-panama.html         ← Guía SEO long-tail
├── solicitar-licencia.html    ← Formulario (lead)
├── metodos-de-pago.html       ← Métodos de pago
├── instalacion-remota.html    ← Servicio de instalación
├── contacto.html              ← Contacto
├── sobre-nosotros.html        ← Acerca de Solutech (NUEVO)
├── privacidad.html            ← Política de privacidad (NUEVO)
├── terminos.html              ← Términos y condiciones (NUEVO)
│
├── header.html                ← Include compartido (con aviso reseller)
├── footer.html                ← Include compartido (con disclaimer legal)
│
├── css/styles.css             ← Estilos (paleta Solutech #ff1748 / #e11d48)
├── js/app.js                  ← Includes + dropdown + carrusel
│
├── assets/                    ← Imágenes producto
│
├── api/
│   ├── lead-worker.js         ← Cloudflare Worker (form backend) (NUEVO)
│   └── README.md              ← Cómo desplegar el Worker (NUEVO)
│
├── _redirects                 ← Redirects para Cloudflare Pages / Netlify
├── _headers                   ← Headers de seguridad (NUEVO)
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## Despliegue (Cloudflare Pages)

1. Sube todo el contenido de este ZIP a tu repositorio Git o directamente a Cloudflare Pages.
2. **No subas la carpeta `/api/`** al output del sitio público; el Worker se despliega aparte (ver `api/README.md`).
3. En Cloudflare Pages → Settings → Build:
   - Build command: (vacío — sitio estático)
   - Output directory: `/`
4. Verifica que `_redirects` y `_headers` estén siendo aplicados (visibles en el deployment log).

## Cambios de estilo

Si cambias colores, edítalo en `css/styles.css` línea 2-9 (variables CSS).

Si cambias header o footer, también incrementa la versión en `js/app.js` línea 11:
```js
const VERSION = "v=YYYYMMDD";
```
Esto fuerza recarga del include sin esperar al cache de Cloudflare.

## Configuración del formulario

El formulario en `solicitar-licencia.html` apunta a:
```
https://forms.solutechpanama.com/lead
```

Este endpoint debe estar atendido por un **Cloudflare Worker** desplegado separado. Ver `api/README.md` para el procedimiento completo.

Mientras el Worker no esté desplegado, el formulario fallará. Para no perder leads en la transición:
- Mantén visible el botón de WhatsApp como alternativa (ya está).
- O temporalmente cambia `ENDPOINT` a tu URL de Apps Script (no recomendado largo plazo).

## Cloudflare: configuración mínima

- SSL/TLS: **Full (strict)**
- Always Use HTTPS: ON
- HSTS: ON con preload
- Min TLS Version: 1.2
- Bot Fight Mode: ON
- Security Level: Medium

## Marca y cumplimiento

Este sitio está diseñado como **revendedor independiente** de McAfee, NO como sitio oficial. Cualquier cambio de copy debe pasar por esta revisión:

- ❌ NO usar "distribuidor oficial" / "autorizado" / "representante" / "partner".
- ❌ NO usar el nombre "McAfee Panamá" como nombre comercial propio.
- ❌ NO inventar reseñas, cifras de clientes ni años de operación.
- ✅ SÍ aclarar siempre que es Solutech Panamá quien opera el sitio.
- ✅ SÍ enlazar al sitio oficial mcafee.com cuando se mencione activación, login o cuenta.
- ✅ SÍ mantener visible el disclaimer del footer en todas las páginas.

## Logos y branding

- El header **NO usa el logo de McAfee** como logo del sitio. Usa el monograma "S" de Solutech.
- El logo McAfee solo aparece en imágenes de producto (cajas) y en el contexto del producto.
- La paleta es **#ff1748 / #e11d48** (rojo Solutech), no el rojo McAfee `#d52b1e`.

---

Para dudas técnicas: ver `CHANGELOG.md` para los cambios recientes.
