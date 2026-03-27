# 04-Frontend

## Frontends del repositorio
Actualmente conviven dos implementaciones:

1. **`FrontEnd/` (integración API real)**
2. **`react-app/` (base visual + datos locales/mocks)**

La ruta recomendada para integración con backend es `FrontEnd/`.

## Estructura actual de `FrontEnd/src`
```text
FrontEnd/src/
  app/
  components/
  context/
  hooks/
  lib/api/
  pages/
  routes/
  services/
  styles/
  types/
```

## Flujo interno recomendado en FrontEnd
```mermaid
flowchart LR
  UI[Page/Component] --> CTX[Context o Hook]
  CTX --> SVC[services/*.ts]
  SVC --> API[lib/api/client.ts]
  API --> BE[/api/v1]
  BE --> API --> SVC --> CTX --> UI
```

## Enrutado y acceso
- Rutas públicas: `/`, `/login`, `/register`, `/cart`, `/forbidden`.
- Rutas protegidas por sesión: `/orders`.
- Ruta protegida por rol admin: `/admin`.
- Guards implementados en `routes/guards.tsx`.

## Gestión de sesión y tokens
- `AuthContext` centraliza estado de usuario, login, register y logout.
- `tokens.ts` persiste `accessToken`, `refreshToken` y `guestToken` en `localStorage`.
- `client.ts` hace refresh automático al recibir `401` en peticiones autenticadas.

## Estado de `react-app/`
- Mantiene estructura visual amplia y pruebas (`vitest`).
- `products.service.ts` usa datos locales.
- `cart.service.ts` usa `localStorage`.
- Útil como base UI, pero no reemplaza aún la integración API de `FrontEnd/`.
