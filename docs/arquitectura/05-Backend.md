# 05-Backend

## Arquitectura actual del backend

El backend sigue una estructura modular por dominio, con separación de responsabilidades:

- `modules/`: dominios (`auth`, `products`, `cart`, `favorites`, `orders`, `banners`, `uploads`).
- `routes/`: composición de rutas versionadas (`/api/v1`).
- `controllers/`: capa HTTP (request/response).
- `services/`: lógica de negocio y reglas.
- `prisma/`: cliente y modelo de datos.
- `shared/`: middlewares, errores, utilidades, tipos globales.

## Flujo interno estándar
```mermaid
flowchart LR
  R[Route] --> C[Controller]
  C --> S[Service]
  S --> P[Prisma Client]
  P --> DB[(MySQL)]
```

## Flujo con middleware
```mermaid
flowchart TD
  A[Request] --> B[Middlewares]
  B --> B1[Auth/JWT]
  B --> B2[Validación Zod]
  B --> B3[Rate limit]
  B1 --> C[Controller]
  B2 --> C
  B3 --> C
  C --> D[Service]
  D --> E[Prisma]
  E --> F[(DB)]
  F --> G[Response]
  G --> H[Error handler central]
```

## Fortalezas actuales
- Base modular clara para escalar.
- Integración de seguridad y validación desde la capa HTTP.
- Prisma simplifica mantenibilidad del acceso a datos.
