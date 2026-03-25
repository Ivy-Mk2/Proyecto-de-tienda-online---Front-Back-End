# 01-Arquitectura

## Diagrama general del sistema
```mermaid
flowchart LR
  U[Usuario] --> FE[FrontEnd\nReact + Vite]
  FE -->|HTTP/JSON + Bearer JWT| API[BackEnd API\nExpress + TypeScript]
  API --> SVC[Services por dominio]
  SVC --> ORM[Prisma Client]
  ORM --> DB[(MySQL)]
  API --> FS[(Uploads local)]
```

## Capas del sistema

### 1) FrontEnd
Responsable de UI, navegación, estado de sesión y consumo de endpoints.

### 2) API (Express)
Expone rutas REST (`/api/v1`), aplica middlewares (CORS, auth, validación, errores) y orquesta casos de uso.

### 3) Services
Contienen la lógica de negocio por dominio (`auth`, `products`, `cart`, etc.).

### 4) Prisma
Capa de acceso a datos tipada para consultas y mutaciones.

### 5) MySQL
Persistencia principal de usuarios, productos, carritos, órdenes, favoritos, banners y tokens.

## Vista de responsabilidades
```mermaid
flowchart TB
  FE[FrontEnd] --> API[Controller + Route]
  API --> SV[Service]
  SV --> PR[Prisma]
  PR --> DB[(MySQL)]

  API --> AUTH[Auth & Roles]
  API --> VAL[Validación Zod]
  API --> ERR[Manejo de errores]
```
