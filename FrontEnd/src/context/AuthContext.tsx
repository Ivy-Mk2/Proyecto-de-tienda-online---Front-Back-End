import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service';
import { cartService } from '../services/cart.service';
import { PublicUser, UserRole } from '../types/api';
import { tokens } from '../lib/api/tokens';

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async () => {
    // Always attempt to restore session.
    // If there's a valid access token, /auth/me succeeds directly.
    // If only the HttpOnly refresh cookie is present, apiRequest retries after refresh.
    // Both cases are handled transparently by the API client.
    try {
      const profile = await authService.me();
      setUser(profile);
    } catch {
      tokens.clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void syncUser();
  }, [syncUser]);

  const onAuthenticated = useCallback(async (profile: PublicUser) => {
    await cartService.mergeGuestCart();
    setUser(profile);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const profile = await authService.login({ email, password });
      await onAuthenticated(profile);
    },
    [onAuthenticated],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const profile = await authService.register({ name, email, password });
      await onAuthenticated(profile);
    },
    [onAuthenticated],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const profile = await authService.google(credential);
      await onAuthenticated(profile);
    },
    [onAuthenticated],
  );

  const loginWithFacebook = useCallback(
    async (accessToken: string) => {
      const profile = await authService.facebook(accessToken);
      await onAuthenticated(profile);
    },
    [onAuthenticated],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      hasRole: (role) => user?.role === role,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
    }),
    [user, loading, login, register, loginWithGoogle, loginWithFacebook, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
