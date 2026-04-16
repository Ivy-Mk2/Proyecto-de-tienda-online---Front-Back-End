# Diagnóstico técnico real del sistema (auditoría integral)

**Fecha:** 16 de abril de 2026  
**Alcance auditado:** `FrontEnd/`, `BackEnd/`, `react-app/`, `docs/arquitectura/`

---

## A. Resumen ejecutivo del estado del proyecto

El repositorio **sí tiene backend implementado y frontend funcional**, pero conviven **dos frontends con objetivos distintos**:

- `FrontEnd/` es el frontend actual conectado a API real (`/api/v1`).
- `react-app/` es una base visual/legacy con mocks/localStorage y tests, usada como referencia de UI.

Esto está confirmado por la propia documentación técnica del repositorio.【F:docs/arquitectura/00-Resumen.md†L6-L41】【F:docs/arquitectura/04-Frontend.md†L3-L40】

### Estado real por capa

- **Backend:** maduro para MVP (auth local JWT, productos, carrito guest+auth con merge, favoritos, órdenes, banners, uploads, Prisma/MySQL).【F:BackEnd/src/routes/v1.ts†L1-L21】【F:BackEnd/prisma/schema.prisma†L1-L194】
- **Frontend principal (`FrontEnd`):** integra sesión, guards, servicios HTTP con refresh automático y páginas base de e-commerce/auth.【F:FrontEnd/src/main.tsx†L1-L13】【F:FrontEnd/src/routes/AppRouter.tsx†L1-L34】【F:FrontEnd/src/lib/api/client.ts†L1-L89】
- **Frontend legacy (`react-app`):** útil como referencia visual/testing, pero no debería considerarse la integración oficial con backend actual.【F:docs/arquitectura/04-Frontend.md†L3-L40】

### Hallazgo crítico

El `FrontEnd` tiene **deuda técnica activa**: `npm run typecheck` falla por mezcla de código antiguo (hooks/store de la etapa mock/Zustand) con la arquitectura nueva basada en API/services, lo que impacta mantenibilidad y escalabilidad inmediata.

---

## B. Estructura actual detectada

## 1) Estructura macro

```text
/BackEnd     -> API REST TypeScript + Prisma
/FrontEnd    -> React + TS + Router + AuthContext + services API
/react-app   -> React + TS (base visual/legacy, mocks/localStorage, tests)
/docs        -> documentación de arquitectura y roadmap
```

## 2) Organización real del FrontEnd activo

`FrontEnd/src` está bien encaminado por capas (`app`, `components`, `context`, `hooks`, `lib/api`, `pages`, `routes`, `services`, `styles`, `types`).【F:docs/arquitectura/04-Frontend.md†L9-L21】

Flujo principal vigente:

- `main.tsx` envuelve la app con `AuthProvider` y router.【F:FrontEnd/src/main.tsx†L1-L13】
- Router declara rutas públicas + protegidas con `SessionGuard` y `RoleGuard` (incluye `/orders` y `/admin`).【F:FrontEnd/src/routes/AppRouter.tsx†L1-L34】
- `AuthContext` gestiona `login/register/logout/me` y merge de carrito guest tras auth.【F:FrontEnd/src/context/AuthContext.tsx†L1-L90】
- `api/client.ts` centraliza fetch, bearer token y refresh de access token en `401` autenticado.【F:FrontEnd/src/lib/api/client.ts†L1-L89】

## 3) Organización real del BackEnd

- App Express con middlewares globales y montaje `/api/v1`.【F:BackEnd/src/app.ts†L1-L25】
- Rutas modulares por dominio (`auth/products/cart/favorites/orders/banners`).【F:BackEnd/src/routes/v1.ts†L1-L21】
- Prisma schema ya contempla roles y providers de autenticación (`LOCAL/GOOGLE/FACEBOOK/APPLE`).【F:BackEnd/prisma/schema.prisma†L10-L23】
- Auth actual implementada para flujo local (register/login/refresh/logout/me).【F:BackEnd/src/modules/auth/auth.routes.ts†L1-L28】【F:BackEnd/src/modules/auth/auth.service.ts†L1-L118】

---

## C. Archivos / carpetas posiblemente sin uso

> Criterio: marcados como “posiblemente sin uso” cuando no aparecen en cadena de imports/rutas activas o cuando pertenecen a un flujo antiguo incompatible.

