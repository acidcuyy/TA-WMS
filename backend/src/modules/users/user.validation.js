import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(3),
  password: z.string().min(6),
  age: z.number().int().positive().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TOKO", "DRIVER", "GUDANG"]).optional(),
});

export const updateUserSchema = createUserSchema.partial();