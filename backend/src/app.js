import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import orderRoutes from "./routes/order.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import storeRoutes from "./routes/store.routes.js";
import reportRoutes from "./routes/report.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend WMS jalan 🚀");
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);

export default app;