## 1) Posiblemente sin uso real en `FrontEnd` (código muerto técnico)

1. `src/hooks/useProducts.ts`  
   - Usa métodos (`getAll/getFeatured/getById`) que **ya no existen** en `products.service` actual (API-first).【F:FrontEnd/src/hooks/useProducts.ts†L1-L10】【F:FrontEnd/src/services/products.service.ts†L1-L29】

2. `src/hooks/useCart.ts` y `src/store/useShopStore.ts`  
   - Dependen de `zustand`, `../domain` y métodos de carrito local (`saveCart/clearCart`) que no corresponden al servicio API actual.  
   - Esto rompe typecheck y revela código heredado de la etapa mock/localStorage.【F:FrontEnd/src/hooks/useCart.ts†L1-L53】【F:FrontEnd/src/store/useShopStore.ts†L1-L74】【F:FrontEnd/src/services/cart.service.ts†L1-L113】

3. `src/hooks/useHeaderData.ts` y `src/hooks/usePageUXState.ts`  
   - No están conectados al flujo principal (sin referencias de uso efectivo desde páginas/router activos).

4. `src/components/Header/Sidebar.tsx`  
   - No está incluido en `Header.tsx` ni en otras rutas/componentes activos.【F:FrontEnd/src/components/Header/Header.tsx†L1-L18】【F:FrontEnd/src/components/Header/Sidebar.tsx†L1-L42】

## 2) Carpetas de referencia visual (mantener con propósito explícito)

- `react-app/` completo: debe clasificarse formalmente como **legacy/reference UI sandbox**, no como frontend productivo principal, para evitar duplicidad y confusión de evolución.【F:docs/arquitectura/00-Resumen.md†L6-L41】

## 3) Carpetas placeholder válidas (no eliminar)

- `BackEnd/src/modules/users/` y `BackEnd/src/modules/admin/` están declaradas como reservadas para evolución futura; no son basura técnica, pero sí deuda organizacional si quedan indefinidas mucho tiempo.【F:BackEnd/src/modules/users/README.md†L1-L2】【F:BackEnd/src/modules/admin/README.md†L1-L2】

---

## D. Problemas de arquitectura encontrados

1. **Duplicidad de frontend en el mismo repo sin gobernanza operativa estricta**  
   Riesgo: cambios duplicados, bugs por “fuente de verdad” ambigua, onboarding lento.

2. **Mezcla de paradigmas de estado en `FrontEnd`** (API + tokens + contexto vs residuos de Zustand/local domain).  
   Riesgo: regressions, typecheck roto, falsa sensación de cobertura funcional.

3. **Auth social no implementada todavía, aunque el modelo está semi-preparado** (`authProvider/providerId` en `User`).【F:BackEnd/prisma/schema.prisma†L33-L49】  
   Riesgo: deuda en identity/linking y expansión futura desordenada.

4. **Refresh token persistido en texto plano** (`RefreshToken.token` único en DB).【F:BackEnd/prisma/schema.prisma†L53-L62】  
   Riesgo: seguridad si hay exfiltración de base.

5. **Tokens en localStorage en frontend actual** (access + refresh).【F:FrontEnd/src/lib/api/tokens.ts†L1-L31】  
   Riesgo: exposición frente a XSS; recomendable migrar refresh a cookie `HttpOnly`.

6. **UX/API acoplada en componentes “grandes” de homepage** (ej. `Featured.tsx` mezcla fetch + lógica de negocio + render complejo).【F:FrontEnd/src/components/Featured/Featured.tsx†L1-L214】

---

## E. Puntos de mejora priorizados

## P0 — Bloqueantes antes de escalar

1. **Arquitectura / mantenibilidad**
   - Problema: coexistencia de código nuevo + legado incompatible en `FrontEnd`.
   - Riesgo: build quality rota.
   - Mejora: retirar o aislar por feature-flag/legacy-folder los hooks/store obsoletos; typecheck en verde obligatorio.
   - Impacto: estabilidad de CI y reducción de deuda oculta.

2. **Seguridad de sesión**
   - Problema: refresh token en localStorage y en DB sin hash.
   - Riesgo: secuestro de sesión.
   - Mejora: refresh en cookie `HttpOnly+Secure+SameSite`, almacenar hash de refresh token en DB, rotación por uso.
   - Impacto: hardening real de auth.

