import { useState } from 'react';
import { Link } from 'react-router-dom';
import useDropdown from '../Hooks/hooks';
import { useCartData } from '../../hooks/useCartData';
import { OptimizedImage } from '../ui';
import './CartDropdown.css';

const PEN_FORMATTER = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const CartDropdown = () => {
  const { isActive, toggleDropdown, dropdownRef, dropdownRefIcon, setIsActive } =
    useDropdown<HTMLDivElement>();
  const { items, cartCount, subtotal, loading, error, refresh, removeItem, updateItemQuantity } =
    useCartData();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const closeDropdown = () => setIsActive(false);

  const handleChangeQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setPendingItemId(itemId);
      await updateItemQuantity(itemId, quantity);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setPendingItemId(itemId);
      await removeItem(itemId);
    } finally {
      setPendingItemId(null);
    }
  };

  return (
    <div className="cart">
      <div
        className="header__icon"
        onClick={toggleDropdown}
        ref={dropdownRefIcon}
        aria-label="Abrir carrito"
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            toggleDropdown(event);
          }
        }}
      >
        <i className="fa-solid fa-basket-shopping"></i>
      </div>
      <div className="cart__header">
        <Link className="cart__header-text" to="/cart">
          Carrito
        </Link>
        <span className="cart__header-number">({cartCount})</span>
      </div>

      <div className={`backdrop ${isActive ? 'active' : ''}`}></div>
      <div className={`cart__dropdown ${isActive ? 'cart__dropdown-active' : ''}`} ref={dropdownRef}>
        <div className="dropdown__title">
          <i className="fa-solid fa-basket-shopping"></i>
          <div className="title__container">
            <span className="tittle__header">Mi Carrito</span>
            <span className="cart__total" id="cart__total">
              <span>{cartCount}</span>
            </span>
          </div>
          <button aria-label="Cerrar carrito" onClick={closeDropdown}>
            <i className="fa-solid fa-x"></i>
          </button>
        </div>

        {loading ? (
          <div className="cart-empty">
            <p>Cargando carrito...</p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="cart-empty">
            <p className="cart__error">{error}</p>
            <button className="cart__retry" onClick={() => void refresh()}>
              Reintentar
            </button>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <i className="fa-solid fa-basket-shopping"></i>
            </div>
            <div className="cart-empty-message">
              <h1>Tu carrito está vacío</h1>
              <p>Agrega productos y consigue envío gratis</p>
            </div>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="cart-active">
            <div className="dropdown__products">
              {items.map((item) => {
                const image = item.product.images[0];
                const itemTotal = Number(item.priceSnapshot) * item.quantity;
                const isPending = pendingItemId === item.id;

                return (
                  <div className="products-container" key={item.id}>
                    <button
                      className="remove-item"
                      onClick={() => void handleRemoveItem(item.id)}
                      disabled={isPending}
                      aria-label={`Quitar ${item.product.name} del carrito`}
                    >
                      <i className="fa-solid fa-x"></i>
                    </button>
                    <div className="product-img-container">
                      <OptimizedImage
                        src={image?.imageUrl}
                        alt={image?.altText ?? item.product.name}
                        className="header__dropdown-product-img"
                      />
                    </div>
                    <div className="dropdown__info-container">
                      <h1 className="product-title">{item.product.name}</h1>
                      <p>{PEN_FORMATTER.format(itemTotal)}</p>
                      <div className="quantity">
                        <button
                          className="quantity__button"
                          disabled={isPending || item.quantity <= 1}
                          onClick={() => void handleChangeQuantity(item.id, item.quantity - 1)}
                          aria-label={`Disminuir cantidad de ${item.product.name}`}
                        >
                          -
                        </button>
                        <p>{item.quantity}</p>
                        <button
                          className="quantity__button"
                          disabled={isPending}
                          onClick={() => void handleChangeQuantity(item.id, item.quantity + 1)}
                          aria-label={`Aumentar cantidad de ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="dropdown__info">
              <div className="totals-info">
                <div>
                  <span>Productos</span>
                  <span>{PEN_FORMATTER.format(subtotal)}</span>
                </div>
                <div>
                  <span>Envío</span>
                  <span>A coordinar</span>
                </div>
                <div>
                  <span>Total parcial</span>
                  <span>{PEN_FORMATTER.format(subtotal)}</span>
                </div>
              </div>
              <div className="payments-buttons">
                <button onClick={closeDropdown}>Seguir comprando</button>
                <Link className="payments-buttons__link" to="/cart" onClick={closeDropdown}>
                  Ir al carrito
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CartDropdown;
