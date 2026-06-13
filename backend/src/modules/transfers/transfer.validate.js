import { z } from "zod";

export const createTransferSchema = z.object({
  code: z.string(),
  status: z.enum(
    ["PENDING", "APPROVED", "PREPARING", "DELIVERED", "CANCELED"],
    {
      required_error: "status",
    },
  ),
  driverId: z.number().int(),
  companiesId: z.number().int(),
});
