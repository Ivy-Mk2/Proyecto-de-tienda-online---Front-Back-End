const ACCESS_TOKEN_KEY = 'accessToken';
const GUEST_TOKEN_KEY = 'guestToken';

const createGuestToken = () => `guest_${crypto.randomUUID()}`;

export const tokens = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string | null) => {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
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
