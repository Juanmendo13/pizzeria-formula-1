export const prerender = false;

import type { APIRoute } from 'astro';
import { formatEuro } from '../../lib/menu';
import {
  parsePedidoBody,
  pedidoHtml,
  pedidoMailto,
  pedidoTexto,
  resolverPedido,
} from '../../lib/pedido';

function env(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  return fromMeta;
}

function leerErrorResend(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const data = payload as Record<string, unknown>;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object') {
    const nested = data.error as Record<string, unknown>;
    if (typeof nested.message === 'string') return nested.message;
  }
  return '';
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
  const web3Key = env('WEB3FORMS_ACCESS_KEY');

  if (!pedidosEmail) {
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
  const mailto = pedidoMailto(pedidosEmail, pedido, clienteEmail);

  try {
    if (web3Key) {
      const web3 = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3Key,
          subject,
          from_name: pedido.nombre,
          email: clienteEmail || pedidosEmail,
          message: text,
        }),
      });
      const web3Payload = (await web3.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };
      if (web3.ok && web3Payload.success) {
        return Response.json({ ok: true, total: pedido.total });
      }
    }

    if (resendKey) {
      const resend = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'beth.t@example.com',
          to: [pedidosEmail],
          subject,
          html,
          text,
        }),
      });
      const resendPayload = await resend.json().catch(() => ({}));
      if (resend.ok) {
        return Response.json({ ok: true, total: pedido.total });
      }

      const detail = leerErrorResend(resendPayload);
      return Response.json(
        {
          error:
            detail ||
            'Resend no pudo enviar. Usa el botón de correo o configura Web3Forms.',
          mailto,
        },
        { status: 502 },
      );
    }

    return Response.json(
      {
        error: 'No hay servicio de correo configurado. Envía el pedido con tu aplicación de correo.',
        mailto,
      },
      { status: 502 },
    );
  } catch {
    return Response.json(
      {
        error: 'No se pudo conectar con el correo. Envía el pedido con tu aplicación de correo.',
        mailto,
      },
      { status: 502 },
    );
  }
};
