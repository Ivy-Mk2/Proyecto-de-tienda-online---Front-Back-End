import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/auth.service';
import { cartService } from '../services/cart.service';
import { tokens } from '../lib/api/tokens';

vi.mock('../services/auth.service');
vi.mock('../services/cart.service');
vi.mock('../lib/api/tokens');

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'CUSTOMER' as const,
  authProvider: 'LOCAL',
  createdAt: new Date().toISOString(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(cartService.mergeGuestCart).mockResolvedValue({
    id: 'cart-1',
    items: [],
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('AuthContext', () => {
  describe('initial session restore', () => {
    it('sets user when me() resolves successfully', async () => {
      vi.mocked(authService.me).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('leaves user null when me() rejects (no valid session)', async () => {
      vi.mocked(authService.me).mockRejectedValue(new Error('Unauthorized'));
      vi.mocked(tokens.clearSession).mockReturnValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(tokens.clearSession).toHaveBeenCalledOnce();
    });

    it('starts with loading=true', () => {
      vi.mocked(authService.me).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('login', () => {
    it('sets user and triggers guest cart merge on success', async () => {
      vi.mocked(authService.me).mockRejectedValue(new Error('no session'));
      vi.mocked(authService.login).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(cartService.mergeGuestCart).toHaveBeenCalledOnce();
    });

    it('propagates error when login fails', async () => {
      vi.mocked(authService.me).mockRejectedValue(new Error('no session'));
      vi.mocked(authService.login).mockRejectedValue({ status: 401, message: 'Invalid credentials' });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => { await result.current.login('bad@email.com', 'wrong'); })
      ).rejects.toMatchObject({ message: 'Invalid credentials' });

      expect(result.current.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears user after logout', async () => {
      vi.mocked(authService.me).mockResolvedValue(mockUser);
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(authService.logout).toHaveBeenCalledOnce();
    });

    it('clears user even when logout API call fails', async () => {
      vi.mocked(authService.me).mockResolvedValue(mockUser);
      vi.mocked(authService.logout).mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      // logout has a try-finally so setUser(null) runs even on error,
      // but the error still propagates to the caller — catch it
      await act(async () => {
        await result.current.logout().catch(() => {});
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('returns true when user has the queried role', async () => {
      vi.mocked(authService.me).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      expect(result.current.hasRole('CUSTOMER')).toBe(true);
      expect(result.current.hasRole('ADMIN')).toBe(false);
    });

    it('returns false when no user is set', async () => {
      vi.mocked(authService.me).mockRejectedValue(new Error('no session'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasRole('CUSTOMER')).toBe(false);
    });
  });
});
