import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';
import { authService } from './auth.service';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, path: '/' });
};

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const { refreshToken, ...result } = await authService.register(name, email, password);
    setRefreshCookie(res, refreshToken);
    res.status(StatusCodes.CREATED).json(result);
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { refreshToken, ...result } = await authService.login(email, password);
    setRefreshCookie(res, refreshToken);
    res.json(result);
  },

  async google(req: Request, res: Response) {
    const { credential } = req.body;
    const { refreshToken, ...result } = await authService.google(credential);
    setRefreshCookie(res, refreshToken);
    res.json(result);
  },

  async facebook(req: Request, res: Response) {
    const { accessToken } = req.body;
    const { refreshToken, ...result } = await authService.facebook(accessToken);
    setRefreshCookie(res, refreshToken);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) throw new AppError(401, 'No refresh token');
    const result = await authService.refresh(refreshToken);
    res.json(result);
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
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
