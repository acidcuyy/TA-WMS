import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import stockRoutes from "./routes/stock.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend WMS jalan 🚀");
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);

export default app;