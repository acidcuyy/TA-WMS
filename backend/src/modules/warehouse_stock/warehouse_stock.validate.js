import { z } from "zod";

export const createWarehouseStockSchema = z.object({
  quantity: z.number().int().positive(),
  warehouseId: z.int(),
  productId: z.int(),
});

export const updateWarehouseStockSchema = createWarehouseStockSchema.partial();
