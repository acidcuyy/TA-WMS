import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(3),
  password: z.string().min(6),
  age: z.number().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "TOKO", "DRIVER", "GUDANG"]).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});
