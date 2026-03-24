import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { productService } from './product.service';

export const productController = {
  async list(req: Request, res: Response) {
    const featured = req.query.featured === undefined ? undefined : req.query.featured === 'true';
    const isActive = req.query.isActive === undefined ? true : req.query.isActive === 'true';

    const products = await productService.list({
      category: req.query.category as string | undefined,
      featured,
      isActive,
    });

    res.json(products);
  },

  async getById(req: Request, res: Response) {
    const product = await productService.getById(req.params.id);
    res.json(product);
  },

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    res.status(StatusCodes.CREATED).json(product);
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  },

  async remove(req: Request, res: Response) {
    await productService.remove(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  },

  async addImage(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Image file is required' });
      return;
    }

    const image = await productService.addImage(req.params.id, file.filename, req.body.altText);
    res.status(StatusCodes.CREATED).json(image);
  },

  async removeImage(req: Request, res: Response) {
    await productService.removeImage(req.params.id, req.params.imageId);
    res.status(StatusCodes.NO_CONTENT).send();
  },
};
