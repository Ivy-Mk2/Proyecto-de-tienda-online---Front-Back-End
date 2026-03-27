# 03-Flujos

## 1) Catálogo de productos (público)
```mermaid
flowchart TD
  A[Usuario abre Home/Products] --> B[FrontEnd productsService.list]
  B --> C[GET /api/v1/products]
  C --> D[products.controller.list]
  D --> E[products.service.list]
  E --> F[Prisma product.findMany + images]
  F --> G[JSON products]
  G --> H[Render de tarjetas en FrontEnd]
```

## 2) Login + recuperación automática de sesión
```mermaid
flowchart TD
  A[Usuario envía credenciales] --> B[POST /api/v1/auth/login]
  B --> C[auth.service.login]
  C --> D[Genera accessToken + refreshToken]
  D --> E[FrontEnd guarda tokens]
  E --> F[AuthContext llama cartService.mergeGuestCart]
  F --> G[POST /api/v1/cart/merge]
  G --> H[Sesión y carrito unificados]
```

## 3) Carrito híbrido (guest/auth)
```mermaid
flowchart TD
  A[Agregar producto] --> B[POST /api/v1/cart/items]
  B --> C{¿isAuthenticated?}
  C -- Sí --> D[usa Bearer token]
  C -- No --> E[usa guestToken]
  D --> F[cart.service.addItem]
  E --> F
  F --> G[Valida stock y actualiza cartItem]
  G --> H[Retorna carrito actualizado]
```

## 4) Checkout autenticado
```mermaid
flowchart TD
  A[Usuario en /orders] --> B[POST /api/v1/orders/checkout]
  B --> C[orders.service.checkout]
  C --> D[lee carrito + items]
  D --> E[crea Order + OrderItems snapshot]
  E --> F[vacía carrito]
  F --> G[retorna orden]
```

## 5) Refresh de access token en frontend
```mermaid
flowchart TD
  A[Request auth devuelve 401] --> B[apiRequest detecta 401]
  B --> C[POST /api/v1/auth/refresh]
  C --> D{refresh válido}
  D -- Sí --> E[guarda nuevo access token]
  E --> F[reintenta request original]
  D -- No --> G[limpia sesión local]
```
