import { Product } from '../../types/api';
import { useFeaturedProducts } from '../../hooks/useFeaturedProducts';

type FeaturedProductsProps = {
  onAddToCart: (productId: string) => Promise<void>;
};

const formatPrice = (price: string) => {
  const parsed = Number(price);
  if (Number.isNaN(parsed)) return price;
  return parsed.toFixed(2);
};

const productImage = (product: Product) => product.images[0]?.imageUrl;

export const FeaturedProducts = ({ onAddToCart }: FeaturedProductsProps) => {
  const { products, loading, error } = useFeaturedProducts();

  return (
    <section>
      <h2>Destacados</h2>

      {loading ? <p>Cargando destacados...</p> : null}
      {error ? <p className="error">No se pudieron cargar destacados: {error}</p> : null}

      {!loading && !error ? (
        products.length ? (
          <div className="grid">
            {products.map((product) => (
              <article className="card" key={product.id}>
                {productImage(product) ? (
                  <img
                    src={productImage(product)}
                    alt={product.images[0]?.altText ?? product.name}
                    style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                  />
                ) : (
                  <p>Sin imagen disponible</p>
                )}
                <h3>{product.name}</h3>
                <p>${formatPrice(product.price)}</p>
                <button onClick={() => void onAddToCart(product.id)}>Agregar al carrito</button>
              </article>
            ))}
          </div>
        ) : (
          <p>No hay productos destacados disponibles.</p>
        )
      ) : null}
    </section>
  );
};
