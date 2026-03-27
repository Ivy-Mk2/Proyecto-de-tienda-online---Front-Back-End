# 08-Relacion-Front-Back

## Propósito
Este documento explica cómo se conectan los archivos de **frontend** y **backend**, qué hace cada bloque y qué recorrido sigue una petición real.

---

## 1) Backend: archivos clave y función

### `BackEnd/src/server.ts`
- Punto de arranque del servidor.
- Lee puerto desde `config/env.ts` y levanta `app`.

### `BackEnd/src/app.ts`
- Configura middlewares globales (`helmet`, `cors`, `morgan`, `json`).
- Expone archivos estáticos de `uploads/`.
- Monta rutas `/api/v1`.

### `BackEnd/src/routes/v1.ts`
- Registra rutas por dominio:
  - `/auth`
  - `/products`
  - `/cart`
  - `/favorites`
  - `/orders`
  - `/banners`
- Incluye healthcheck `/health`.

### `BackEnd/src/modules/*`
Cada módulo tiene normalmente:
- `*.routes.ts` (rutas HTTP),
- `*.controller.ts` (entrada/salida HTTP),
- `*.service.ts` (lógica de negocio),
- `*.schema.ts` (validaciones Zod, cuando aplica).

### `BackEnd/src/shared/*`
- Middleware de auth/roles.
- Middleware de validación.
- Manejo centralizado de errores.
- Utilidades (JWT, async-handler).

### `BackEnd/prisma/schema.prisma`
- Modelo de datos y relaciones MySQL.
- Prisma genera cliente tipado usado en `services`.

---

## 2) FrontEnd (integrado): archivos clave y función

### `FrontEnd/src/main.tsx`
- Entry point de React.
- Envuelve toda la app con `AuthProvider`.
- Renderiza `AppRouter`.

### `FrontEnd/src/routes/AppRouter.tsx`
- Define rutas públicas y privadas.
- Usa `SessionGuard` y `RoleGuard`.

### `FrontEnd/src/context/AuthContext.tsx`
- Mantiene usuario autenticado y estado de carga.
- Ejecuta `login/register/logout/me`.
- Tras login/registro ejecuta `cartService.mergeGuestCart()`.

### `FrontEnd/src/lib/api/client.ts`
- Cliente HTTP central.
- Agrega `Authorization` cuando corresponde.
- Ante `401` intenta `POST /auth/refresh` y reintenta request.

### `FrontEnd/src/lib/api/tokens.ts`
- Manejo de `accessToken`, `refreshToken`, `guestToken` en `localStorage`.

### `FrontEnd/src/services/*.service.ts`
- Traduce acciones de UI a llamadas API:
  - `auth.service.ts`
  - `products.service.ts`
  - `cart.service.ts`
  - `orders.service.ts`

---

## 3) Flujo de extremo a extremo (ejemplo real)

### Caso: “Agregar producto al carrito siendo invitado, luego iniciar sesión”

1. En frontend, `CartPage` llama `cartService.addItem(...)`.
2. `cart.service.ts` detecta usuario no autenticado y manda `guestToken`.
3. `apiRequest` envía `POST /api/v1/cart/items`.
4. En backend, `cart.routes.ts` valida payload (`cart.schema.ts`).
5. `cart.controller.ts` delega a `cart.service.ts`.
6. `cart.service.ts` persiste/actualiza carrito guest en MySQL (Prisma).
7. Al hacer login, `AuthContext` llama `authService.login`.
8. Con login exitoso, `AuthContext` ejecuta `cartService.mergeGuestCart()`.
9. Backend combina items del guest cart con el carrito del usuario autenticado.
10. Frontend continúa operando con carrito asociado a la cuenta.

---

## 4) Cómo se relaciona `react-app/` con esta arquitectura

- `react-app/` contiene una base de componentes y páginas de UI.
- Su capa de datos principal es local (mocks + localStorage).
- Sirve como referencia visual y funcional para migrar piezas a `FrontEnd/`.
- La integración oficial con backend actualmente vive en `FrontEnd/`.

---

## 5) Contrato de integración recomendado

Para evitar desalineación entre capas:

- Tipar respuestas backend y reutilizar tipos en frontend (`types/api.ts`).
- Mantener un solo cliente HTTP (`lib/api/client.ts`) para refresh/errores.
- Evitar fetch directo en componentes de página; usar siempre `services`.
- Versionar cambios de API bajo `/api/v1` y documentar breaking changes.

Con esto, frontend y backend evolucionan en paralelo sin romper flujos críticos.
