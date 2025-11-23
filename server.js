// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import Product from './models/Product.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Products API
app.use("/api/products", productsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
}); 
