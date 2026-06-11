import { z } from "zod";

export const createStoreStockSchema = z.object({
  quantity: z.number().int().positive(),
  productId: z.int(),
  storeId: z.int(),
});

export const updateStoreStockSchema = createStoreStockSchema.partial();
