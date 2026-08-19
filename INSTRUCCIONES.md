# Instrucciones para el agente

Escribe aquí lo que quieres que haga. **Cada encargo nuevo va ARRIBA**, en `Pendiente`. No borres las secciones.

Cómo usarlo:

1. Abre este archivo.
2. En `Pendiente`, añade un bullet con la tarea (la más urgente primero).
3. Guarda el archivo y avísame en el chat, o espera a que lo lea.
4. Lo que está en `En curso` es prioridad máxima hasta pasarlo a `Hecho`. Lo nuevo va a `Pendiente`.
5. Cuando lo complete, lo moveré a `Hecho`.

---

## Pendiente

- Localhost: arrancar con `pnpm astro dev` (no `vercel --prod`). En Clerk Dashboard → Allowed origins incluir `http://localhost:4321` y `https://pizzeria-formula-1.vercel.app`.
- Activar Google y Facebook en Clerk (conexiones sociales + apps OAuth) para que el login social funcione en local y en producción.



## En curso

- Inicios de sesión en el header (Clerk): UI de Entrar / Registro ya en el navbar.
  - Pendiente de ti: activar Email, Google y Facebook en [https://dashboard.clerk.com](https://dashboard.clerk.com) y pegar las claves en `.env.local` y en Vercel.
  - Correo + contraseña envía email de verificación automáticamente (no Google/Facebook).



## Hecho

- Crear este archivo de instrucciones (`INSTRUCCIONES.md`).
- Optimizar la carga de [https://pizzeria-formula-1.vercel.app/](https://pizzeria-formula-1.vercel.app/) (fuentes, imágenes, HTML estático).
- Cargar precios e ingredientes de las pizzas 00–10 desde la foto de la carta (pequeña / mediana / familiar).
- Cargar precios e ingredientes del resto de la carta (para picar, ensaladas, serranitos, hamburguesas, sandwiches, kebab, pastas y postres).
- Reparar «Descargar menú PDF» (ruta `/categorias/carta-formula1.pdf`).
- Texana (id 10) incluida al imprimir carta: pizzas repartidas en dos páginas en `/imprimir-carta`.
- Ficha de producto (`/producto/[slug]`): ingredientes, precios y tamaños al clicar cualquier producto.
- Carrito de compra: añadir productos, cantidades, resumen en `/carrito`, icono con contador en el header solo con sesión iniciada. Sin sesión, «Añadir al carrito» redirige a login/registro.
- Enviar pedidos del carrito por correo a `pizzeriaformula1@outlook.es` (formulario de nombre, teléfono, recogida/reparto). API key de Resend guardada en `.env.local`.
