import { z } from "zod";
export const createStoreSchema = z.object({
  name: z.string().min(3),
  address: z.string().min(5),
  phone: z
    .string()
    .min(10, "Nomor hp minimal 10 digit")
    .max(15, "nomor hp maksimal 15 digit"),
  companiesId: z.number().int(),
});

export const updateStoreSchema = createStoreSchema.partial();
