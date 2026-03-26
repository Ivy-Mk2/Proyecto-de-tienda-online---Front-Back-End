import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Featured from '../components/Featured/Featured';
import './CartPage.css';
import { Badge, OptimizedImage, PageStatus } from '../components/ui';
import { useCart } from '../hooks/useCart';
import { usePageUXState } from '../hooks/usePageUXState';

const CartTotal = () => {
  const { cartItems, totals, updateQuantity, removeFromCart } = useCart();
  const { pageState, retry, successMessage, showSuccess } = usePageUXState();

  if (pageState === 'loading') {
    return <PageStatus state="loading" title="Cargando carrito" description="Actualizando resumen de compra." />;
  }

  if (pageState === 'error') {
    return (
      <PageStatus
        state="error"
        title="No se pudo cargar carrito"
        description="Intenta recargar la página."
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <div className="cart-total">
        <Header />
        <div className="cart-total__container">
          {cartItems.length > 0 ? (
            <div className="cart-total__active">
              <div className="cart-total__title">
                <h1>Carrito de compras</h1>
                {successMessage ? <Badge variant="success">{successMessage}</Badge> : null}
              </div>
              <div className="cart-total__info">
                <div className="product-list">
                  {cartItems.map((item) => (
                    <div className="product-list__card" key={item.id}>
                      <div className="cart-total__product-img">
                        <OptimizedImage src={item.product.primaryImg} alt={item.product.name} />
                      </div>
                      <div className="cart-total__product-description">
                        <span className="product-name">{item.product.name}</span>
                        <div className="product__description">
                          <div className="product-color">
                            <p>Color:</p>
                            <span>Black</span>
                          </div>
                          <div className="product-size-cart">
                            <p>Tamaño:</p>
                            <span>{item.size ?? 'S'}</span>
                          </div>
                          <div className="product-quantity">
                            <p>Quantity:</p>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) => {
                                updateQuantity(item.productId, Number(event.target.value) || 1);
                                showSuccess('Cantidad actualizada');
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="cart-total__product-buttons">
                        <div className="cart-price">
                          <span>${item.subtotal.toFixed(2)}</span>
                        </div>
                        <button
                          className="cart-delete"
                          onClick={() => {
                            removeFromCart(item.productId);
                            showSuccess('Producto eliminado del carrito');
                          }}
                        >
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="product__summary">
                  <h2>Resumen de compra</h2>
                  <div className="product__detail">
                    <div className="cart-total__product">
                      <span>Productos ({cartItems.length})</span>
                      <span>S/ {totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="cart-shipping">
                      <span>Envíos</span>
                      <span>S/ {totals.shipping.toFixed(2)}</span>
                    </div>
                    <div className="cart-total__total">
                      <span>Total</span>
                      <span>S/ {totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="cart-total__button">Continuar compra</button>
                </div>
              </div>
            </div>
          ) : (
            <PageStatus
              state="empty"
              title="Tu carrito está vacío"
              description="Agrega productos y consigue envío gratis."
            />
          )}
        </div>
        <div className="featured__container">
          <Featured
            title={'Quizas te puedan interesar'}
            customClass={'featured__title--small'}
            productClass={'product-card-cart'}
            featuredClass={'featured-cart'}
          />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default CartTotal;
