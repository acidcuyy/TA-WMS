import { z } from "zod";

export const createRequestItemSchema = z.object({
    storeId: z.number().int().optional(),
    notes: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().min(1),
        })
    ).min(1, "At least one item is required"),
});