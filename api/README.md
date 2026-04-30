# Cloudflare Worker — endpoint /lead

Este Worker reemplaza al antiguo Apps Script para procesar las solicitudes del formulario.

## ¿Por qué un Worker propio?

- ✅ Validación real de Turnstile en backend (Apps Script no la hacía).
- ✅ Sin depender de Formspree, Apps Script u otros terceros.
- ✅ Rate limiting nativo por IP (5 envíos/hora).
- ✅ Honeypot + filtros antispam.
- ✅ Detrás del propio Cloudflare donde ya está el sitio.
- ✅ Persistencia opcional en KV para no perder leads si el email falla.

## Despliegue paso a paso

### 1. Crear el Worker

1. Entra a `dash.cloudflare.com` → **Workers & Pages** → **Create application** → **Create Worker**.
2. Nombre sugerido: `solutech-lead-worker`.
3. Reemplaza el código por el contenido de `lead-worker.js`.
4. **Deploy**.

### 2. Subdominio personalizado

Importante: usa un subdominio bajo **solutechpanama.com**, NO bajo mcafee.com.pa. Refuerza la separación de identidades.

1. En el Worker → **Settings** → **Triggers** → **Custom Domains** → **Add Custom Domain**.
2. Ingresa: `forms.solutechpanama.com`.
3. Cloudflare crea el registro DNS automáticamente si solutechpanama.com está en tu cuenta.

### 3. Variables de entorno

En el Worker → **Settings** → **Variables and Secrets**:

| Nombre | Tipo | Valor |
|---|---|---|
| `TURNSTILE_SECRET` | Secret | Secret key de tu site Turnstile (la consigues en `dash.cloudflare.com` → Turnstile → tu site → Settings) |
| `RESEND_API_KEY` | Secret | API key de Resend (resend.com) — gratis hasta 3000 emails/mes |
| `NOTIFY_EMAIL` | Plain text | `licencias@solutechpanama.com` |
| `ALLOWED_ORIGIN` | Plain text | `https://mcafee.com.pa` |

Opcionales (recomendados):

| `TELEGRAM_BOT_TOKEN` | Secret | Token de @BotFather si quieres notificación instantánea |
| `TELEGRAM_CHAT_ID` | Plain text | Tu chat ID (obtenlo escribiendo a tu bot y consultando `getUpdates`) |

### 4. Binding KV (opcional pero recomendado)

Permite rate-limiting y guarda histórico de leads.

1. **Workers & Pages** → **KV** → **Create namespace** → nombre: `LEADS`.
2. Vuelve al Worker → **Settings** → **Bindings** → **Add** → **KV Namespace**.
   - Variable name: `LEADS_KV`
   - KV namespace: `LEADS`

### 5. Configurar Resend (servicio de email)

1. Cuenta gratis en `resend.com` (3000 emails/mes gratis).
2. Verifica el dominio `solutechpanama.com` agregando los registros DNS que indican.
3. Crea API key → cópiala como `RESEND_API_KEY`.

**Alternativas a Resend:** Mailchannels (gratis para Workers), Postmark, SendGrid, Mailgun. Solo cambia la función `sendEmail()` en el Worker.

### 6. Probar el formulario

Abre `https://mcafee.com.pa/solicitar-licencia.html`, llena el form y envía.

- Si todo está bien: ves el mensaje de éxito y llega un email a `licencias@solutechpanama.com`.
- Si Turnstile falla: aparece error visible en el formulario.
- Si excedes rate limit: HTTP 429.

### 7. Test manual con curl

```bash
curl -X POST https://forms.solutechpanama.com/lead \
  -H "Content-Type: application/json" \
  -H "Origin: https://mcafee.com.pa" \
  -d '{
    "nombre":"Test User",
    "correo":"test@example.com",
    "telefono":"+50760000000",
    "tipo":"1 PC",
    "mensaje":"Prueba",
    "turnstileToken":"XXXX.DUMMY.TOKEN.XXXX",
    "page":"/solicitar-licencia.html"
  }'
```

(Devolverá `turnstile_failed` con un token dummy — comportamiento correcto.)

## Costos estimados

- Cloudflare Workers: 100 000 requests/día gratis.
- Cloudflare KV: 100 000 reads/día gratis.
- Cloudflare Turnstile: gratis ilimitado.
- Resend: 3 000 emails/mes gratis.

Para 15 leads/mes este stack es **gratis al 100%**.

## Seguridad

- ✅ Turnstile validado en backend (no solo cliente).
- ✅ Origin check.
- ✅ Honeypot.
- ✅ Rate limit por IP.
- ✅ Validación estricta de campos.
- ✅ Filtros antispam por contenido.
- ✅ Sin almacenamiento de datos de tarjeta.
- ✅ HTTPS forzado por Cloudflare.

## Si el Worker NO está aún desplegado

Mientras tanto, puedes seguir usando Apps Script. Solo cambia en `solicitar-licencia.html` la línea:

```js
const ENDPOINT = "https://forms.solutechpanama.com/lead";
```

Por el endpoint del Apps Script. Pero migra al Worker lo antes posible para tener validación real de Turnstile.
