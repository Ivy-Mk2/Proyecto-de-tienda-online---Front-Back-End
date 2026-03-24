import { prisma } from '../../prisma/client';
import { AppError } from '../../shared/errors/app-error';

export const bannersService = {
  async list(isAdmin = false) {
    return prisma.banner.findMany({
      where: isAdmin ? undefined : { isActive: true },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async create(data: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaText?: string;
    ctaLink?: string;
    isActive?: boolean;
    orderIndex?: number;
  }) {
    return prisma.banner.create({ data });
  },

  async update(
    id: string,
    data: Partial<{
      title: string;
      subtitle: string;
      imageUrl: string;
      ctaText: string;
      ctaLink: string;
      isActive: boolean;
      orderIndex: number;
    }>,
  ) {
    const exists = await prisma.banner.findUnique({ where: { id } });
    if (!exists) throw new AppError(404, 'Banner not found');
    return prisma.banner.update({ where: { id }, data });
  },

  async remove(id: string) {
    await prisma.banner.delete({ where: { id } });
  },
};
