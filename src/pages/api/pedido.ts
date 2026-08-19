export const prerender = false;

import type { APIRoute } from 'astro';
import { formatEuro } from '../../lib/menu';
import { parsePedidoBody, pedidoMailto, pedidoTexto, resolverPedido } from '../../lib/pedido';

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
  const web3Key = env('WEB3FORMS_ACCESS_KEY');

  if (!pedidosEmail) {
    return Response.json(
      { error: 'Falta PEDIDOS_EMAIL. El destino debe ser pizzeriaformula1@outlook.es.' },
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
  const mailto = pedidoMailto(pedidosEmail, pedido, clienteEmail);

  if (!web3Key) {
    return Response.json(
      {
        error:
          'Falta la clave de Web3Forms. Entra en https://web3forms.com, pon pizzeriaformula1@outlook.es, copia el Access Key y pégalo en el chat.',
        mailto,
      },
      { status: 503 },
    );
  }

  try {
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

    return Response.json(
      {
        error: web3Payload.message || 'Web3Forms no pudo enviar el pedido.',
        mailto,
      },
      { status: 502 },
    );
  } catch {
    return Response.json(
      {
        error: 'No se pudo conectar con Web3Forms.',
        mailto,
      },
      { status: 502 },
    );
  }
};
