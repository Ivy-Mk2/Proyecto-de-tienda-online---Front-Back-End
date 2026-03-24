import { Request, Response } from 'express';
import { favoritesService } from './favorites.service';

export const favoritesController = {
  async list(req: Request, res: Response) {
    res.json(await favoritesService.list(req.authUser!.id));
  },

  async add(req: Request, res: Response) {
    const item = await favoritesService.add(req.authUser!.id, req.params.productId);
    res.status(201).json(item);
  },

  async remove(req: Request, res: Response) {
    await favoritesService.remove(req.authUser!.id, req.params.productId);
    res.status(204).send();
  },
};
