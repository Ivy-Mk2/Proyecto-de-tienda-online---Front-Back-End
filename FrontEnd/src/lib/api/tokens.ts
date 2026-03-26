const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const GUEST_TOKEN_KEY = 'guestToken';

const createGuestToken = () => `guest_${crypto.randomUUID()}`;

export const tokens = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string | null) => {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string | null) => {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  getGuestToken: () => {
    const existing = localStorage.getItem(GUEST_TOKEN_KEY);
    if (existing) return existing;

    const next = createGuestToken();
    localStorage.setItem(GUEST_TOKEN_KEY, next);
    return next;
  },
  clearGuestToken: () => localStorage.removeItem(GUEST_TOKEN_KEY),
};
