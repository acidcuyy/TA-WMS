import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(3),
  address: z.string().min(5),
  phone: z.string().min(10),
});

export const updateCompanySchema = createCompanySchema.partial();
