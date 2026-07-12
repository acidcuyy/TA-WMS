import express from "express";
import restocksController from "./restocks.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  restocksController.getRestockToAdmin
);

router.post(
  "/",
  authenticate,
  authorizeRole("GUDANG"),
  restocksController.createRestockToAdmin
);

router.patch(
  "/:id/decide",
  authenticate,
  authorizeRole("ADMIN"),
  restocksController.adminDecideRestock
);

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRole("GUDANG"),
  restocksController.gudangFinishRestockWithProof
);

export default router;
