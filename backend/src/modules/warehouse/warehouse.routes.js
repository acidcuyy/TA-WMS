import express from "express";
import warehouseController from "./warehouse.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseController.getWarehouse,
);

router.post(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseController.createWarehouse,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseController.updateWarehouse,
);


router.get("/:id", authenticate, authorizeRole("SUPER_ADMIN", "ADMIN"), warehouseController.getWarehousebyId);

router.post("/delete/:id", authenticate, authorizeRole("SUPER_ADMIN", "ADMIN"), warehouseController.deletedWarehouse);
export default router;
