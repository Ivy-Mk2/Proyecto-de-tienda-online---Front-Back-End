# Reporte de código no utilizado tras la migración al nuevo frontend 808xHz

**Fecha:** 2026-05-02
**Alcance:** `FrontEnd/src/` (frontend oficial)
**Rama:** `IntegracionUI`

---

## 1) Metodología

Se trazaron las dependencias estáticas a partir del punto de entrada `src/main.tsx`:

```
main.tsx
 ├─ AuthProvider        (context/AuthContext.tsx)
 └─ AppRouter           (routes/AppRouter.tsx)
       ├─ Layout         (app/Layout.tsx)
       ├─ guards         (routes/guards.tsx)
       └─ pages/*        (12 páginas)
              └─ Shell808 (components/Shell808/Shell808.tsx)
              └─ services/* + hooks/* + lib/api/*
```

Para cada archivo bajo `components/` y `features/` se revisó si algún módulo del grafo activo lo importa. Los archivos sin referencia entrante (o cuyas únicas referencias son otros archivos también huérfanos) se marcan como **no utilizados**.

Comandos de verificación: `Grep` sobre `from '...'`, exclusión por carpeta, lectura puntual de cada componente UI activo.

---

## 2) Resumen ejecutivo

- **Tras la migración 808xHz**, las páginas (`HomePage`, `LoginPage`, `RegisterPage`, etc.) reimplementaron internamente sus propios `Header`, `Footer`, `Sidebar`, `Hero`, `Featured`, `SaleBanner`, `SpecialBanners`, `Marquee`, `ProductCard`, etc. (ver `pages/HomePage.tsx:51-542` y `components/Shell808/Shell808.tsx`).
- Como consecuencia, **toda la familia de componentes “legacy” bajo `src/components/`** dejó de tener consumidores, salvo `Shell808/`.
- Toda la carpeta `src/features/featured/` también quedó huérfana (su único punto de entrada era `components/Featured/Featured.tsx`, ya muerto).
- La librería `src/components/ui/` (Button/Card/Input/Modal/Badge/PageStatus/OptimizedImage) **no la consume ninguna página activa**; la única referencia (`OptimizedImage`) está dentro de `Header/CartDropdown`, también huérfano.
- En `app/Layout.tsx` se siguen importando `Header` y `Footer`, pero la condición `usesShell808` desactiva su renderizado en **todas las rutas reales** salvo `/forbidden`. `ForbiddenPage` no usa Header/Footer en su markup, así que en la práctica esos componentes nunca se montan.

**Estimación de eliminación segura:** ~32 archivos `.tsx`/`.ts`/`.css` y 2 carpetas (`features/featured/`, casi todo `components/` excepto `Shell808/`).

---

## 3) Inventario completo

### 3.1 Componentes sin uso (eliminables)

| Carpeta / archivo | ¿Lo importa alguien activo? | Notas |
|---|---|---|
| `components/Announcement/Announcement.tsx` | No | Reemplazado por el `Ticker` interno de `HomePage`/`Shell808`. |
| `components/Announcement/Announcement.css` | No | — |
| `components/Banner/Banner.tsx` | No | El hero/banner ahora vive inline en `HomePage` (`Hero`, `SpecialBanners`). Solo el **tipo** `Banner` desde `types/api` se sigue usando. |
| `components/Banner/Banner.css` | No | — |
| `components/BodySection/BodySection.tsx` | No | Reemplazado por `Categories` inline en `HomePage`. |
| `components/BodySection/BodySection.css` | No | — |
| `components/Featured/Featured.tsx` | No | `HomePage` define su propio `Featured` y `ProductCard` inline. |
| `components/Featured/Featured.css` | No | — |
| `components/Footer/Footer.tsx` | Sí (`Layout.tsx`), pero nunca renderiza | La condición `usesShell808` cubre todas las rutas registradas. Mientras Layout siga sin rutas que la requieran, el archivo es código muerto en runtime. |
| `components/Footer/Footer.css` | Idem | — |
| `components/Header/Header.tsx` | Sí (`Layout.tsx`), pero nunca renderiza | Mismo caso que `Footer`. |
| `components/Header/Header.css` | Idem | — |
| `components/Header/CartDropdown.tsx` | Solo lo importa `Header.tsx` (muerto) | Importa además `OptimizedImage` desde `ui/`. |
| `components/Header/CartDropdown.css` | Idem | — |
| `components/Header/Logo.tsx` | Solo `Header.tsx` (muerto) | — |
| `components/Header/User.tsx` | Solo `Header.tsx` (muerto) | Importa `useDropdown` desde `Hooks/hooks`. |
| `components/home/FeaturedProducts.tsx` | No | Reemplazado por `Featured` inline en `HomePage`. |
| `components/Hooks/hooks.tsx` | Solo `Header/CartDropdown.tsx` y `Header/User.tsx` (ambos muertos) | Custom hook `useDropdown`, sin consumidores activos. |
| `components/Marquee/Marquee.tsx` | No | `HomePage` define `SplitMarquee` y `Ticker` inline. |
| `components/Marquee/Marquee.module.css` | No | — |
| `components/Newsletter/Newsletter.tsx` | No | El newsletter ahora vive dentro del `Footer808` inline de `HomePage`/`Shell808`. |
| `components/Newsletter/Newsletter.css` | No | — |
| `components/SaleBanner/SaleBanner.tsx` | No | `HomePage` define `SaleBanner` inline. |
| `components/SaleBanner/SaleBanner.css` | No | — |
| `components/SpecialBanner/SpecialBanner.tsx` | No | `HomePage` define `SpecialBanners` inline. |
| `components/SpecialBanner/SpecialBanner.css` | No | — |

**Total componentes legacy huérfanos:** 26 archivos.

