import { apiRequest } from '../lib/api/client';
import { BodySection } from '../types/api';

export const bodySectionsService = {
  list() {
    return apiRequest<BodySection[]>('/products/body-sections');
  },
};
