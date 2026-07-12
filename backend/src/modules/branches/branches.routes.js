import express from "express";
import branchesController from "./branches.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  branchesController.getBranches
);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  branchesController.createBranch
);

router.put(
  "/:id",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  branchesController.updateBranch
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  branchesController.deleteBranch
);

export default router;
