# Explicación de arquitectura (nivel principiante)

## ¿Qué hace cada carpeta?

- `src/modules/*`: cada módulo tiene su propia lógica (auth, products, cart, etc).
- `src/routes`: junta todas las rutas bajo `/api/v1`.
- `src/shared`: piezas reutilizables (middlewares, errores, utilidades).
- `prisma/schema.prisma`: define tablas y relaciones de la base de datos.
- `prisma/seed.ts`: crea datos iniciales para desarrollo.
- `uploads/`: guarda imágenes subidas localmente.

## ¿Qué es Prisma?

Prisma es una herramienta que traduce código TypeScript a consultas SQL de forma segura. En vez de escribir SQL manual para todo, usamos `prisma.user.findUnique(...)`, `prisma.product.create(...)`, etc.

## ¿Qué es JWT?

JWT es un token que representa al usuario autenticado.

- `access token`: dura poco (ej. 15 min), se envía en `Authorization: Bearer ...`.
- `refresh token`: dura más, sirve para pedir nuevos access tokens.

## ¿Cómo funciona carrito invitado vs usuario?

- Invitado: el frontend manda un `guestToken`; backend usa `Cart.guestToken`.
- Usuario logueado: backend usa `Cart.userId`.
- Al iniciar sesión, `/cart/merge` mueve productos del carrito invitado al carrito del usuario.

## ¿Cómo funciona upload de imágenes?

1. Admin sube imagen con `multipart/form-data`.
2. Multer valida tipo/tamaño.
3. Archivo se guarda en `backend/uploads`.
4. Se guarda URL pública (`/uploads/<archivo>`) en base de datos.

## ¿Cómo crecer a OAuth y Mercado Pago?

- OAuth: el modelo ya tiene `authProvider` y `providerId`.
- Mercado Pago: `Order` ya tiene `paymentProvider` y `externalPaymentId`.

La idea es **extender** servicios existentes sin reescribir toda la base del backend.
