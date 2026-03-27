import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { Product } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';
import { cartService } from '../services/cart.service';
import { useAuth } from '../context/AuthContext';
import { FeaturedProducts } from '../components/home/FeaturedProducts';

export const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setProducts(await productsService.list({ category: selectedCategory }));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    void load();
  }, [selectedCategory]);

  const onAdd = async (productId: string) => {
    await cartService.addItem({
      productId,
      quantity: 1,
      isAuthenticated,
    });
  };

  return (
    <main className="container">
      <h1>Productos</h1>
      {selectedCategory ? <p>Categoría activa: {selectedCategory}</p> : null}
      <FeaturedProducts onAddToCart={onAdd} />
      {error ? <p className="error">{error}</p> : null}
      <section className="grid">
        {products.map((product) => (
          <article className="card" key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <button onClick={() => void onAdd(product.id)}>Agregar al carrito</button>
          </article>
        ))}
      </section>
    </main>
  );
};
