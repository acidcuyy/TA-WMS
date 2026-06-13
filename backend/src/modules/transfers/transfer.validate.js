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
  companyId: z.number().int(),
  requestId: z.number().int(),
  toStoreId: z.number().int(),
  fromWarehouseId: z.number().int(),
});

export const updateTransferSchema = createTransferSchema.partial();
