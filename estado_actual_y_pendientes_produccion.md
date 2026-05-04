# Estado actual del proyecto y pendientes para producción

**Fecha:** 2026-05-02 (revisión post-limpieza)
**Repositorio:** `Proyecto-de-tienda-online---Front-Back-End`
**Rama analizada:** `IntegracionUI`

---

## 0) Cambios realizados desde la última revisión

- Se **eliminó la carpeta `react-app/`** (frontend legacy con mocks/Zustand). El monorepo queda con un único frontend oficial.
- Se **borró todo el código muerto** identificado en `reporte_codigo_no_utilizado.md`: subcarpetas `Announcement`, `Banner`, `BodySection`, `Featured`, `Footer`, `Header`, `home`, `Hooks`, `Marquee`, `Newsletter`, `SaleBanner`, `SpecialBanner`, `ui` dentro de `FrontEnd/src/components/` y la carpeta entera `FrontEnd/src/features/`.
- `FrontEnd/src/app/Layout.tsx` quedó simplificado a un `<Outlet />`.
- El **Prisma Client ya está regenerado**: `node_modules/.prisma/client/index.d.ts` contiene 448 referencias a `AuthIdentity`. `npx tsc --noEmit` en `BackEnd/` pasa sin errores. `npx tsc --noEmit` en `FrontEnd/` también pasa sin errores.
- En consecuencia, **el bug bloqueante de login/registro está resuelto a nivel de código**. Queda confirmar que la base de datos local tenga la migración aplicada (`prisma migrate deploy` o `migrate dev`) y que `DATABASE_URL` apunte a una instancia MySQL accesible.

---

## 1) Resumen ejecutivo

El proyecto es una tienda online con dos paquetes:

- `BackEnd/` — API REST en **Express + TypeScript + Prisma (MySQL) + JWT**.
- `FrontEnd/` — SPA en **React 18 + TypeScript + Vite**, conectada a la API.

Estado de salud del código:

| Paquete | TypeCheck | Build | Cliente Prisma | Código muerto |
|---|---|---|---|---|
| `BackEnd/` | ✅ Pasa | sin verificar | ✅ Sincronizado | módulos `admin/` y `users/` solo con README |
| `FrontEnd/` | ✅ Pasa | sin verificar | n/a | ✅ Limpio |

**Veredicto:** la base de código está sana y consolidada. Todavía **no está lista para producción**, pero los bloqueantes que quedan son operativos (BD productiva, secretos, deploy, pago real, CDN/imágenes), no de código. Estimación: ~8-10 días-persona para llegar a un MVP desplegable seguro.

---

## 2) Estado por módulo

### BackEnd (`/BackEnd`)

**Hecho:**
- Stack: Express 4 + TS + Prisma 6 + JWT + bcryptjs + zod.
- Middlewares de seguridad: `helmet`, `cors` con `credentials`, `rate-limit` en `/auth`.
- Estructura por módulos: `auth`, `products`, `cart`, `favorites`, `orders`, `banners`, `uploads`.
- Auth local + Google OAuth (callback con cookie httpOnly de refresh).
- Rotación de refresh tokens en BD (hash SHA-256, expiración 7 días).
- Migraciones Prisma versionadas (`20260326204734_init`, `20260416120000_auth_identity_and_token_hardening`).
- Cliente Prisma generado con todos los modelos (incluido `AuthIdentity`).
- Subida local de imágenes (`/uploads`) con `multer`.

**Pendiente / problemas:**
- Secretos de `.env` siguen siendo placeholders (`change-me-access`, `change-me-refresh`).
- `BackEnd/.env` tiene `DATABASE_URL="mysql://root:@localhost:3306/ecommerce_db"` (contraseña vacía); ajustar al MySQL local antes de levantar.
- `paymentProvider: 'SIMULATED'` en `orders.service.ts:23`. No hay integración con pasarela real (Stripe / MercadoPago / Culqi).
- Módulos `admin` y `users` solo contienen `README.md`, no tienen rutas implementadas. O se completan o se eliminan.
- No hay tests automatizados.
- `morgan('dev')` siempre activo. En producción conviene `combined` y un logger estructurado (pino/winston).
- No hay manejo de `process.on('unhandledRejection')` ni shutdown graceful.
- `/api/v1/health` solo devuelve `{ status: 'ok' }` sin tocar BD. Falta liveness/readiness real.
- `/uploads` se sirve desde el filesystem local; rompe en plataformas con FS efímero. Migrar a S3/Cloudinary.
- `auth.controller.login` lee `req.body` directo en vez de usar el resultado de zod (no es bug, sí es inconsistente).

### FrontEnd (`/FrontEnd`)

