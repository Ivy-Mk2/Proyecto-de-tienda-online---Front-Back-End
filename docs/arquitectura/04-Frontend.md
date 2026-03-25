# 04-Frontend

## Propuesta de estructura (React + Vite)
```text
FrontEnd/
  src/
    pages/
    components/
    services/
    hooks/
    routes/
    store/ (o context/)
    utils/
    types/
```

## Responsabilidad por carpeta
- `pages/`: pantallas de negocio (Home, ProductDetail, Cart, Checkout, Login, Admin).
- `components/`: piezas reutilizables (cards, navbar, forms, modals).
- `services/`: cliente HTTP y funciones por dominio (`authService`, `productService`, etc.).
- `hooks/`: lógica reutilizable de UI/estado (`useAuth`, `useCart`, `useProducts`).
- `routes/`: definición de rutas públicas/privadas y guards por rol.
- `store/` o `context/`: estado global (sesión, carrito, favoritos).

## Flujo de consumo de API desde React
```mermaid
flowchart LR
  UI[Componente/Página] --> HK[Hook]
  HK --> SV[Service FrontEnd]
  SV -->|fetch/axios| API[/api/v1/*]
  API --> SV
  SV --> HK
  HK --> UI
```

## Reglas recomendadas de integración
- Mantener DTOs tipados por endpoint en `types/`.
- Centralizar token JWT y refresh en capa `services/auth`.
- Separar estado de sesión y estado de catálogo/carrito.
