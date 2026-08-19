import { formatEuro, getProductBySlug, PIZZA_SIZE_LABELS, type PizzaSize } from './menu';

export interface PedidoLineaInput {
  slug: string;
  size?: PizzaSize;
  quantity: number;
}

export interface PedidoDatos {
  nombre: string;
  telefono: string;
  tipo: 'recogida' | 'reparto';
  direccion?: string;
  notas?: string;
  lineas: PedidoLineaInput[];
}

export interface PedidoLineaResuelta {
  nombre: string;
  sizeLabel?: string;
  quantity: number;
  precio: number;
  subtotal: number;
}

export interface PedidoResuelto {
  nombre: string;
  telefono: string;
  tipo: 'recogida' | 'reparto';
  direccion?: string;
  notas?: string;
  lineas: PedidoLineaResuelta[];
  total: number;
}

const SIZES: PizzaSize[] = ['pequeña', 'mediana', 'familiar'];

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parsePedidoBody(body: unknown): PedidoDatos | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Pedido inválido.' };
  }

  const data = body as Record<string, unknown>;
  const nombre = asString(data.nombre);
  const telefono = asString(data.telefono);
  const tipo = asString(data.tipo);
  const direccion = asString(data.direccion);
  const notas = asString(data.notas);
  const lineasRaw = data.lineas;

  if (nombre.length < 2 || nombre.length > 80) {
    return { error: 'Indica tu nombre.' };
  }

  const digits = telefono.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) {
    return { error: 'Indica un teléfono válido.' };
  }

  if (tipo !== 'recogida' && tipo !== 'reparto') {
    return { error: 'Elige recogida o reparto.' };
  }

  if (tipo === 'reparto' && direccion.length < 5) {
    return { error: 'Indica la dirección de entrega.' };
  }

  if (!Array.isArray(lineasRaw) || lineasRaw.length === 0) {
    return { error: 'El carrito está vacío.' };
  }

  if (lineasRaw.length > 40) {
    return { error: 'Demasiados productos en el pedido.' };
  }

  const lineas: PedidoLineaInput[] = [];

  for (const linea of lineasRaw) {
    if (!linea || typeof linea !== 'object') {
      return { error: 'Hay un producto inválido en el carrito.' };
    }

    const item = linea as Record<string, unknown>;
    const slug = asString(item.slug);
    const quantity = Number(item.quantity);
    const size = asString(item.size) as PizzaSize | '';

    if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return { error: 'Hay un producto inválido en el carrito.' };
    }

    if (size && !SIZES.includes(size)) {
      return { error: 'Hay un tamaño de pizza inválido.' };
    }

    lineas.push({
      slug,
      quantity,
      ...(size ? { size } : {}),
    });
  }

  return {
    nombre,
    telefono,
    tipo,
    ...(tipo === 'reparto' ? { direccion } : {}),
    ...(notas ? { notas: notas.slice(0, 400) } : {}),
    lineas,
  };
}

export function resolverPedido(datos: PedidoDatos): PedidoResuelto | { error: string } {
  const lineas: PedidoLineaResuelta[] = [];

  for (const linea of datos.lineas) {
    const product = getProductBySlug(linea.slug);
    if (!product) {
      return { error: 'Un producto del carrito ya no está en la carta.' };
    }

    if (product.type === 'pizza') {
      if (!linea.size || !product.precios?.[linea.size]) {
        return { error: `Elige tamaño para ${product.nombre}.` };
      }

      const precio = product.precios[linea.size];
      lineas.push({
        nombre: product.nombre,
        sizeLabel: PIZZA_SIZE_LABELS[linea.size],
        quantity: linea.quantity,
        precio,
        subtotal: precio * linea.quantity,
      });
      continue;
    }

    if (product.precioNumero === undefined) {
      return { error: `No hay precio para ${product.nombre}.` };
    }

    lineas.push({
      nombre: product.nombre,
      quantity: linea.quantity,
      precio: product.precioNumero,
      subtotal: product.precioNumero * linea.quantity,
    });
  }

  const total = lineas.reduce((sum, linea) => sum + linea.subtotal, 0);

  return {
    nombre: datos.nombre,
    telefono: datos.telefono,
    tipo: datos.tipo,
    direccion: datos.direccion,
    notas: datos.notas,
    lineas,
    total,
  };
}

export function pedidoHtml(pedido: PedidoResuelto, clienteEmail?: string): string {
  const filas = pedido.lineas
    .map(
      (linea) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(linea.nombre)}
            ${linea.sizeLabel ? `<br><span style="color:#666;font-size:12px;">${escapeHtml(linea.sizeLabel)}</span>` : ''}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${linea.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatEuro(linea.subtotal)}</td>
        </tr>
      `,
    )
    .join('');

  const tipoLabel = pedido.tipo === 'reparto' ? 'Reparto a domicilio' : 'Recogida en local';

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#111;">
      <h1 style="font-size:20px;margin:0 0 16px;">Nuevo pedido · Pizzería Fórmula 1</h1>
      <p style="margin:0 0 8px;"><strong>Cliente:</strong> ${escapeHtml(pedido.nombre)}</p>
      <p style="margin:0 0 8px;"><strong>Teléfono:</strong> ${escapeHtml(pedido.telefono)}</p>
      ${clienteEmail ? `<p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(clienteEmail)}</p>` : ''}
      <p style="margin:0 0 8px;"><strong>Tipo:</strong> ${tipoLabel}</p>
      ${pedido.direccion ? `<p style="margin:0 0 8px;"><strong>Dirección:</strong> ${escapeHtml(pedido.direccion)}</p>` : ''}
      ${pedido.notas ? `<p style="margin:0 0 16px;"><strong>Notas:</strong> ${escapeHtml(pedido.notas)}</p>` : '<p style="margin:0 0 16px;"></p>'}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:2px solid #111;padding-bottom:8px;">Producto</th>
            <th style="text-align:center;border-bottom:2px solid #111;padding-bottom:8px;">Ud.</th>
            <th style="text-align:right;border-bottom:2px solid #111;padding-bottom:8px;">Importe</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <p style="font-size:18px;font-weight:bold;margin:16px 0 0;text-align:right;">Total: ${formatEuro(pedido.total)}</p>
    </div>
  `;
}

export function pedidoTexto(pedido: PedidoResuelto, clienteEmail?: string): string {
  const tipoLabel = pedido.tipo === 'reparto' ? 'Reparto a domicilio' : 'Recogida en local';
  const lineas = pedido.lineas
    .map((linea) => {
      const size = linea.sizeLabel ? ` (${linea.sizeLabel})` : '';
      return `- ${linea.nombre}${size} x${linea.quantity} = ${formatEuro(linea.subtotal)}`;
    })
    .join('\n');

  return [
    'Nuevo pedido · Pizzería Fórmula 1',
    `Cliente: ${pedido.nombre}`,
    `Teléfono: ${pedido.telefono}`,
    clienteEmail ? `Email: ${clienteEmail}` : '',
    `Tipo: ${tipoLabel}`,
    pedido.direccion ? `Dirección: ${pedido.direccion}` : '',
    pedido.notas ? `Notas: ${pedido.notas}` : '',
    '',
    lineas,
    '',
    `Total: ${formatEuro(pedido.total)}`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function pedidoMailto(destino: string, pedido: PedidoResuelto, clienteEmail?: string): string {
  const subject = `Nuevo pedido · ${pedido.nombre} · ${formatEuro(pedido.total)}`;
  const body = pedidoTexto(pedido, clienteEmail);
  return `mailto:${destino}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
