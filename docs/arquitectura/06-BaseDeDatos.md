# 06-BaseDeDatos

## Modelo conceptual

### Entidades principales
- **User**: identidad, rol, proveedor auth.
- **Product**: catálogo, precio, stock, atributos, activo/destacado.
- **Cart**: carrito por usuario o invitado.
- **Order**: orden de compra con estado y pago.
- **Favorite**: relación usuario-producto favorito.
- **Banner**: contenido promocional.

## Relaciones clave
- Un `User` puede tener múltiples `Order`, `Favorite` y `RefreshToken`.
- `Cart` se asocia a `User` (opcional) o `guestToken`.
- `Cart` contiene múltiples `CartItem`, cada uno asociado a un `Product`.
- `Order` contiene múltiples `OrderItem` con snapshots de datos.

## ERD (Mermaid)
```mermaid
erDiagram
  User ||--o{ RefreshToken : has
  User ||--o| Cart : owns
  User ||--o{ Favorite : marks
  User ||--o{ Order : places

  Product ||--o{ ProductImage : has
  Product ||--o{ CartItem : in
  Product ||--o{ Favorite : saved
  Product ||--o{ OrderItem : snapshot

  Cart ||--o{ CartItem : contains
  Order ||--o{ OrderItem : contains

  User {
    string id PK
    string email
    string role
    string authProvider
  }
  Product {
    string id PK
    string name
    decimal price
    int stock
    boolean isActive
  }
  Cart {
    string id PK
    string userId FK
    string guestToken
  }
  Order {
    string id PK
    string userId FK
    decimal total
    string paymentStatus
  }
  Favorite {
    string id PK
    string userId FK
    string productId FK
  }
  Banner {
    string id PK
    string title
    string imageUrl
    boolean isActive
  }
```

## Nota de diseño
El modelo ya contempla evolución hacia OAuth y pasarelas de pago reales sin rediseño total.
