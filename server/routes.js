import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated, hashPassword, comparePassword } from "./auth.js";
import { 
  insertVendorSchema, 
  loginVendorSchema, 
  insertProductSchema, 
  insertRatingSchema,
  updateVendorSchema,
  updateProductSchema
} from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(httpServer, app) {
  // Setup auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/vendor", async (req, res) => {
    try {
      if (!req.session || !req.session.vendorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const vendor = await storage.getVendor(req.session.vendorId);
      if (!vendor) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Don't send password hash
      const { passwordHash, ...vendorData } = vendor;
      res.json(vendorData);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  // Vendor registration
  app.post("/api/vendors/register", async (req, res) => {
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
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Vendor login
  app.post("/api/vendors/login", async (req, res) => {
    try {
      const validatedData = loginVendorSchema.parse(req.body);
      
      const vendor = await storage.getVendorByEmail(validatedData.email);
      if (!vendor) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await comparePassword(validatedData.password, vendor.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.vendorId = vendor.id;

      // Don't send password hash
      const { passwordHash, ...vendorData } = vendor;
      res.json(vendorData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Vendor logout
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });

  // Get all vendors (public)
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      // Don't send password hashes
      const safeVendors = vendors.map(({ passwordHash, ...v }) => v);
      res.json(safeVendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Get single vendor (public)
  app.get("/api/vendors/:id", async (req, res) => {
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
  });

  // Update vendor (authenticated)
  app.patch("/api/vendors/:id", isAuthenticated, async (req, res) => {
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
  });

  // Get vendor's products (public)
  app.get("/api/vendors/:id/products", async (req, res) => {
    try {
      const products = await storage.getProductsByVendor(req.params.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get vendor's ratings (public)
  app.get("/api/vendors/:id/ratings", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByVendor(req.params.id);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // Create product (authenticated)
  app.post("/api/products", isAuthenticated, async (req, res) => {
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
  });

  // Update product (authenticated)
  app.patch("/api/products/:id", isAuthenticated, async (req, res) => {
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
  });

  // Delete product (authenticated)
  app.delete("/api/products/:id", isAuthenticated, async (req, res) => {
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
  });

  // Create rating (public)
  app.post("/api/ratings", async (req, res) => {
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
  });

  return httpServer;
}
