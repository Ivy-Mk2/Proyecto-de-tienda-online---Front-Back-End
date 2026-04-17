import { Request, Response } from 'express';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { env } from '../../config/env';
import { authService } from './auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getRefreshTokenFromCookie = (req: Request) => {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) return null;

  const cookieEntry = rawCookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${REFRESH_COOKIE_NAME}=`));

  if (!cookieEntry) return null;
  return decodeURIComponent(cookieEntry.split('=').slice(1).join('='));
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/v1/auth',
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
};

export const authController = {
  async google(req: Request, res: Response) {
    const state = crypto.randomUUID();
    const redirectUrl = authService.getGoogleAuthorizationUrl(state);
    res.redirect(redirectUrl);
  },

  async googleCallback(req: Request, res: Response) {
    const code = typeof req.query.code === 'string' ? req.query.code : null;
    if (!code) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing OAuth code' });
      return;
    }

    const result = await authService.loginWithGoogle(code);
    setRefreshCookie(res, result.refreshToken);
    const frontendTarget = `${env.CORS_ORIGIN}/login?oauth=google&accessToken=${encodeURIComponent(result.accessToken)}`;
    res.redirect(frontendTarget);
  },

  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    setRefreshCookie(res, result.refreshToken);
    res.status(StatusCodes.CREATED).json(result);
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = getRefreshTokenFromCookie(req) ?? req.body?.refreshToken;
    if (!refreshToken) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing refresh token' });
      return;
    }

    const result = await authService.refresh(refreshToken);
    setRefreshCookie(res, result.refreshToken);
    res.json(result);
  },

  async logout(req: Request, res: Response) {
    const refreshToken = getRefreshTokenFromCookie(req) ?? req.body?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
    res.status(StatusCodes.NO_CONTENT).send();
  },

  async me(req: Request, res: Response) {
    const result = await authService.me(req.authUser!.id);
    res.json(result);
  },
};
