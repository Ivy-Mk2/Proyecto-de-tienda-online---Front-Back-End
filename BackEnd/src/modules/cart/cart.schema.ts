import { z } from 'zod';

export const cartQuerySchema = z.object({
  query: z.object({
    guestToken: z.string().optional(),
  }),
});

export const addItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
    guestToken: z.string().optional(),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({ itemId: z.string().min(1) }),
  body: z.object({
    quantity: z.coerce.number().int().positive(),
    guestToken: z.string().optional(),
  }),
});

export const removeItemSchema = z.object({
  params: z.object({ itemId: z.string().min(1) }),
  query: z.object({
    guestToken: z.string().optional(),
  }),
});

export const mergeCartSchema = z.object({
  body: z.object({
    guestToken: z.string().min(1),
  }),
});
