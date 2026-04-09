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

type BodySectionDTO = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
};

const productInclude = { images: { orderBy: { order: 'asc' as const } } };

const toSectionId = (category: string) =>
  category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const formatCategoryTitle = (category: string) =>
  category
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

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

  async listBodySections(): Promise<BodySectionDTO[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          not: '',
        },
      },
      include: productInclude,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });

    const sectionsMap = new Map<string, BodySectionDTO>();

    for (const product of products) {
      const normalizedCategory = product.category.trim();

      if (!normalizedCategory || sectionsMap.has(normalizedCategory)) {
        continue;
      }

      const firstImage = product.images[0];
      if (!firstImage?.imageUrl) {
        continue;
      }

      sectionsMap.set(normalizedCategory, {
        id: toSectionId(normalizedCategory),
        title: formatCategoryTitle(normalizedCategory),
        category: normalizedCategory,
        imageUrl: firstImage.imageUrl,
      });
    }

    return Array.from(sectionsMap.values());
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
