import { z } from "zod";

export const createStoreSchema = z.object({
    name: z.string().min(3),
    address: z.string().min(5),
    phone: z.string().min(10).max(15),
    companiesId: z.number().int()(),
});

export const updateStoreSchema = createStoreSchema.partial();