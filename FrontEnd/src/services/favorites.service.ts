import { apiRequest } from '../lib/api/client';

export type FavoriteItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
};

export const favoritesService = {
  list() {
    return apiRequest<FavoriteItem[]>('/favorites', { auth: true });
  },

  add(productId: string) {
    return apiRequest<FavoriteItem>(`/favorites/${productId}`, {
      method: 'POST',
      auth: true,
    });
  },

  remove(productId: string) {
    return apiRequest<void>(`/favorites/${productId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};