**Hecho:**
- React 18 + Vite + React Router 6 + TS estricto.
- `AuthContext` con sync de sesión, refresh automático en `apiRequest` (re-intento ante 401).
- Servicios HTTP por dominio (`auth`, `products`, `cart`, `favorites`, `orders`, `banners`, `bodySections`).
- Páginas y guards (`SessionGuard`, `RoleGuard`).
- 12 páginas: Home, Products, ProductDetail, Cart, Checkout, Orders, Favorites, Profile, Login, Register, Admin, Forbidden.
- Diseño 808xHz aplicado en todas las páginas vía `Shell808` o componentes inline.
- Estructura final mínima y limpia:
  ```
  src/
  ├── app/Layout.tsx               (solo Outlet)
  ├── components/Shell808/         (única shell viva)
  ├── context/AuthContext.tsx
  ├── hooks/                       (5 hooks: useApiError, useBanners, useBodySections, useCartData, useFeaturedProducts)
  ├── lib/api/                     (client, tokens, imageUrl)
  ├── pages/                       (12 páginas)
  ├── routes/                      (AppRouter, guards)
  ├── services/                    (7 servicios)
  ├── styles/                      (808xhz.css, 808xhz-pages.css, global.css, tokens.ts)
  ├── types/api.ts
  └── main.tsx
  ```

**Pendiente / problemas:**
- No hay `.env` ni `.env.production` para fijar `VITE_API_URL` por entorno.
- No hay tests (Vitest/RTL/Playwright/Cypress).
- No hay manejo global de errores ni toast unificado de feedback.
- `LoginPage.tsx` deja `accessToken` y `oauth` en la URL después del callback de Google (no limpia `searchParams`).
- No hay loading skeleton/empty state consistentes entre páginas.
- No hay code splitting por ruta (`React.lazy`).
- `app/Layout.tsx` sigue importando `useLocation` y declarando `usesShell808` que no se utiliza; es código muerto residual de 1 línea, eliminable.
- `styles/tokens.ts` ya no se importa desde ningún lado (los consumidores eran los componentes `ui/*` borrados). Verificable y eliminable.

### Base de datos

- MySQL 8 vía Prisma. Modelos: `User`, `AuthIdentity`, `RefreshToken`, `Product`, `ProductImage`, `Cart`, `CartItem`, `Favorite`, `Order`, `OrderItem`, `Banner`.
- Índices y relaciones razonables. Cliente regenerado.
- Falta seed productivo realista (existe `prisma/seed.ts` pero no validado).

---

## 3) Pendientes para producción (priorizados)

### P0 — Bloqueantes operativos

1. **Aplicar migración a la BD local/staging** y verificar el flujo de auth end-to-end:
   ```bash
   cd BackEnd
   npx prisma migrate deploy   # o migrate dev en local
   npm run dev
   # POST /api/v1/auth/register, /auth/login, /auth/me con curl o desde la UI
   ```
2. **Rotar y configurar secretos reales** en `.env` de cada entorno:
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` con valores aleatorios fuertes (≥ 32 bytes).
   - `DATABASE_URL` apuntando a la BD productiva (RDS / PlanetScale / Railway / Neon-Mysql / similar).
   - `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` reales (si se mantiene OAuth).
   - `CORS_ORIGIN` con el dominio real del frontend.
   - `.env` debe estar fuera del repo (verificar `.gitignore`); mantener `.env.example` actualizado.
3. **Pasarela de pago real**: reemplazar `paymentProvider: 'SIMULATED'` por Stripe/MercadoPago/Culqi con webhook de confirmación de pago.
4. **HTTPS y cookies seguras**: el cookie de refresh ya usa `secure: true` cuando `NODE_ENV=production`. Si frontend y backend están en dominios distintos (no solo distinto puerto), el cookie debe ir con `sameSite: 'none'` y `secure: true`. Probar el flujo completo en staging.
5. **CORS multi-origen**: hoy `CORS_ORIGIN` acepta una sola URL. Para staging + prod ajustar a lista o función.
6. **Almacenamiento de imágenes**: migrar `/uploads` local a un bucket (S3/Cloudinary/R2). Render/Railway/Fly tienen FS efímero — las imágenes se borran en cada deploy.

### P1 — Estabilidad antes de abrir tráfico

7. **Build y deploy**:
   - Backend: `Dockerfile` + `npm run build` → `node dist/server.js`. Falta `Dockerfile` o `Procfile`/`render.yaml`.
   - Frontend: `npm run build` (Vite) → CDN (Vercel/Netlify/Cloudflare Pages).
8. **CI básico** (GitHub Actions):
   - `tsc --noEmit` en backend y frontend.
   - `prisma validate` + `prisma format`.
   - `npm audit --audit-level=high`.
   - Build de ambos paquetes.
9. **Logging estructurado** (pino/winston) y request-id. Sustituir `morgan('dev')` por `combined` en prod.
10. **Manejo de errores**: en `errorHandler` loguear el error 500 con stack y request context antes de responder.
11. **Healthcheck profundo**: `/api/v1/health` debe ejecutar `prisma.$queryRaw\`SELECT 1\`` para que el orquestador detecte BD caída.
12. **Rate limiting** adicional en checkout y refresh; el de `/auth` ya está bien (30/15min).
13. **Helmet CSP**: revisar `crossOriginResourcePolicy: false` (se desactivó para servir imágenes locales; cuando se migre a CDN, reactivarlo).
14. **CSRF**: refresh-token está en cookie httpOnly (bien). Si se añaden endpoints state-changing solo con cookie, evaluar protección CSRF.
15. **`.gitignore`**: añadir `node_modules/.vite/deps` y `node_modules/.prisma/client` para que dejen de aparecer en `git status`.

