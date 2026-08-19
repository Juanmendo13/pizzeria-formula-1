export const prerender = false;

import type { APIRoute } from 'astro';
import { formatEuro } from '../../lib/menu';
import { parsePedidoBody, pedidoTexto, resolverPedido } from '../../lib/pedido';

function env(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  return fromMeta;
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
  const text = pedidoTexto(pedido, clienteEmail);
  const tipoLabel = pedido.tipo === 'reparto' ? 'Reparto a domicilio' : 'Recogida en local';

  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(pedidosEmail)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        Cliente: pedido.nombre,
        Telefono: pedido.telefono,
        Email_cliente: clienteEmail || '',
        Tipo: tipoLabel,
        Direccion: pedido.direccion || '—',
        Notas: pedido.notas || '—',
        Pedido: text,
        Total: formatEuro(pedido.total),
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as {
    success?: string | boolean;
    message?: string;
  };

  const ok =
    response.ok &&
    (payload.success === true || payload.success === 'true' || payload.success === 'True');

  if (!ok) {
    const detail = (payload.message || '').toLowerCase();
    if (detail.includes('confirm') || detail.includes('activate')) {
      return Response.json(
        {
          error:
            'Mira Outlook (y spam): FormSubmit te ha enviado un correo para activar el buzón. Ábrelo, confirma el enlace y vuelve a enviar el pedido.',
        },
        { status: 502 },
      );
    }

    return Response.json(
      { error: payload.message || 'No se pudo enviar el pedido. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, total: pedido.total });
};
