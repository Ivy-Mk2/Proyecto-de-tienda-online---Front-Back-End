# Análisis del proyecto: estado actual y próximos pasos

Fecha del análisis: 25 de marzo de 2026.

## 1) Estado actual del proyecto

## 1.1 Visión general

- El repositorio está estructurado con dos carpetas principales: `BackEnd` y `FrontEnd`.
- En el estado actual del entorno revisado, el código funcional está concentrado en `BackEnd`.
- `FrontEnd` no presenta archivos de implementación visibles en esta revisión local.

## 1.2 Backend: madurez y arquitectura

El backend tiene una base sólida de MVP para e-commerce:

- Stack: **Node.js + Express + TypeScript + Prisma + MySQL**.
- Seguridad base: **helmet**, **cors**, **rate limit** en auth, y validaciones con **Zod**.
- Arquitectura modular por dominio: `auth`, `products`, `cart`, `favorites`, `orders`, `banners`, `uploads`.
- Versionado de API por ruta: `/api/v1`.

## 1.3 Modelo de datos

El schema Prisma está bien planteado para crecer:

- Usuarios con roles (`ADMIN`, `CUSTOMER`) y base preparada para OAuth (`authProvider`, `providerId`).
- Catálogo de productos con imágenes.
- Carrito para usuario autenticado y carrito de invitado.
- Favoritos y órdenes con snapshots de precio/nombre.
- Banners administrables.

## 1.4 Operatividad

- Existen scripts de desarrollo, build, prisma y seed.
- Hay datos semilla para acelerar pruebas funcionales.
- El proyecto está orientado a migrar desde frontend con mocks/localStorage hacia API real.

## 2) Hallazgos de riesgo (priorizados)

## P0 (alta prioridad)

1. **Type-check fallando** (`npm run lint`):
   - Hay errores de tipado en la firma de `jsonwebtoken` en `src/shared/utils/jwt.ts`.
   - Impacto: se bloquea la verificación de calidad en CI y se incrementa el riesgo de regresiones.

2. **Riesgo de exponer `passwordHash` en respuestas de auth**:
   - En `register/login` se retorna objeto `user` completo.
   - Impacto: filtración de datos sensibles.

3. **Control de acceso incompleto en carrito de invitado**:
   - Mutaciones por `itemId` sin validación fuerte de pertenencia para flujo guest.
   - Impacto: posible manipulación de carrito ajeno si se conoce un `itemId`.

## P1 (media prioridad)

4. **Manejo de errores JWT mejorable**:
   - Errores de verificación de token pueden terminar en 500 genérico en lugar de 401 consistente.

5. **Ausencia de suite de tests automatizados visible**:
   - No se observaron pruebas unitarias/integración en el backend revisado.

## P2 (mejora evolutiva)

6. **Falta de frontend integrado en este entorno**:
   - Impide validar end-to-end y experiencia completa de usuario.

7. **Endurecimiento adicional recomendado**:
   - Rotación/revocación avanzada de refresh tokens.
   - Auditoría de seguridad de inputs sensibles y hardening de endpoints críticos.

## 3) Próximos pasos recomendados

## Semana 1: estabilización técnica

1. Corregir tipado JWT y dejar `npm run lint` en verde.
2. Sanitizar respuestas de auth para nunca exponer `passwordHash`.
3. Endurecer autorización del carrito guest (asociación estricta por `guestToken`).
4. Normalizar errores de autenticación/autorización (401/403 coherentes).

## Semana 2: calidad y confiabilidad

5. Implementar tests mínimos:
   - Auth: register/login/refresh/logout/me.
   - Cart: add/update/remove/merge.
   - Products: permisos admin.
6. Definir pipeline CI con lint + tests + build.

## Semana 3: integración funcional

7. Conectar (o incorporar) el frontend para pruebas E2E reales.
8. Validar contrato API-frontend (payloads, errores, estados).
9. Revisar CORS y variables de entorno por ambiente (`dev/stage/prod`).

## Semana 4: preparación de crecimiento

10. Diseñar rotación de refresh token y políticas de sesión.
11. Agregar observabilidad básica (logs estructurados + trazas de errores).
12. Planificar módulos de pago real y OAuth sobre la base ya existente.

## 4) Definición de “proyecto sano” (criterios de salida)

Se considera estable cuando:

- `lint`, `build` y tests pasan en CI.
- No hay exposición de datos sensibles en responses.
- Endpoints críticos tienen autorización consistente.
- Existe validación E2E básica con frontend integrado.
- Hay checklist de despliegue y rollback por ambiente.

---

Si se sigue este orden, el proyecto puede pasar de **MVP funcional** a **base robusta para producción inicial** sin reescrituras grandes.