### 3.2 Librería UI base (`components/ui/`) — sin consumidores activos

Único uso: `Header/CartDropdown.tsx:5` importa `OptimizedImage`. CartDropdown ya no se renderiza, así que toda la subcarpeta es elegible para borrado.

| Archivo | Estado |
|---|---|
| `components/ui/Badge.tsx` | Solo lo usa `PageStatus` (tampoco activo) |
| `components/ui/Button.tsx` | Solo lo usan `Modal` y `PageStatus` |
| `components/ui/Card.tsx` | Solo lo usan `Modal` y `PageStatus` |
| `components/ui/Input.tsx` | Sin uso |
| `components/ui/Modal.tsx` | Sin uso |
| `components/ui/OptimizedImage.tsx` | Solo lo usa `CartDropdown` (muerto) |
| `components/ui/PageStatus.tsx` | Sin uso |
| `components/ui/index.ts` | Re-export barrel; solo lo lee `CartDropdown` |

**Total UI huérfana:** 8 archivos.

### 3.3 Feature module (`features/featured/`) — totalmente huérfano

| Archivo | Estado |
|---|---|
| `features/featured/components/FeaturedContainer.tsx` | Solo lo importa `components/Featured/Featured.tsx` (muerto) |
| `features/featured/components/FeaturedView.tsx` | Idem |
| `features/featured/hooks/useFeatured.ts` | Idem |

**Total feature huérfana:** 3 archivos + 2 carpetas vacías al borrar.

### 3.4 Otros hallazgos menores

- `services/products.service.ts` exporta dos objetos: `productService` (camel) y `productsService` (alias con `listFeatured`). El alias `productsService` lo consumen las páginas y `hooks/useFeaturedProducts.ts`. La referencia directa `productService` solo aparece en `features/featured/hooks/useFeatured.ts` (huérfano). Al eliminar la feature, se puede simplificar `products.service.ts` a un solo objeto.
- `hooks/useFeaturedProducts.ts` y `features/featured/hooks/useFeatured.ts` son **dos hooks que hacen lo mismo** (listar featured products). El segundo es el que sobra.
- `LoginPage.tsx:17` declara `oauthSource` y solo lo usa para mostrar un mensaje en error de OAuth (línea 127). No se elimina, pero conviene también limpiar `accessToken` y `oauth` de la URL después de procesarlos (hoy quedan en la barra de direcciones).
- En `app/Layout.tsx` la lista `usesShell808` repite manualmente todas las rutas. Si en el futuro se vuelve a usar el header/footer legacy, hay que mantener esa lista sincronizada con `AppRouter`. Mejor opción: eliminar el condicional y dejar `<Outlet />` solo, dado que cada página ya envuelve su propio `Shell808`.

---

## 4) Acciones recomendadas

### 4.1 Borrado seguro (P0)

Eliminar las siguientes carpetas/archivos en una sola PR, con `tsc --noEmit` + `vite build` como red de seguridad:

```
FrontEnd/src/components/Announcement/
FrontEnd/src/components/Banner/
FrontEnd/src/components/BodySection/
FrontEnd/src/components/Featured/
FrontEnd/src/components/Footer/
FrontEnd/src/components/Header/
FrontEnd/src/components/home/
FrontEnd/src/components/Hooks/
FrontEnd/src/components/Marquee/
FrontEnd/src/components/Newsletter/
FrontEnd/src/components/SaleBanner/
FrontEnd/src/components/SpecialBanner/
FrontEnd/src/components/ui/
FrontEnd/src/features/
```

Y limpiar en `app/Layout.tsx`:

```diff
- import Header from '../components/Header/Header';
- import Footer from '../components/Footer/Footer';
- ...
- const usesShell808 = [...].some(...);
- {!usesShell808 && <Header />}
- {!usesShell808 && <Footer />}
+ // Layout vacío: cada página decide si usa Shell808
```

### 4.2 Simplificación opcional (P1)

- Borrar el alias `productsService` y dejar solo `productService` (renombrando los imports en pages/hooks). Es trabajo de búsqueda y reemplazo en 4-5 archivos.
- Eliminar `hooks/useFeaturedProducts.ts` o `features/featured/hooks/useFeatured.ts`. Como `features/` se elimina entera en 4.1, ya queda resuelto.

### 4.3 Verificación

Después del borrado:

```bash
cd FrontEnd
npm run typecheck      # tsc --noEmit
npm run build          # vite build
npm run dev            # smoke en navegador: HomePage, Login, Register, Cart, Orders, Profile, Admin, Forbidden
```

`/forbidden` es el único caso que actualmente dependía (en teoría) de Header/Footer del Layout. Validar que se ve aceptable sin shell, o envolverlo también en `Shell808` por consistencia visual.

---

## 5) Impacto estimado

- **Archivos eliminados:** ~37 (.tsx/.ts/.css).
- **Líneas removidas:** ~1.500-2.000 LOC aproximadas.
- **Bundle final:** se espera reducción dado que Vite igual hace tree-shaking, pero borrar reduce superficie de mantenimiento, evita confusión a nuevos contributors y elimina varios hooks/CSS sin tests.
- **Riesgo:** bajo. No hay imports externos al frontend que apunten a estas carpetas, y `tsc --noEmit` detecta cualquier ruptura antes del deploy.

---

## 6) Conclusión

La migración al diseño 808xHz dejó como residuo prácticamente toda la antigua `components/` y la carpeta `features/featured/`. Hoy el frontend funciona con apenas:

- 12 páginas en `pages/`
- 1 shell común (`components/Shell808/Shell808.tsx`)
- contexto + servicios + hooks + lib/api

El resto puede borrarse en una sola PR sin afectar funcionalidad. Es la limpieza con mejor relación costo/beneficio antes de cerrar la rama `IntegracionUI`.
