import express from "express";
import cors from "cors";
import barangRoutes from "./routes/barang.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend WMS jalan 🚀");
});

app.use("/api/barang", barangRoutes);

export default app;