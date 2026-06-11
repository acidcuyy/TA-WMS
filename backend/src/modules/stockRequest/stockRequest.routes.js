import express from "express";
import stockRequestController from "./stockRequest.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorizeRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
    stockRequestController.getAll,
);

router.post(
    "/",
    authenticate,
    authorizeRole("ADMIN", "SUPER_ADMIN", "TOKO", "GUDANG"),
    stockRequestController.create,
);

router.get(
    "/:id",
    authenticate,
    authorizeRole("SUPER_ADMIN", "ADMIN", "TOKO", "GUDANG"),
    stockRequestController.getById,
);

router.put(
    "/:id",
    authenticate,
    authorizeRole("ADMIN", "SUPER_ADMIN", "TOKO", "GUDANG"),
    stockRequestController.update,
);

router.put(
    "/delete/:id",
    authenticate,
    authorizeRole("ADMIN", "SUPER_ADMIN", "TOKO", "GUDANG"),
    stockRequestController.delete,
);

export default router;