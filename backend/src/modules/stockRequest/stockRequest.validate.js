import { z } from "zod";

export const createRequestStoreSchema = z.object({
  notes: z.string().optional(),
  storeId: z.number().int(),
});

export const updateRequestStoreSchema = createRequestStoreSchema.partial();
