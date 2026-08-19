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

  const text = pedidoTexto(pedido, clienteEmail);

  return Response.json({
    ok: true,
    total: pedido.total,
    mailto: pedidoMailto(pedidosEmail, pedido, clienteEmail),
    envio: {
      subject: `Nuevo pedido · ${pedido.nombre} · ${formatEuro(pedido.total)}`,
      from_name: pedido.nombre,
      email: clienteEmail || pedidosEmail,
      message: text,
    },
  });
};
