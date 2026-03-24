import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(StatusCodes.CREATED).json(result);
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(StatusCodes.NO_CONTENT).send();
  },

  async me(req: Request, res: Response) {
    const result = await authService.me(req.authUser!.id);
    res.json(result);
  },
};
