import express from "express";
import warehouseController from "./warehouse.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseController.getAll,
);

router.post(
  "/",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseController.create,
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN", "ADMIN"),
  warehouseController.update,
);


router.get("/:id", authenticate, authorizeRole("SUPER_ADMIN", "ADMIN"), warehouseController.getById);

router.put("/delete/:id", authenticate, authorizeRole("SUPER_ADMIN", "ADMIN"), warehouseController.deleted);

export default router;
