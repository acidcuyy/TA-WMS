import express from "express";
import userController from "./user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authenticate, authorizeRole("SUPER_ADMIN", "ADMIN"), userController.getUsers);

router.post(
  "/",
  authenticate,
  authorizeRole("ADMIN", "SUPER_ADMIN"),
  userController.createUser,
);

export default router;
