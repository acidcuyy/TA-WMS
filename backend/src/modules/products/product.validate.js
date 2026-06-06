import { z } from "zod";

export const createUserSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  unit: z.string().min(1),
  companiesId: z.int(),
});

export const updateUserSchema = createUserSchema.partial();
