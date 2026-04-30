/**
 * Cloudflare Worker — endpoint /lead para mcafee.com.pa
 *
 * Despliega este Worker en Cloudflare Workers y enrutalo en
 *   https://forms.solutechpanama.com/lead
 * (subdominio recomendado bajo solutechpanama.com, NO bajo mcafee.com.pa).
 *
 * Variables de entorno requeridas (Settings → Variables):
 *   TURNSTILE_SECRET   → Secret key de tu site Turnstile (NO la public)
 *   NOTIFY_EMAIL       → Email destino, ej: licencias@solutechpanama.com
 *   RESEND_API_KEY     → API key de Resend (alternativa: cualquier servicio SMTP)
 *   ALLOWED_ORIGIN     → "https://mcafee.com.pa"
 *
 * Opcional (para integrar con webhook de WhatsApp Business / Telegram):
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID
 *
 * Bindings opcionales (Settings → Bindings):
 *   LEADS_KV (KV Namespace) → para guardar histórico y rate-limiting por IP
 *
 * Despliegue rápido:
 *   1. Crea Worker en dash.cloudflare.com → Workers & Pages → Create
 *   2. Pega este archivo
 *   3. Agrega las variables y bindings indicados
 *   4. Conecta el subdominio forms.solutechpanama.com a este Worker
 */

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hora en segundos
const RATE_LIMIT_MAX = 5;          // máx 5 envíos por IP por hora

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(env, null, 204);
    }

    if (request.method !== "POST") {
      return corsResponse(env, { ok: false, error: "method_not_allowed" }, 405);
    }

    if (url.pathname !== "/lead") {
      return corsResponse(env, { ok: false, error: "not_found" }, 404);
    }

    // Origin check
    const origin = request.headers.get("Origin") || "";
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return corsResponse(env, { ok: false, error: "forbidden_origin" }, 403);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(env, { ok: false, error: "invalid_json" }, 400);
    }

    const { nombre, correo, telefono, tipo, mensaje, turnstileToken, page } = body || {};

    // Validación básica de campos
    if (!nombre || !correo || !telefono || !tipo || !turnstileToken) {
      return corsResponse(env, { ok: false, error: "missing_fields" }, 400);
    }
    if (typeof nombre !== "string" || nombre.length < 3 || nombre.length > 100) {
      return corsResponse(env, { ok: false, error: "invalid_name" }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 120) {
      return corsResponse(env, { ok: false, error: "invalid_email" }, 400);
    }
    if (typeof telefono !== "string" || telefono.length < 6 || telefono.length > 30) {
      return corsResponse(env, { ok: false, error: "invalid_phone" }, 400);
    }
    if (mensaje && (typeof mensaje !== "string" || mensaje.length > 800)) {
      return corsResponse(env, { ok: false, error: "invalid_message" }, 400);
    }

    // Detección simple de spam por contenido
    const blob = `${nombre} ${correo} ${mensaje || ""}`.toLowerCase();
    const spamPatterns = [
      /https?:\/\//i,         // links en mensaje = casi siempre spam
      /\b(viagra|casino|bitcoin|crypto|loan|seo services?)\b/i,
      /\b[a-z0-9]{20,}\b/,    // strings random largos
    ];
    if (spamPatterns.some((rx) => rx.test(blob))) {
      // Descartamos silenciosamente (no informamos al spammer)
      return corsResponse(env, { ok: true, queued: false }, 200);
    }

    // Validación Turnstile (server-side)
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const tsValid = await validateTurnstile(env.TURNSTILE_SECRET, turnstileToken, ip);
    if (!tsValid) {
      return corsResponse(env, { ok: false, error: "turnstile_failed" }, 403);
    }

    // Rate limit por IP (KV)
    if (env.LEADS_KV) {
      const rlKey = `rl:${ip}`;
      const current = parseInt((await env.LEADS_KV.get(rlKey)) || "0", 10);
      if (current >= RATE_LIMIT_MAX) {
        return corsResponse(env, { ok: false, error: "rate_limited" }, 429);
      }
      await env.LEADS_KV.put(rlKey, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW });
    }

    // Construir lead
    const lead = {
      ts: new Date().toISOString(),
      ip,
      ua: request.headers.get("User-Agent") || "",
      nombre, correo, telefono, tipo,
      mensaje: mensaje || "",
      page: page || "",
      country: request.cf?.country || ""
    };

    // Persistir en KV (opcional pero recomendado para no perder leads)
    if (env.LEADS_KV) {
      const id = crypto.randomUUID();
      ctx.waitUntil(
        env.LEADS_KV.put(`lead:${lead.ts}:${id}`, JSON.stringify(lead), { expirationTtl: 60 * 60 * 24 * 365 })
      );
    }

    // Enviar notificaciones en paralelo
    const tasks = [];
    if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
      tasks.push(sendEmail(env, lead));
    }
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      tasks.push(sendTelegram(env, lead));
    }
    ctx.waitUntil(Promise.allSettled(tasks));

    return corsResponse(env, { ok: true }, 200);
  }
};