3. **Claridad de producto**
   - Problema: `react-app` y `FrontEnd` sin frontera operativa estricta.
   - Riesgo: trabajo duplicado.
   - Mejora: declarar uno como `apps/web` (oficial) y otro como `apps/web-legacy`.
   - Impacto: roadmap claro.

## P1 — Importantes (siguiente iteración)

4. **Tipado y contratos API**
   - Problema: `types/api.ts` central, pero sin validación runtime de respuestas.
   - Mejora: usar `zod`/schemas también en cliente para parseo seguro.

5. **Consumo API y errores**
   - Problema: manejo de error disperso por página.
   - Mejora: capa de normalización + UI states unificados (`loading/error/empty/success`).

6. **Reutilización y legibilidad UI**
   - Problema: componentes con demasiada lógica (ej. `Featured`).
   - Mejora: separar en container + presentational + hooks por feature.

## P2 — Escalabilidad evolutiva

7. **Organización por dominios (feature-first)**
   - Migrar de estructura por tipo global a híbrida por feature (`auth`, `catalog`, `cart`, `orders`, `admin`).

8. **Observabilidad y testing**
   - FrontEnd oficial sin suite activa comparable a `react-app`; backend sin tests integrados visibles en scripts.

---

## F. Propuesta de autenticación completa (local + Google + Facebook + Apple)

## 1) Estado base aprovechable hoy

- Ya existe auth local con JWT (`register/login/refresh/logout/me`) y guards en frontend/backend.【F:BackEnd/src/modules/auth/auth.routes.ts†L1-L28】【F:FrontEnd/src/routes/guards.tsx†L1-L22】
- Prisma ya contempla `AuthProvider` (LOCAL/GOOGLE/FACEBOOK/APPLE).【F:BackEnd/prisma/schema.prisma†L15-L23】

## 2) Diseño recomendado aplicado a este proyecto

### a) Modelo de identidad (cambio clave)

Mantener `User` para perfil canónico (id, name, email, role, etc.) y crear tabla separada `AuthIdentity`:

- `id`
- `userId` (FK User)
- `provider` (`LOCAL|GOOGLE|FACEBOOK|APPLE`)
- `providerUserId` (sub/id del proveedor)
- `emailAtProvider`
- `emailVerifiedAtProvider`
- `createdAt/updatedAt`
- unique `(provider, providerUserId)`
- unique opcional `(userId, provider)`

**Por qué aquí:** evita sobrecargar `User.authProvider/providerId` para escenarios multi-vinculación (1 usuario, múltiples proveedores).

### b) Registro/Login local

- `POST /auth/register` (name,email,password)
- hash contraseña + crear `User` + `AuthIdentity(LOCAL)`
- enviar verificación email opcional (recomendado)

### c) Login social (Google/Facebook/Apple)

Flujo backend-driven con Authorization Code (+ PKCE para SPA):

1. Frontend pide `/auth/oauth/:provider/start`.
2. Backend responde URL autorizada + state/nonce/PKCE params.
3. Proveedor redirige a backend callback `/auth/oauth/:provider/callback`.
4. Backend intercambia `code` por tokens con proveedor.
5. Backend obtiene identidad (OIDC `sub` o user id provider).
6. Backend aplica algoritmo de vinculación de cuenta (ver abajo).
7. Backend emite sesión propia (access+refresh) y redirige al frontend.

### d) Algoritmo anti-duplicados (clave)

Al recibir identidad social:

1. Buscar `AuthIdentity(provider, providerUserId)`.
2. Si existe → login directo al `userId` asociado.
3. Si no existe:
   - buscar `User` por email normalizado.
   - si existe y email verificado por proveedor → vincular nueva `AuthIdentity` a ese `User`.
   - si existe pero email no verificado → pedir confirmación/reauth local.
   - si no existe → crear `User` + `AuthIdentity`.

### e) Recuperación de contraseña

Solo para cuentas con identidad LOCAL activa:

- `POST /auth/forgot-password` (token de un solo uso, expiración corta)
- `POST /auth/reset-password`
- no filtrar si email existe/no existe

### f) Sesión y tokens

- Access token corto (10–15 min) en memoria (frontend) o cookie.
- Refresh token largo (7–30 días) en cookie `HttpOnly` + rotación por uso.
- Revocación por dispositivo/sesión con tabla `RefreshSession` (token hash + userAgent + ip + expiresAt + revokedAt).

