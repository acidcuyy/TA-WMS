import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  username: z.string().min(3),
  name: z.string().min(3),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.preprocess(
    (val) => typeof val === "string" ? val.toUpperCase() : val,
    z.enum(["SUPER_ADMIN", "ADMIN", "TOKO", "DRIVER", "GUDANG"])
  ).optional(),
  branchId: z.string().optional(),
  companyId: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string(), // email or username
  password: z.string(),
});

export const registerCompanySchema = z.object({
  company: z.object({
    name: z.string().min(1),
    industry: z.string().optional(),
    nib: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().optional(),
    document: z.string().optional(),
  }),
  admin: z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    username: z.string().min(3),
    phone: z.string().optional(),
    password: z.string().min(6),
  }),
});
