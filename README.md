# Pizzería Fórmula 1

Web demo para un negocio local de hostelería (Tocina, Sevilla). Proyecto desplegado en producción y pensado como **portfolio** para mostrar a otros comercios.

[![Demo en vivo](https://img.shields.io/badge/demo-pizzeria--formula--1.vercel.app-red?style=for-the-badge)](https://pizzeria-formula-1.vercel.app)
[![GitHub](https://img.shields.io/badge/repo-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Juanmendo13/pizzeria-formula-1)

![Vista previa al compartir la web](https://pizzeria-formula-1.vercel.app/og-image.png)

## Enlaces

| | |
|---|---|
| **Web en producción** | https://pizzeria-formula-1.vercel.app |
| **Repositorio** | https://github.com/Juanmendo13/pizzeria-formula-1 |
| **Privacidad** | https://pizzeria-formula-1.vercel.app/privacidad |

## Resumen

Carta digital con precios reales, fichas de producto, carrito con login y envío de pedidos por correo al local. Diseño responsive, tema oscuro coherente y carga optimizada (fuentes e imágenes self-hosted, SSR con Astro en Vercel).

Ideal para enseñar a restaurantes, copisterías u otros negocios locales que necesitan una web moderna sin parecer una plantilla genérica.

## Funcionalidades

- **Carta online** — pizzas (00–10) y complementos con precios pequeña / mediana / familiar.
- **Ficha de producto** — `/producto/[slug]` con ingredientes, tamaños y añadir al carrito.
- **Carrito** — cantidades, total y formulario (recogida o reparto).
- **Login** — registro e inicio de sesión con [Clerk](https://clerk.com) (email + verificación).
- **Pedidos por email** — el carrito envía el pedido a `pizzeriaformula1@outlook.es` vía [Web3Forms](https://web3forms.com).
- **Imprimir carta** — `/imprimir-carta` optimizada para PDF (incluye pizza Texana).
- **Descarga PDF** — enlace a la carta en `/categorias/carta-formula1.pdf`.
- **Open Graph** — preview con imagen al compartir por WhatsApp o redes.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | [Astro 7](https://astro.build) (SSR) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com) |
| Autenticación | [@clerk/astro](https://clerk.com/docs/quickstarts/astro) |
| Pedidos | [Web3Forms](https://web3forms.com) |
| Hosting | [Vercel](https://vercel.com) |
| Imágenes | `astro:assets` + Sharp |

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio, carta y complementos |
| `/producto/pizza-10` | Ejemplo de ficha (Texana) |
| `/carrito` | Carrito y envío de pedido |
| `/imprimir-carta` | Carta para imprimir |
| `/sign-in`, `/sign-up` | Login y registro |
| `/privacidad` | Aviso de privacidad básico |
| `POST /api/pedido` | Valida pedido y prepara envío Web3Forms |

## Estructura del proyecto

```text
src/
├── components/     # Navbar, carta, carrito, auth…
├── data/menu.json  # Productos y precios
├── lib/            # Carrito, menú, pedidos
├── pages/          # Rutas Astro + API
└── layouts/        # Layout base + meta OG
public/
└── og-image.png    # Imagen al compartir enlace
```

## Desarrollo local

Requisitos: **Node.js ≥ 22.12**, **pnpm**.

```bash
pnpm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
pnpm astro dev
```

Abre http://localhost:4321

### Variables de entorno

Copia `.env.example` a `.env.local` (no se sube a git):

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí* | Clerk — clave pública |
| `CLERK_SECRET_KEY` | Sí* | Clerk — clave secreta |
| `WEB3FORMS_ACCESS_KEY` | Sí | Access key de [web3forms.com](https://web3forms.com) |
| `PEDIDOS_EMAIL` | Sí | Email del local que recibe pedidos |
| `PUBLIC_CLERK_SIGN_IN_URL` | No | Por defecto `/sign-in` |
| `PUBLIC_CLERK_SIGN_UP_URL` | No | Por defecto `/sign-up` |

\* Clerk puede arrancar en modo keyless en local; en producción las claves van en Vercel.

En Clerk Dashboard → **Allowed origins**, incluye:

- `http://localhost:4321`
- `https://pizzeria-formula-1.vercel.app`

## Despliegue

```bash
vercel --prod
```

Las variables de entorno deben estar configuradas en **Vercel → Settings → Environment Variables** (Production, Preview y Development).

## Cómo enseñarlo como portfolio

1. Abre la URL en **móvil** y compárala con la web actual del cliente.
2. Recorre en vivo: **carta → producto → carrito → enviar pedido** (con sesión iniciada).
3. Explica que el **estilo se adapta** al sector; lo reutilizable es catálogo, contacto, pedidos y login.
4. Comparte el enlace por WhatsApp: la preview ya muestra título e imagen.

## Notas

- Usa dominio gratuito `.vercel.app`; no hace falta comprar dominio para la demo.
- Los avisos de Clerk en modo test son normales en un portfolio.
- Los pedidos llegan al Outlook configurado en Web3Forms (revisa **Otros** / spam la primera vez).

## Comandos útiles

| Comando | Acción |
|---------|--------|
| `pnpm astro dev` | Servidor de desarrollo |
| `pnpm astro build` | Build de producción |
| `pnpm astro preview` | Previsualizar build |
| `vercel --prod` | Publicar en Vercel |

---

**Pizzería Fórmula 1** · Gran Avenida, 62 · 41340 Tocina, Sevilla · [954 74 03 96](tel:954740396)

Proyecto demo / portfolio.
