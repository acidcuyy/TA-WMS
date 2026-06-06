import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

import productController from "./product.controller.js";
const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  productController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  productController.create,
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  productController.getById,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  productController.update,
);

router.put(
  "/delete/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  productController.delete,
);

export default router;
