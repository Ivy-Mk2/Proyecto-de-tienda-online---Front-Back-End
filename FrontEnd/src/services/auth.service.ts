import { AuthResponse, PublicUser } from '../types/api';
import { apiRequest } from '../lib/api/client';
import { tokens } from '../lib/api/tokens';

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const result = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
    });
    tokens.setAccessToken(result.accessToken);
    return result.user;
  },

  async login(input: { email: string; password: string }) {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
    });
    tokens.setAccessToken(result.accessToken);
    return result.user;
  },

  async me() {
    return apiRequest<PublicUser>('/auth/me', { auth: true });
  },

  async refresh() {
    return apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
  },

  async logout() {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
    });

    tokens.clearSession();
  },
};
