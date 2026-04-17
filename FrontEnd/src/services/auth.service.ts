import { AuthResponse, PublicUser } from '../types/api';
import { apiRequest } from '../lib/api/client';
import { tokens } from '../lib/api/tokens';

const persistSession = (result: AuthResponse) => {
  tokens.setAccessToken(result.accessToken);
  tokens.setRefreshToken(result.refreshToken);
  return result.user;
};

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const result = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
    });

    return persistSession(result);
  },

  async login(input: { email: string; password: string }) {
    const result = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
    });

    return persistSession(result);
  },

  async google(credential: string) {
    const result = await apiRequest<AuthResponse>('/auth/google', {
      method: 'POST',
      body: { credential },
    });

    return persistSession(result);
  },

  async facebook(accessToken: string) {
    const result = await apiRequest<AuthResponse>('/auth/facebook', {
      method: 'POST',
      body: { accessToken },
    });

    return persistSession(result);
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
