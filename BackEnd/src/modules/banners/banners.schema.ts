import { z } from 'zod';

export const createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    subtitle: z.string().optional(),
    imageUrl: z.string().min(1),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    orderIndex: z.coerce.number().int().nonnegative().optional().default(0),
  }),
});

export const updateBannerSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: createBannerSchema.shape.body.partial(),
});

export const bannerParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
