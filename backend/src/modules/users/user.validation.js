import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z.email(),
    name: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "TOKO", "DRIVER", "GUDANG"], {
      required_error: "Role wajib diisi",
    }),
    phone: z
      .string()
      .min(10, "Nomor hp minimal 10 digit")
      .max(15, "nomor hp maksimal 15 digit"),
    companiesId: z.number().int().optional(),
    storeId: z.number().int().optional(),
    warehouseId: z.number().int().optional(),
  })
  .refine(
    (data) => {
      if (data.warehouseId && data.storeId) return false;
      return true;
    },
    {
      message: "User tidak boleh terhubung ke gudang dan toko sekaligus",
      path: ["warehouseId"],
    },
  )
  .refine(
    (data) => {
      if (["GUDANG", "DRIVER"].includes(data.role) && !data.warehouseId)
        return false;
      return true;
    },
    {
      message: "Role GUDANG dan DRIVER wajib memiliki warehouseId",
      path: ["warehouseId"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "TOKO" && !data.storeId) return false;
      return true;
    },
    {
      message: "Role TOKO wajib memiliki storeId",
      path: ["storeId"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "ADMIN" && !data.companiesId) return false;
      return true;
    },
    {
      message: "Role ADMIN wajib memiliki companiesId",
      path: ["companiesId"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "SUPER_ADMIN" && data.companiesId) return false;
      return true;
    },
    {
      message: "Role SUPER_ADMIN tidak boleh memiliki companiesId",
      path: ["companiesId"],
    },
  );

export const updateUserSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter").optional(),
    email: z.string().email("Format email tidak valid").optional(),
    phone: z.string().min(10).max(15).optional(),
    warehouseId: z.number().int().positive().optional(),
    storeId: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      // warehouseId dan storeId tidak boleh diisi sekaligus
      if (data.warehouseId && data.storeId) return false;
      return true;
    },
    {
      message: "User tidak boleh terhubung ke gudang dan toko sekaligus",
      path: ["warehouseId"],
    },
  );
