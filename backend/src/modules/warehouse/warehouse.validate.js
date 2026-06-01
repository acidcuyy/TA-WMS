import { z } from "zod";

export const createWarehouseSchema = z.object({
    name: z.string(),
    location: z.string(),
    capacity: z.number().int(),
    category: z.string()
});

export const updateWarehouseSchema = z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    capacity: z.number().int().optional(),
    category: z.string().optional()
});