### P2 — Calidad y operación

16. **Tests**:
    - Backend: Vitest + Supertest en `auth`, `cart`, `orders` (smoke + unit).
    - Frontend: Vitest + RTL en LoginPage, RegisterPage, CartPage, CheckoutPage; Playwright para el flujo end-to-end de compra.
17. **Documentación API**: OpenAPI/Swagger desde los schemas zod (`zod-to-openapi`) expuesto en `/docs`.
18. **Monitoreo**: Sentry frontend + backend; métricas básicas (Grafana/Datadog).
19. **Backups**: política de backup automático en la BD productiva.
20. **Limpieza menor**:
    - Eliminar `usesShell808` y el `useLocation` no utilizado en `app/Layout.tsx`.
    - Verificar y eliminar `styles/tokens.ts` si ya no se importa.
    - Implementar o borrar `BackEnd/src/modules/{admin,users}/`.
21. **Internacionalización** (si hay alcance internacional): `react-i18next`.
22. **Accesibilidad**: revisar contraste y `aria-*` en el tema 808xHz, especialmente en formularios de auth.

---

## 4) Plan sugerido (orden de ejecución)

| # | Tarea | Responsable | Tiempo estimado |
|---|---|---|---|
| 1 | Aplicar `prisma migrate deploy` y verificar register/login en local | Backend | 30 min |
| 2 | Generar JWT secrets reales y `.env` de prod/staging | DevOps | 30 min |
| 3 | Provisionar BD productiva (RDS/PlanetScale) y correr migraciones | DevOps | 0.5 día |
| 4 | Migrar `/uploads` a S3/Cloudinary + actualizar `imageUrl` helper | Backend + Frontend | 1 día |
| 5 | Integrar pasarela de pago real (Stripe/MercadoPago) + webhook | Backend + Frontend | 2-3 días |
| 6 | `Dockerfile` backend + config deploy frontend (Vercel/Netlify) | DevOps | 1 día |
| 7 | GitHub Actions (typecheck + build + audit) | DevOps | 0.5 día |
| 8 | Logging estructurado + Sentry + healthcheck profundo | Backend | 1 día |
| 9 | Tests E2E del flujo de compra (Playwright) | QA/Frontend | 2 días |
| 10 | Documentación OpenAPI | Backend | 1 día |
| 11 | Limpieza menor (Layout, tokens.ts, módulos vacíos) | Frontend + Backend | 0.5 día |

**Total estimado para MVP en producción:** ~8-10 días-persona.

---

## 5) Próximos pasos inmediatos (esta semana)

En orden, lo más rentable a partir del estado actual:

1. **Verificar el flujo de auth en local** (paso 1 de la tabla). Una vez confirmado, cerrar definitivamente el tema "login muestra error".
2. **Crear `.env` de staging** con secretos reales y BD aprovisionada (pasos 2-3). Hacer el primer deploy de prueba a staging.
3. **Decidir y configurar la pasarela de pago** (paso 5). Es el bloqueante funcional más grande que queda en el roadmap.
4. **Subir un Dockerfile mínimo del backend** y un `vercel.json`/equivalente del frontend (paso 6) para empezar a iterar deploys.
5. **Cerrar la limpieza pendiente** (paso 11) en una PR pequeña: `Layout.tsx`, `styles/tokens.ts`, módulos vacíos `admin/users`. Es trabajo de minutos y deja el repo en un estado sin código residual.
6. **CI mínimo** (paso 7): typecheck + build en cada push. Da red de seguridad para todo lo que viene después.

Una vez asegurados estos seis puntos, el resto (logging, tests, OpenAPI, Sentry) se puede paralelizar entre miembros del equipo.

---

## 6) Conclusión

La situación cambió de forma significativa respecto a la revisión anterior:

- ❌ Antes: bug crítico de Prisma + dos frontends + ~37 archivos huérfanos.
- ✅ Ahora: typecheck verde en ambos paquetes, un solo frontend, código residual mínimo, Prisma sincronizado.

Lo que falta para producción ya **no es código**, es trabajo de plataforma: BD productiva, secretos, pago real, CDN/imágenes, observabilidad, CI, tests. Con foco en P0 + P1 se llega a un MVP desplegable en menos de dos semanas.
