import express from "express";
import productsController from "./products.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  productsController.getProducts
);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  productsController.createProduct
);

router.put(
  "/:sku",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  productsController.updateProduct
);

router.delete(
  "/:sku",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  productsController.deleteProduct
);

export default router;
