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
    tokens.setRefreshToken(result.refreshToken);
    return result.user;
  },

  async login(input: { email: string; password: string }) {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
    });
    tokens.setAccessToken(result.accessToken);
    tokens.setRefreshToken(result.refreshToken);
    return result.user;
  },

  async me() {
    return apiRequest<PublicUser>('/auth/me', { auth: true });
  },

  async logout() {
    const refreshToken = tokens.getRefreshToken();

    if (refreshToken) {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    }

    tokens.clearSession();
  },
};
