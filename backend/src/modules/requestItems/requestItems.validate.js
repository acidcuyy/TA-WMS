import { z } from "zod";

export const createRequestItems = z.object({
  quantity: z.number().int(),
  productId: z.number().int(),
  requestId: z.number().int(),
});

export const updateRequestItems = z.object({
  quantity: z.number().int().positive(),
});
