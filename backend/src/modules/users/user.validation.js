import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email().or(z.literal("")).or(z.undefined()).or(z.null()).optional(),
  phone: z.string().optional().nullable(),
  role: z.preprocess(
    (val) => typeof val === "string" ? val.toUpperCase() : val,
    z.enum(["ADMIN", "SUPER_ADMIN", "TOKO", "DRIVER", "GUDANG"])
  ),
  branchId: z.string().optional().nullable(),
  vehicle: z.string().optional().nullable(),
  nomorSim: z.string().optional().nullable(),
  alamatDomisili: z.string().optional().nullable(),
  statusMitra: z.string().optional().nullable(),
  joinedAt: z.string().optional().nullable(),
});
