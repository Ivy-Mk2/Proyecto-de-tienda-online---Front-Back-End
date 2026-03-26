import { ApiError } from '../../types/api';
import { tokens } from './tokens';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

let refreshPromise: Promise<string | null> | null = null;

const buildApiError = async (response: Response): Promise<ApiError> => {
  let payload: { message?: string; issues?: unknown } | null = null;

  try {
    payload = (await response.json()) as { message?: string; issues?: unknown };
  } catch {
    payload = null;
  }

  return {
    status: response.status,
    message: payload?.message ?? `HTTP ${response.status}`,
    issues: payload?.issues,
  };
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokens.getRefreshToken();
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      tokens.clearSession();
      return null;
    }

    const data = (await response.json()) as { accessToken: string };
    tokens.setAccessToken(data.accessToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {};

  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth) {
    const token = tokens.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth && options.retry !== false) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      return apiRequest<T>(path, { ...options, retry: false, auth: true });
    }
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
