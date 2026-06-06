import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().min(3),
  address: z.string().min(5),
  phone: z.string().min(10).max(15),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();
