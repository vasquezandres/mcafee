# CHANGELOG — Versión post-auditoría

## 2026-04-29 — Cambios críticos anti-phishing y anti-suplantación

### 🚨 Cambios críticos de identidad / marca

- **Schema Organization** ya NO declara `"name": "McAfee Panamá"` en ningún archivo. Ahora es siempre `"name": "Solutech Panamá"` con `alternateName: "Licencias McAfee en Panamá — Solutech"`.
- **site.webmanifest**: nombre cambiado de `McAfee Panamá` → `Solutech Panamá — Licencias McAfee`.
- **Header**: removido el logo `mcafee-logo.webp` del header. Ahora muestra un monograma "S" de Solutech con la paleta corporativa.
- **Theme color**: cambiado de `#d52b1e` (rojo McAfee) → `#ff1748` (rojo Solutech).
- **Aviso reseller superior**: barra amarilla visible en TODAS las páginas que dice claramente "Sitio operado por Solutech Panamá — revendedor independiente. No es el sitio oficial de McAfee".
- **Disclaimer del footer ampliado**: ahora reconoce expresamente la marca de McAfee LLC, declara que NO somos distribuidor oficial autorizado, y enlaza al sitio oficial.

### 🟡 Coherencia de contenido

- Eliminada la contradicción `solutech.com.pa` en FAQ del index (decía que se compraba en otro dominio).
- Eliminadas FAQ duplicadas (había 2 idénticas y 3 sobre "originales").
- FAQPage schema ahora coincide exactamente con las preguntas visibles.
- Removida la afirmación falsa "10 años de experiencia" (la empresa Solutech tiene 12+ años pero el sitio mcafee.com.pa tiene 5 — ahora dice "Solutech Panamá desde hace más de 12 años").
- Removidos los testimonios genéricos de la home (8 reseñas inventadas) — sustituidos por bloques de propuesta de valor verificables.
- Email de contacto cambiado de `licencias@mcafee.com.pa` → `licencias@solutechpanama.com`.

### ✅ Schema enriquecido (SEO + claridad reseller)

- Schema `Product` ahora tiene `manufacturer: McAfee, LLC` y `offers.seller: Solutech Panamá` separados — Google ve claramente que tú no eres el fabricante.
- Schema `Organization` migrado a `LocalBusiness` con dirección física, horarios, teléfono y `sameAs` a redes sociales.
- Agregados schemas: `AboutPage` (sobre-nosotros), `ContactPage` (contacto), `Service` (instalación remota).

### 🆕 Páginas nuevas obligatorias

- `/sobre-nosotros.html` — datos reales de Solutech, separación de marca, hechos verificables.
- `/privacidad.html` — Política de Privacidad alineada con Ley 81/2019 de Panamá.
- `/terminos.html` — Términos y Condiciones legales completos.

### 🛒 Conversión

- CTAs actualizados con **monto visible** ("Pagar B/. 79 con PayPal", "Coordinar por WhatsApp · B/. 79").
- Mensajes de WhatsApp pre-llenados que ya incluyen el monto y la pregunta "¿cómo pago?", reduciendo fricción.
- Stack vertical de CTAs (PayPal + WhatsApp) en páginas de producto, no botón único.
- Sección nueva "Tienda barata vs. Solutech": comparativa honesta para justificar el precio.
- Sección nueva "Por qué nuestros clientes pagan un poco más": foco en el servicio post-venta.
- "Vendido por Solutech Panamá" como badge sobre las imágenes de cajas.

### 🔒 Seguridad

- `_headers` con CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy.
- Formulario migrado a Cloudflare Worker propio:
  - Validación real de Turnstile en backend.
  - Rate limiting por IP.
  - Honeypot.
  - Filtros antispam.
- Eliminada dependencia de Google Apps Script.
- Endpoint del form bajo `forms.solutechpanama.com` (NO bajo mcafee.com.pa) para reforzar separación de identidades.

### 📊 SEO

- Titles y meta descriptions reescritas con keyword + diferencial + marca:
  - Antes: "McAfee en Panamá"
  - Después: "McAfee en Panamá: Guía Completa para Comprar tu Licencia | Solutech"
- H1 incluye contexto: "Licencias McAfee en Panamá con instalación y soporte local"
- `<link rel="canonical">` correcto en todas las páginas.
- `<meta name="robots" content="index, follow, max-image-preview:large">` añadido para mejor previsualización en SERPs.
- Canonicals corregidos (algunos apuntaban a www. inconsistentemente).
- Sitemap actualizado con nuevas páginas.

### 🎨 Branding

- Paleta unificada en CSS: `--brand: #ff1748` (Solutech primario), `--brand-2: #e11d48` (Solutech secundario).
- Reemplazadas todas las apariciones de `rgba(213,43,30, X)` (rojo McAfee) por `rgba(255,23,72, X)` (rojo Solutech).
- Comentarios CSS sobre "rojo McAfee" actualizados a "rojo Solutech".

### 🧹 Limpieza

- Eliminado el cache busting agresivo en `app.js` (`Date.now()` por request → versión fija incrementable).
- Corregidos canonicales que apuntaban a `www.mcafee.com.pa` (no existe).
- Atributos `width` y `height` añadidos al hero principal para evitar CLS.

---

## ARCHIVOS MODIFICADOS

| Archivo | Cambios |
|---|---|
| `index.html` | Reescrito 100% — nuevo schema, nuevo copy, FAQ limpio, sin reseñas inventadas |
| `licencias-1.html` | Reescrito — nuevos CTAs, schema con seller separado, copy de valor |
| `licencias-10.html` | Reescrito — nuevos CTAs, schema con seller separado, copy de valor |
| `mcafee-panama.html` | Reescrito — guía SEO con preguntas reales, disclaimer reforzado |
| `solicitar-licencia.html` | Reescrito — form apunta a Worker, honeypot, validación cliente, mejor UX |
| `metodos-de-pago.html` | Reescrito — sin "McAfee Panamá" en schema, copy más claro |
| `contacto.html` | Reescrito — schema corregido (Organization = Solutech), datos reales |
| `instalacion-remota.html` | Reescrito — copy más sobrio y claro |
| `header.html` | Logo McAfee removido + monograma Solutech + barra reseller superior |
| `footer.html` | Disclaimer legal robusto + email cambiado + links a privacidad/términos |
| `site.webmanifest` | "name" y "short_name" cambiados a Solutech |
| `sitemap.xml` | Fechas actualizadas + nuevas páginas |
| `robots.txt` | Bloqueo a scrapers SEO de competencia |
| `_redirects` | Redirects extendidos |
| `css/styles.css` | Paleta cambiada + nuevos componentes (badges, cta-stack, value-card, compare-vs) |
| `js/app.js` | Sin cache busting agresivo + soporta múltiples elementos en includes |

## ARCHIVOS NUEVOS

| Archivo | Propósito |
|---|---|
| `sobre-nosotros.html` | Identidad Solutech, separación de marca |
| `privacidad.html` | Cumplimiento Ley 81/2019 PA |
| `terminos.html` | Términos legales |
| `_headers` | Headers de seguridad para Cloudflare Pages |
| `api/lead-worker.js` | Worker de Cloudflare para procesar el formulario |
| `api/README.md` | Guía de despliegue del Worker |
| `README.md` | Guía general del proyecto |
| `CHANGELOG.md` | Este archivo |

## ARCHIVOS NO MODIFICADOS

- Todas las imágenes de `/assets/`
- Todos los favicons / apple-touch-icon
