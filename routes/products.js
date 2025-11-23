// routes/products.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/********** GET /api/products (list with optional filters) **********/
router.get("/", async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      category,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ name: re }, { category: re }];
    }

    if (category) query.category = category;
    if (minPrice) query.price = { ...(query.price || {}), $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...(query.price || {}), $lte: Number(maxPrice) };

    let mongooseQuery = Product.find(query);

    if (sort) {
      // e.g. sort=price or sort=-price
      mongooseQuery = mongooseQuery.sort(sort);
    }

    const total = await Product.countDocuments(query);
    const data = await mongooseQuery
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ page, limit, total, data });
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/********** GET /api/products/:id **********/
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("GET /api/products/:id error:", err);
    res.status(400).json({ error: "Invalid id" });
  }
});

/********** POST /api/products **********/
router.post("/", async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;
    if (!name || price == null || !category || stock == null) {
      return res
        .status(400)
        .json({ error: "name, price, category, stock are required" });
    }

    const product = await Product.create({ name, price, category, stock });
    res.status(201).json(product);
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/********** PUT /api/products/:id (replace) **********/
router.put("/:id", async (req, res) => {
  try {
    const { name, price, category, stock } = req.body;
    if (!name || price == null || !category || stock == null) {
      return res
        .status(400)
        .json({ error: "name, price, category, stock are required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, category, stock },
      { new: true, runValidators: true }
    );
 
  
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("PUT /api/products/:id error:", err);
    res.status(400).json({ error: "Invalid id" });
  }
});

/********** PATCH /api/products/:id (partial update) **********/
router.patch("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("PATCH /api/products/:id error:", err);
    res.status(400).json({ error: "Invalid id" });
  }
});

/********** DELETE /api/products/:id **********/
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE /api/products/:id error:", err);
    res.status(400).json({ error: "Invalid id" });
  }
});

export default router;