### g) Protección de rutas privadas

Mantener guards actuales, pero con:

- estado de sesión inicial robusto (hydration + retry único)
- `RoleGuard` apoyado en claims y/o endpoint `me`
- control de redirección segura post-login

---

## G. Recomendación técnica sobre OAuth 2 / OpenID Connect

## Cuándo usar qué

- **OAuth 2.0**: autorización para acceso a recursos de terceros.
- **OpenID Connect (OIDC)**: autenticación de usuario (identidad) sobre OAuth 2.

### Recomendación por proveedor en este sistema

- **Google**: usar OIDC (obtener `id_token` + validar `iss/aud/sub`).
- **Apple**: usar OIDC (es el camino natural para Sign in with Apple).
- **Facebook**: OAuth 2 para acceso + endpoint Graph para identidad (Facebook no opera como OIDC puro estándar en todos los escenarios).

### Estrategia unificada para convivir con registro local

- Internamente, todo termina en un `User` canónico + múltiples `AuthIdentity`.
- `authProvider` en `User` deja de ser “fuente única” y pasa a ser derivado (opcional) o se elimina en favor de `AuthIdentity`.
- Nunca usar email solo como PK de identidad externa; siempre `(provider, providerUserId)`.

### Datos a guardar de cada proveedor

- `provider`
- `providerUserId`
- `email` reportado por proveedor
- `email_verified` (si aplica)
- `name/picture` iniciales (como seed de perfil)
- metadata de auditoría (`lastLoginAt`, scopes otorgados opcional)

---

## H. Estructura de carpetas recomendada

## Frontend (React escalable, recomendado)

```text
FrontEnd/
  src/
    app/
      providers/            # AuthProvider, QueryProvider, etc.
      router/
        index.tsx
        guards/
      layout/
    config/
      env.ts
      constants.ts
    features/
      auth/
        pages/
        components/
        hooks/
        services/
        types/
      catalog/
      cart/
      orders/
      favorites/
      banners/
      admin/
    shared/
      components/ui/
      hooks/
      services/http/        # cliente API, interceptores, manejo errores
      utils/
      types/
      styles/
      assets/
    main.tsx
```

## Backend (sugerencia paralela)

```text
BackEnd/
  src/
    app.ts
    server.ts
    config/
    modules/
      auth/
        local/
        oauth/
        password-recovery/
      users/
      products/
      cart/
      orders/
      favorites/
      banners/
    shared/
      middleware/
      security/
      errors/
      utils/
      types/
    routes/
    prisma/
```

---

## I. Plan de refactor por fases

## Fase 1 — Limpieza y código muerto

- Retirar/aislar hooks y store legacy en `FrontEnd` (`useCart`, `useProducts`, `useShopStore`, etc.).
- Dejar `npm run typecheck` del FrontEnd en verde.

## Fase 2 — Reorganización estructural

- Renombrar y formalizar: frontend oficial vs legacy.
- Migrar a estructura por features (auth/catalog/cart/orders).

## Fase 3 — Estandarización de servicios/tipos

- Contratos API tipados + validación runtime.
- Error handling transversal y estados UX consistentes.

## Fase 4 — Auth local robusta

- Migrar refresh token a cookie HttpOnly + hash en DB + rotación.
- Endpoints forgot/reset password.

## Fase 5 — Login social

- Implementar Google/Facebook/Apple con callback backend + PKCE + state/nonce.
- Crear `AuthIdentity` y algoritmo de vinculación anti-duplicados.

## Fase 6 — Protección de rutas y sesión avanzada

- Guards con sesión rehidratada, control por rol y logout global por revocación.

## Fase 7 — Testing y hardening

- Pruebas unitarias/integración (auth, cart merge, oauth linking).
- Auditoría de seguridad (XSS/CSRF/session fixation), rate limiting más granular, observabilidad.

---

## Validación técnica del diagnóstico (comandos ejecutados)

- Se inspeccionó estructura y archivos fuente de `FrontEnd`, `BackEnd`, `react-app` y `docs/arquitectura`.
- Se ejecutó typecheck del FrontEnd para validar salud real (fallando actualmente por deuda de código legacy).
- Se ejecutó lint/typecheck del BackEnd (en verde).