/* ====== Helpers ====== */

function corsResponse(env, body, status = 200) {
  const allowed = env.ALLOWED_ORIGIN || "https://mcafee.com.pa";
  const headers = {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };
  return new Response(body ? JSON.stringify(body) : "", { status, headers });
}

async function validateTurnstile(secret, token, ip) {
  if (!secret || !token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const data = await r.json();
    return !!data.success;
  } catch {
    return false;
  }
}

async function sendEmail(env, lead) {
  const html = `
    <h2>Nueva solicitud de licencia McAfee</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:system-ui;font-size:14px;">
      <tr><td><strong>Fecha</strong></td><td>${escapeHtml(lead.ts)}</td></tr>
      <tr><td><strong>Nombre</strong></td><td>${escapeHtml(lead.nombre)}</td></tr>
      <tr><td><strong>Correo</strong></td><td><a href="mailto:${escapeHtml(lead.correo)}">${escapeHtml(lead.correo)}</a></td></tr>
      <tr><td><strong>Teléfono</strong></td><td><a href="https://wa.me/${escapeHtml(lead.telefono.replace(/[^0-9]/g, ""))}">${escapeHtml(lead.telefono)}</a></td></tr>
      <tr><td><strong>Licencia</strong></td><td>${escapeHtml(lead.tipo)}</td></tr>
      <tr><td><strong>Mensaje</strong></td><td>${escapeHtml(lead.mensaje).replace(/\n/g, "<br>")}</td></tr>
      <tr><td><strong>Página</strong></td><td>${escapeHtml(lead.page)}</td></tr>
      <tr><td><strong>IP / país</strong></td><td>${escapeHtml(lead.ip)} / ${escapeHtml(lead.country)}</td></tr>
    </table>
  `;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Solutech Leads <leads@solutechpanama.com>",
      to: [env.NOTIFY_EMAIL],
      reply_to: lead.correo,
      subject: `🛡️ Lead McAfee — ${lead.tipo} — ${lead.nombre}`,
      html
    })
  });
}

async function sendTelegram(env, lead) {
  const text =
    `🛡️ *Nuevo lead McAfee*\n\n` +
    `*Nombre:* ${tgEsc(lead.nombre)}\n` +
    `*Correo:* ${tgEsc(lead.correo)}\n` +
    `*WhatsApp:* ${tgEsc(lead.telefono)}\n` +
    `*Plan:* ${tgEsc(lead.tipo)}\n` +
    `*Mensaje:* ${tgEsc(lead.mensaje || "—")}\n`;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    })
  });
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tgEsc(s) {
  return String(s || "").replace(/[_*\[\]()~`>#+\-=|{}.!]/g, (c) => "\\" + c);
}
