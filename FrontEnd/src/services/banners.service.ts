import { apiRequest } from '../lib/api/client';
import { Banner } from '../types/api';

export const bannersService = {
  list() {
    return apiRequest<Banner[]>('/banners');
  },
};
