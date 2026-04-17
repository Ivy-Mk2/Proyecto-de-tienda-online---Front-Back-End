import { useAuth } from '../../../context/AuthContext';
import { useFeatured } from '../hooks/useFeatured';
import { FeaturedView } from './FeaturedView';

export const FeaturedContainer = () => {
  const { isAuthenticated } = useAuth();
  const {
    products,
    loading,
    error,
    favoriteIds,
    skeletonItems,
    loadFeatured,
    addToCart,
    toggleFavorite,
  } = useFeatured({ isAuthenticated });

  return (
    <FeaturedView
      products={products}
      loading={loading}
      error={error}
      favoriteIds={favoriteIds}
      skeletonItems={skeletonItems}
      onRetry={loadFeatured}
      onAddToCart={addToCart}
      onToggleFavorite={toggleFavorite}
    />
  );
};
