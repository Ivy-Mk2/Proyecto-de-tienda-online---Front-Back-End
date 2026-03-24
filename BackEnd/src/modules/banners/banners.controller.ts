import { Request, Response } from 'express';
import { bannersService } from './banners.service';

export const bannersController = {
  async list(req: Request, res: Response) {
    const isAdmin = req.authUser?.role === 'ADMIN';
    res.json(await bannersService.list(isAdmin));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await bannersService.create(req.body));
  },

  async update(req: Request, res: Response) {
    res.json(await bannersService.update(req.params.id, req.body));
  },

  async remove(req: Request, res: Response) {
    await bannersService.remove(req.params.id);
    res.status(204).send();
  },
};
