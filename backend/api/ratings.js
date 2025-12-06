import { storage } from "../storage.js";
import { insertRatingSchema } from "../../shared/schema.js";
import { z } from "zod";

/**
 * Create a new rating
 * POST /api/ratings
 */
export async function createRating(req, res) {
  try {
    const validatedData = insertRatingSchema.parse(req.body);
    
    // Check if vendor exists
    const vendor = await storage.getVendor(validatedData.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const rating = await storage.createRating(validatedData);
    res.status(201).json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error creating rating:", error);
    res.status(500).json({ message: "Failed to create rating" });
  }
}

