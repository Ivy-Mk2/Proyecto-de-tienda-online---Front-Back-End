# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack e-commerce application with two coexisting frontends:
- **`/BackEnd`** — Node.js + Express + TypeScript + Prisma + MySQL (production API)
- **`/FrontEnd`** — React 18 + Vite + TypeScript (active production frontend, API-integrated)
- **`/react-app`** — React 18 + Vite + TypeScript + Zustand (reference UI with mock data and test infrastructure)

## Commands

### Backend (`/BackEnd`)
```bash
npm run dev              # Dev server with tsx watch
npm run build            # TypeScript compilation
npm run start            # Run compiled output
npm run lint             # Type-check only (tsc --noEmit)
npm run prisma:migrate   # Run DB migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run db:seed          # Seed database with test data
```

### FrontEnd (`/FrontEnd`)
```bash
npm run dev              # Vite dev server
npm run build            # TypeScript + Vite production build
npm run typecheck        # Type validation without emit
npm run preview          # Preview production build locally
```

### react-app (`/react-app`)
```bash
npm run dev              # Vite dev server
npm run build            # TypeScript + Vite production build
npm run lint             # ESLint
npm run test             # Run Vitest (single run)
npm run test:watch       # Vitest watch mode
npm run format           # Prettier formatting
```

## Architecture

### Backend

**Entry points:** `src/server.ts` → `src/app.ts`

Routes are domain-organized under `src/routes/`:
- `auth/` — JWT registration, login, refresh, logout
- `products/` — CRUD with Multer image upload
- `cart/` — Guest carts (via `guestToken`) + authenticated carts with merge-on-login
- `favorites/` — User wishlist
- `orders/` — Checkout and order history
- `banners/` — Marketing banners
- `uploads/` — Static file serving for uploaded images

Each route module has: `router → controller → service → Prisma`. Validation via Zod, auth via JWT middleware in `src/middleware/`.

**Key design decisions:**
- Guest carts use a `guestToken` and merge into the user's cart on login
- `CartItem` and `OrderItem` snapshot prices at time of action to avoid drift
- `Order` model has `paymentProvider` + `externalPaymentId` fields for Mercado Pago integration (not yet active)
- `upload.service.ts` abstracts storage — currently local, designed for S3/Cloudinary migration
- `User` model has `authProvider` + `providerId` for OAuth (env vars exist, implementation pending)

### FrontEnd (active)

**Entry points:** `src/main.tsx` → `src/routes/AppRouter.tsx`

- **`AuthContext`** — Session state, login/logout, token refresh lifecycle
- **`lib/api/client.ts`** — Centralized HTTP client with Bearer token injection and automatic token refresh on 401
- **`services/`** — Products, Cart, Orders, Auth (all call the real API)
- **`guards/`** — `SessionGuard` and `RoleGuard` wrap protected routes in the router

### react-app (reference/legacy)

- Zustand store (`useShopStore`) manages cart and favorites in memory/localStorage
- `services/` files use mock data — no real API calls
- Has full test infrastructure (Vitest + Testing Library)
- Used for UI prototyping and testing new components in isolation

## Database (Prisma / MySQL)

Schema at `BackEnd/prisma/schema.prisma`. Core models:

| Model | Notes |
|-------|-------|
| `User` | Local auth + OAuth fields (`authProvider`, `providerId`) |
| `RefreshToken` | Stored for revocation tracking |
| `Product` | Sizes and colors stored as JSON fields |
| `ProductImage` | Multiple images per product with ordering |
| `Cart` | Belongs to `User` or anonymous via `guestToken` |
| `CartItem` | Snapshots `price` at add time |
| `Order` | Has `paymentProvider` + `externalPaymentId` |
| `OrderItem` | Snapshots `price` at checkout |
| `Banner` | Marketing content with ordering |

## Environment Variables

Backend `.env` (see `.env.example`):
```
DATABASE_URL            # MySQL connection string
JWT_ACCESS_SECRET       # Access token secret
JWT_REFRESH_SECRET      # Refresh token secret
JWT_ACCESS_EXPIRES_IN   # e.g. 15m
JWT_REFRESH_EXPIRES_IN  # e.g. 7d
CORS_ORIGIN             # Frontend URL (default: http://localhost:5173)
PORT                    # Server port (default: 4000)
MAX_UPLOAD_SIZE_MB      # Multer limit
GOOGLE_CLIENT_ID        # OAuth (not yet implemented)
```

## Known Limitations

- Refresh tokens are stored in `localStorage` (security risk; should move to HttpOnly cookies)
- Backend has no test infrastructure (no Vitest/Jest config)
- `FrontEnd` may have typecheck errors from legacy Zustand/localStorage code that was not fully removed
- OAuth env vars are configured but the implementation does not exist yet
