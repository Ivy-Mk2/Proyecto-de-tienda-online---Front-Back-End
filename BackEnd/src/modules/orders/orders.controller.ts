import { Request, Response } from 'express';
import { ordersService } from './orders.service';

export const ordersController = {
  async checkout(req: Request, res: Response) {
    res.status(201).json(await ordersService.checkout(req.authUser!.id));
  },

  async list(req: Request, res: Response) {
    res.json(await ordersService.list(req.authUser!.id));
  },

  async getById(req: Request, res: Response) {
    res.json(await ordersService.getById(req.authUser!.id, req.params.id));
  },
};
