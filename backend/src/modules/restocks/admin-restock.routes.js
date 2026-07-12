import express from "express";
import restocksController from "./restocks.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  restocksController.getAdminRestockToGudang
);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN"),
  restocksController.createAdminRestockToGudang
);

router.patch(
  "/:id/accept",
  authenticate,
  authorizeRole("GUDANG"),
  restocksController.gudangAcceptAdminRestock
);

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRole("GUDANG"),
  restocksController.gudangUploadProofAndFinish
);

export default router;
