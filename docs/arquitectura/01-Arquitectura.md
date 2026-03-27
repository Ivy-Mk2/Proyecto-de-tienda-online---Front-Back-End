# 01-Arquitectura

## Arquitectura general del sistema
```mermaid
flowchart LR
  U[Usuario] --> FEA[FrontEnd\nReact + Vite\n(API integrada)]
  U --> FEB[react-app\nReact + Vite\n(UI/mocks)]

  FEA -->|HTTP JSON + Bearer| API[BackEnd API\nExpress + TS]
  API --> ROUTES[Routes v1]
  ROUTES --> MOD[Controllers + Services por dominio]
  MOD --> ORM[Prisma Client]
  ORM --> DB[(MySQL)]
  API --> FS[(uploads/)]
```

## Capas y responsabilidades

### 1) Capa de presentación
- `FrontEnd/`: SPA con integración real contra backend.
- `react-app/`: SPA enfocada en UI y estado local/mocks.

### 2) Capa HTTP/API
- `BackEnd/src/app.ts`: middlewares globales (`helmet`, `cors`, `morgan`, `express.json`).
- `BackEnd/src/routes/v1.ts`: composición de rutas versionadas `/api/v1`.

### 3) Capa de negocio
- Dominios en `BackEnd/src/modules/*` con patrón `routes -> controller -> service`.

### 4) Capa de datos
- Prisma (`BackEnd/prisma/schema.prisma`) como acceso tipado.
- MySQL como persistencia principal.

## Principios usados
- Separación por dominios de negocio.
- Validación de entrada con Zod por endpoint.
- Seguridad centralizada por middlewares (`requireAuth`, `requireRole`).
- Evolución gradual: coexistencia de frontend integrado y frontend legacy.
