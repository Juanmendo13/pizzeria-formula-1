# Pizzería Fórmula 1 — Portfolio web

Demo en vivo: **https://pizzeria-formula-1.vercel.app**

Web moderna para un negocio local de hostelería (Tocina, Sevilla). Proyecto real desplegado en Vercel, usable como **portfolio** para mostrar a otros comercios (restauración, copisterías, tiendas, etc.).

## Qué demuestra este proyecto

- **Carta online** con precios reales, imágenes optimizadas y fichas de producto.
- **Carrito de compra** con sesión de usuario (Clerk).
- **Pedidos por correo** al establecimiento (Web3Forms → Outlook del local).
- **Impresión / PDF** de la carta completa.
- **Diseño responsive** (móvil y escritorio), tema oscuro coherente.
- **Rendimiento**: fuentes self-hosted, imágenes con `astro:Image`, caché en Vercel.

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | [Astro 7](https://astro.build) |
| Estilos | Tailwind CSS 4 |
| Auth | [Clerk](https://clerk.com) |
| Email pedidos | [Web3Forms](https://web3forms.com) |
| Deploy | [Vercel](https://vercel.com) |
| Repo | [GitHub](https://github.com/Juanmendo13/pizzeria-formula-1) |

## Funcionalidades principales

1. **Home** — hero, historia del local, carta de pizzas y complementos.
2. **`/producto/[slug]`** — ficha con ingredientes, tamaños y botón añadir al carrito.
3. **`/carrito`** — cantidades, formulario (recogida/reparto) y envío del pedido.
4. **`/imprimir-carta`** — versión para imprimir / PDF (pizzas en varias páginas).
5. **`/sign-in` / `/sign-up`** — login con email o proveedores sociales (Clerk).

## Cómo probarlo en local

```bash
pnpm install
pnpm astro dev
```

Abre http://localhost:4321. Necesitas `.env.local` con las claves de Clerk y Web3Forms (ver `.env.example`).

## Cómo enseñarlo como portfolio

1. Abre la **URL en el móvil** y compárala con la web antigua del cliente.
2. Recorre: carta → producto → carrito → enviar pedido (con sesión iniciada).
3. Menciona que el **estilo se adapta** al sector; lo reutilizable es la estructura, velocidad y funciones (catálogo, contacto, pedidos, login).

## Notas

- Dominio gratuito de Vercel (`.vercel.app`); no requiere dominio de pago.
- Clerk puede mostrar avisos de entorno de desarrollo en modo test; válido para demo.
- Privacidad básica en `/privacidad`.

## Comandos

| Comando | Acción |
|---------|--------|
| `pnpm astro dev` | Servidor local |
| `pnpm astro build` | Build producción |
| `vercel --prod` | Publicar (desde tu máquina) |

---

Proyecto desarrollado como demo / portfolio. Pizzería Fórmula 1 — Tocina, Sevilla.
