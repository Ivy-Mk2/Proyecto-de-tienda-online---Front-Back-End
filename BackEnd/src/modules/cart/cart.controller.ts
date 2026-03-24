import { Request, Response } from 'express';
import { cartService } from './cart.service';

export const cartController = {
  async getCart(req: Request, res: Response) {
    const cart = await cartService.getCart(
      req.authUser?.id,
      req.query.guestToken as string | undefined,
    );
    res.json(cart);
  },

  async addItem(req: Request, res: Response) {
    const cart = await cartService.addItem({
      userId: req.authUser?.id,
      guestToken: req.body.guestToken,
      productId: req.body.productId,
      quantity: req.body.quantity,
    });
    res.status(201).json(cart);
  },

  async updateItem(req: Request, res: Response) {
    const cart = await cartService.updateItem(
      req.params.itemId,
      req.body.quantity,
      req.authUser?.id,
    );
    res.json(cart);
  },

  async removeItem(req: Request, res: Response) {
    const cart = await cartService.removeItem(req.params.itemId, req.authUser?.id);
    res.json(cart);
  },

  async merge(req: Request, res: Response) {
    const cart = await cartService.mergeGuestCart(req.authUser!.id, req.body.guestToken);
    res.json(cart);
  },
};
