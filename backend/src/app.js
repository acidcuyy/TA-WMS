import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import logger from "./config/logger.js";
import { sendError } from "./utils/response.js";
import userRoute from "./modules/users/user.routes.js";
import authRoute from "./modules/auth/auth.routes.js";
import warehouseRoute from "./modules/warehouse/warehouse.routes.js";
import storeRoute from "./modules/stores/store.routes.js";
import companyRoute from "./modules/company/company.routes.js";
import productRoute from "./modules/products/product.routes.js";

import { success } from "zod";

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL || "http://localhost:5137",
    credentials: true,
  }),
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
app.use(
  morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/warehouse", warehouseRoute);
app.use("/api/stores", storeRoute);
app.use("/api/company", companyRoute);
app.use("/api/products", productRoute);
// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Nanti ditambahin satu per satu kalo setiap modul selesai

// 404 Handler
app.use((req, res) => {
  sendError(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
});

// Global Error Handling
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  // Prisma Error Handing
  if (err.code === "P2002") {
    return sendError(res, "Data sudah ada, tidak boleh duplikat", 409);
  }

  if (err.code === "P2025") {
    return sendError(res, "Data tidak ditemukan", 404);
  }

  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === "production" ? "Terjadi kesalahan server" : err.message;

  return sendError(res, message, statusCode);
});

export default app;
