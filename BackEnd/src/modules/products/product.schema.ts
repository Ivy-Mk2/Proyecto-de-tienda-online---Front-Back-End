import { z } from 'zod';

const sizesColorsSchema = z.array(z.string().min(1)).min(1);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().min(4),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().nonnegative(),
    category: z.string().min(2),
    sizes: sizesColorsSchema,
    colors: sizesColorsSchema,
    featured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
  params: z.object({ id: z.string().min(1) }),
});

export const listProductsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const productParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const imageDeleteSchema = z.object({
  params: z.object({ id: z.string().min(1), imageId: z.string().min(1) }),
});
