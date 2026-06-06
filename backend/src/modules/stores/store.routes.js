import express from "express";
import storeController from "./store.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorizeRole("SUPER_ADMIN", "ADMIN"),
    storeController.getAll,
);

router.post(
    "/",
    authenticate,
    authorizeRole("ADMIN", "SUPER_ADMIN"),
    storeController.create,
);

router.get(
    "/:id",
    authenticate,
    authorizeRole("SUPER_ADMIN", "ADMIN"),
    storeController.getById,
);

router.put(
    "/:id",
    authenticate,
    authorizeRole("ADMIN", "SUPER_ADMIN"),
    storeController.update,
);

router.put(
    "/delete/:id",
    authenticate,
    authorizeRole("ADMIN", "SUPER_ADMIN"),
    storeController.delete,
);

export default router;