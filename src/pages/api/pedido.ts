export const prerender = false;

import type { APIRoute } from 'astro';
import { formatEuro } from '../../lib/menu';
import { parsePedidoBody, pedidoHtml, pedidoTexto, resolverPedido } from '../../lib/pedido';

const FROM = 'Pizzeria Formula 1 <beth.t@example.com>';

function env(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  return fromMeta;
}

function mensajeEnvio(errorText: string): string {
  const lower = errorText.toLowerCase();
  if (lower.includes('own email address') || lower.includes('verify a domain')) {
    return 'Resend solo envía a la cuenta con la que te registraste. Entra en resend.com con pizzeriaformula1@outlook.es (Sign up / Google), no con otra cuenta.';
  }
  if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('invalid')) {
    return 'La clave de Resend no es válida. Crea una API key nueva en resend.com/api-keys.';
  }
  return errorText || 'No se pudo enviar el pedido. Inténtalo de nuevo.';
}

export const POST: APIRoute = async ({ request, locals }) => {
  let signedIn = false;
  let clienteEmail: string | undefined;

  try {
    const auth = locals.auth ? await Promise.resolve(locals.auth()) : undefined;
    signedIn = Boolean(auth?.userId);
    if (signedIn && locals.currentUser) {
      const user = await locals.currentUser();
      clienteEmail =
        user?.primaryEmailAddress?.emailAddress ??
        user?.emailAddresses?.[0]?.emailAddress ??
        undefined;
    }
  } catch {
    signedIn = false;
  }

  if (!signedIn) {
    return Response.json({ error: 'Debes iniciar sesión para enviar el pedido.' }, { status: 401 });
  }

  const pedidosEmail = env('PEDIDOS_EMAIL');
  const resendKey = env('RESEND_API_KEY');

  if (!pedidosEmail || !resendKey) {
    return Response.json(
      { error: 'El envío de pedidos no está configurado todavía.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const parsed = parsePedidoBody(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const pedido = resolverPedido(parsed);
  if ('error' in pedido) {
    return Response.json({ error: pedido.error }, { status: 400 });
  }

  const subject = `Nuevo pedido · ${pedido.nombre} · ${formatEuro(pedido.total)}`;
  const html = pedidoHtml(pedido, clienteEmail);
  const text = pedidoTexto(pedido, clienteEmail);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [pedidosEmail],
      ...(clienteEmail ? { reply_to: clienteEmail } : {}),
      subject,
      html,
      text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    error?: string;
    id?: string;
  };

  if (!response.ok) {
    const detail = payload.message || payload.error || `Error ${response.status}`;
    return Response.json({ error: mensajeEnvio(detail) }, { status: 502 });
  }

  if (clienteEmail && clienteEmail.toLowerCase() === pedidosEmail.toLowerCase()) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [clienteEmail],
        subject: `Hemos recibido tu pedido · ${formatEuro(pedido.total)}`,
        html: `<p>Gracias. Hemos enviado tu pedido a Pizzería Fórmula 1.</p>${html}`,
        text: `Gracias. Hemos enviado tu pedido a Pizzería Fórmula 1.\n\n${text}`,
      }),
    });
  }

  return Response.json({ ok: true, total: pedido.total, id: payload.id });
};
