import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/app-error';
import { uploadStorage } from '../uploads/upload.service';

type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sizes: string[];
  colors: string[];
  featured?: boolean;
  isActive?: boolean;
};

const productInclude = { images: { orderBy: { order: 'asc' as const } } };

export const productService = {
  async list(filters: { category?: string; featured?: boolean; isActive?: boolean }) {
    return prisma.product.findMany({
      where: {
        category: filters.category,
        featured: filters.featured,
        isActive: filters.isActive,
      },
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!product) throw new AppError(404, 'Product not found');
    return product;
  },

  async create(data: ProductInput) {
    return prisma.product.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
      },
      include: productInclude,
    });
  },

  async update(id: string, data: Partial<ProductInput>) {
    await this.getById(id);

    const updateData: Prisma.ProductUpdateInput = {
      ...data,
      ...(data.price !== undefined ? { price: new Prisma.Decimal(data.price) } : {}),
    };

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.product.delete({ where: { id } });
  },

  async addImage(productId: string, filename: string, altText?: string) {
    await this.getById(productId);
    const highest = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { order: 'desc' },
    });

    return prisma.productImage.create({
      data: {
        productId,
        imageUrl: uploadStorage.buildPublicUrl(filename),
        altText,
        order: highest ? highest.order + 1 : 0,
      },
    });
  },

  async removeImage(productId: string, imageId: string) {
    await this.getById(productId);
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new AppError(404, 'Image not found');
    await prisma.productImage.delete({ where: { id: imageId } });
  },
};
