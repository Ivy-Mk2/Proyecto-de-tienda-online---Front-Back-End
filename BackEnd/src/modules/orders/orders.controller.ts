import { Request, Response } from 'express';
import { ordersService } from './orders.service';

export const ordersController = {
  async checkout(req: Request, res: Response) {
    const shippingAddress = req.body?.shippingAddress as
      | { fullName: string; phone: string; address: string; district: string; city: string; notes?: string }
      | undefined;

    res.status(201).json(await ordersService.checkout(req.authUser!.id, shippingAddress));
  },

  async list(req: Request, res: Response) {
    res.json(await ordersService.list(req.authUser!.id));
  },

  async getById(req: Request, res: Response) {
    res.json(await ordersService.getById(req.authUser!.id, req.params.id));
  },

  async adminList(req: Request, res: Response) {
    const page = Math.max(1, Number(req.query['page']) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20));
    res.json(await ordersService.adminList({ page, limit }));
  },
};
