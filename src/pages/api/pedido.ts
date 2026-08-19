export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { formatEuro } from '../../lib/menu';
import { parsePedidoBody, pedidoHtml, pedidoTexto, resolverPedido } from '../../lib/pedido';

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

  const pedidosEmail = import.meta.env.PEDIDOS_EMAIL;
  const resendKey = import.meta.env.RESEND_API_KEY;
  const fromEmail = import.meta.env.RESEND_FROM || 'Pizzería Fórmula 1 <beth.t@example.com>';

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

  const resend = new Resend(resendKey);
  const subject = `Nuevo pedido · ${pedido.nombre} · ${formatEuro(pedido.total)}`;
  const html = pedidoHtml(pedido, clienteEmail);
  const text = pedidoTexto(pedido, clienteEmail);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: pedidosEmail,
    ...(clienteEmail ? { replyTo: clienteEmail } : {}),
    subject,
    html,
    text,
  });

  if (error) {
    return Response.json({ error: 'No se pudo enviar el pedido. Inténtalo de nuevo.' }, { status: 502 });
  }

  if (clienteEmail) {
    await resend.emails.send({
      from: fromEmail,
      to: clienteEmail,
      subject: `Hemos recibido tu pedido · ${formatEuro(pedido.total)}`,
      html: `<p>Gracias. Hemos enviado tu pedido a Pizzería Fórmula 1.</p>${html}`,
      text: `Gracias. Hemos enviado tu pedido a Pizzería Fórmula 1.\n\n${text}`,
    });
  }

  return Response.json({ ok: true, total: pedido.total });
};
