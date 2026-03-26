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
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async () => {
    const hasToken = Boolean(tokens.getAccessToken() || tokens.getRefreshToken());

    if (!hasToken) {
      setUser(null);
      setLoading(false);
      return;
    }

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

  const login = useCallback(async (email: string, password: string) => {
    const profile = await authService.login({ email, password });
    await cartService.mergeGuestCart();
    setUser(profile);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const profile = await authService.register({ name, email, password });
    await cartService.mergeGuestCart();
    setUser(profile);
  }, []);

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
      logout,
    }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
