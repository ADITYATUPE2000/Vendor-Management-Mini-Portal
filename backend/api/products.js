import { storage } from "../storage.js";
import { insertProductSchema, updateProductSchema } from "../../shared/schema.js";
import { z } from "zod";

/**
 * Create a new product
 * POST /api/products
 */
export async function createProduct(req, res) {
  try {
    const validatedData = insertProductSchema.parse(req.body);
    
    // Check if user owns this vendor profile
    if (req.session.vendorId !== validatedData.vendorId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const product = await storage.createProduct(validatedData);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
}

/**
 * Update a product
 * PATCH /api/products/:id
 */
export async function updateProduct(req, res) {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns this product
    if (req.session.vendorId !== product.vendorId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const validatedData = updateProductSchema.parse(req.body);
    const updatedProduct = await storage.updateProduct(req.params.id, validatedData);
    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
}

/**
 * Delete a product
 * DELETE /api/products/:id
 */
export async function deleteProduct(req, res) {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns this product
    if (req.session.vendorId !== product.vendorId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteProduct(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
}

