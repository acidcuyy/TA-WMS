import express from "express";
import requestsController from "./requests.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  requestsController.getRequests
);

router.get(
  "/:id",
  authenticate,
  requestsController.getRequestById
);

router.post(
  "/",
  authenticate,
  authorizeRole("TOKO"),
  requestsController.createRequest
);

router.patch(
  "/:id/decide",
  authenticate,
  authorizeRole("GUDANG"),
  requestsController.decideRequest
);

router.patch(
  "/:id/dispatch",
  authenticate,
  authorizeRole("GUDANG"),
  requestsController.dispatchRequest
);

router.patch(
  "/:id/confirm",
  authenticate,
  authorizeRole("TOKO"),
  requestsController.confirmReceipt
);

export default router;
