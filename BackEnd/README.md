# Ecommerce Backend (MVP)

Backend API para migrar progresivamente el frontend actual (React + Zustand) desde mocks/localStorage hacia una API real.

## Stack

- Node.js + Express
- TypeScript (strict)
- Prisma ORM + MySQL
- JWT (access + refresh)
- Multer para upload local en `/uploads`
- Zod para validaciones

## Estructura

```txt
backend/
  src/
    app.ts
    server.ts
    config/
    modules/
      auth/
      users/
      products/
      cart/
      favorites/
      orders/
      banners/
      uploads/
      admin/
    shared/
      middleware/
      utils/
      errors/
      types/
      constants/
    routes/
    prisma/
  prisma/
    schema.prisma
    seed.ts
  uploads/
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```bash
cp .env.example .env
```

Variables clave:

- `DATABASE_URL`: conexión MySQL
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`: URL del frontend (por defecto `http://localhost:5173`)

## Instalación y ejecución

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

Servidor por defecto: `http://localhost:4000`

Healthcheck: `GET /api/v1/health`

## Endpoints MVP

Base URL: `/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products` (ADMIN)
- `PATCH /products/:id` (ADMIN)
- `DELETE /products/:id` (ADMIN)
- `POST /products/:id/images` (ADMIN, form-data con `image`)
- `DELETE /products/:id/images/:imageId` (ADMIN)

### Cart

- `GET /cart?guestToken=...` o autenticado
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `POST /cart/merge` (auth)

### Favorites

- `GET /favorites` (auth)
- `POST /favorites/:productId` (auth)
- `DELETE /favorites/:productId` (auth)

### Orders

- `POST /orders/checkout` (auth, checkout simulado)
- `GET /orders` (auth)
- `GET /orders/:id` (auth)

### Banners

- `GET /banners` (público solo activos)
- `POST /banners` (ADMIN)
- `PATCH /banners/:id` (ADMIN)
- `DELETE /banners/:id` (ADMIN)

## Integración con frontend existente

- `products.service.ts` puede migrar de mocks a `GET /api/v1/products` y `GET /api/v1/products/:id`.
- `cart.service.ts` puede migrar de localStorage a `/api/v1/cart` usando:
  - guest: `guestToken`
  - logged user: bearer token
- Las respuestas son directas (sin nesting complejo) para facilitar migración incremental.

## Decisiones simples pero escalables

1. **Auth provider listo para OAuth**
   - Modelo `User` incluye `authProvider` y `providerId`.
   - Hoy solo usa `LOCAL`; luego puede usar Google/Facebook/Apple sin romper estructura.

2. **Checkout simulado listo para Mercado Pago**
   - `Order` guarda `paymentProvider` y `externalPaymentId`.
   - Hoy se usa `SIMULATED`; luego se reemplaza por flujo Mercado Pago.

3. **Upload con abstracción**
   - `upload.service.ts` define interfaz `UploadStorage`.
   - Actualmente usa almacenamiento local y URL `/uploads/...`.
   - Luego puede cambiar a Cloudinary/S3 sin cambiar lógica de producto.

## Seed

`npm run db:seed` crea:

- Admin: `admin@shop.local` / `Admin123!`
- Customer: `customer@shop.local` / `Customer123!`
- Productos, imágenes y banners de ejemplo.

## Seguridad incluida

- `helmet`
- `cors`
- `morgan`
- rate limit en rutas de auth
- validación con zod
- middleware de auth + roles
- manejo centralizado de errores

## Nota de migración

Este backend está diseñado para coexistir con el frontend actual sin romperlo. La estrategia recomendada es cambiar primero lectura de productos, luego carrito, y finalmente checkout/autenticación.
