import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string(),
  location: z.string(),
  capacity: z.number().int(),
  category: z.string(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();
