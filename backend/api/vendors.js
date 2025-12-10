import { storage } from "../storage.js";
import { hashPassword, comparePassword } from "../auth.js";
import { insertVendorSchema, loginVendorSchema, updateVendorSchema } from "../../shared/schema.js";
import { z } from "zod";

/**
 * Register a new vendor
 * POST /api/vendors/register
 */
export async function registerVendor(req, res) {
  try {
    const validatedData = insertVendorSchema.parse(req.body);

    // Check if email already exists
    const existingVendor = await storage.getVendorByEmail(validatedData.email);
    if (existingVendor) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create vendor
    const { password, confirmPassword, ...vendorData } = validatedData;
    const vendor = await storage.createVendor({
      ...vendorData,
      passwordHash,
    });

    // Don't send password hash
    const { passwordHash: _, ...vendorResponse } = vendor;
    res.status(201).json(vendorResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Registration error:", error);
    // Include more details for debugging (remove in production after debugging)
    const errorMessage = error.message || "Unknown error";
    const errorDetails = process.env.NODE_ENV === "production"
      ? errorMessage
      : `${errorMessage} | ${error.stack?.split('\n')[0] || ''}`;
    res.status(500).json({ message: `Registration failed: ${errorDetails}` });
  }
}

/**
 * Login vendor
 * POST /api/vendors/login
 */
export async function loginVendor(req, res) {
  try {
    const validatedData = loginVendorSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find vendor by email
    const vendor = await storage.getVendorByEmail(email);

    if (!vendor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isValid = await comparePassword(password, vendor.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session - CRITICAL PART
    req.session.vendorId = vendor.id;

    // Save session explicitly before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session error" });
      }

      // Don't send password hash back
      const { passwordHash: _, ...vendorData } = vendor;
      res.json({ vendor: vendorData });
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Get all vendors
 * GET /api/vendors
 */
export async function getAllVendors(req, res) {
  try {
    const vendors = await storage.getAllVendors();
    // Don't send password hashes
    const safeVendors = vendors.map(({ passwordHash, ...v }) => v);
    res.json(safeVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
}

/**
 * Get single vendor by ID
 * GET /api/vendors/:id
 */
export async function getVendorById(req, res) {
  try {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    // Don't send password hash
    const { passwordHash, ...vendorData } = vendor;
    res.json(vendorData);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Failed to fetch vendor" });
  }
}

/**
 * Update vendor
 * PATCH /api/vendors/:id
 */
export async function updateVendor(req, res) {
  try {
    // Check if user owns this vendor profile
    if (req.session.vendorId !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const validatedData = updateVendorSchema.parse(req.body);
    const vendor = await storage.updateVendor(req.params.id, validatedData);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Don't send password hash
    const { passwordHash, ...vendorData } = vendor;
    res.json(vendorData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Failed to update vendor" });
  }
}

/**
 * Get vendor's products
 * GET /api/vendors/:id/products
 */
export async function getVendorProducts(req, res) {
  try {
    const products = await storage.getProductsByVendor(req.params.id);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

/**
 * Get vendor's ratings
 * GET /api/vendors/:id/ratings
 */
export async function getVendorRatings(req, res) {
  try {
    const ratings = await storage.getRatingsByVendor(req.params.id);
    res.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
}
