import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import logger from "./config/logger.js";
import { sendError } from "./utils/response.js";
import userRoute from "./modules/users/user.routes.js";
import authRoute from "./modules/auth/auth.routes.js";
import branchesRoute from "./modules/branches/branches.routes.js";
import productsRoute from "./modules/products/products.routes.js";
import stocksRoute from "./modules/stocks/stocks.routes.js";
import requestsRoute from "./modules/requests/requests.routes.js";
import restockAdminRoute from "./modules/restocks/restock-admin.routes.js";
import adminRestockRoute from "./modules/restocks/admin-restock.routes.js";
import shipmentsRoute from "./modules/shipments/shipments.routes.js";
import reportsRoute from "./modules/reports/reports.routes.js";

import { success } from "zod";

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin === env.CLIENT_URL) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Body Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
app.use("/api/branches", branchesRoute);
app.use("/api/products", productsRoute);
app.use("/api/stocks", stocksRoute);
app.use("/api/requests", requestsRoute);
app.use("/api/restock-admin", restockAdminRoute);
app.use("/api/admin-restock", adminRestockRoute);
app.use("/api/driver", shipmentsRoute);
app.use("/api", reportsRoute);

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
