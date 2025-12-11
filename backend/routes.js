import { createServer } from "http";
import { setupAuth, isAuthenticated } from "./auth.js";
import { getCurrentVendor, logoutVendor } from "./api/auth.js";
import {
  registerVendor,
  loginVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  getVendorProducts,
  getVendorRatings,
} from "./api/vendors.js";
import { createProduct, updateProduct, deleteProduct } from "./api/products.js";
import { createRating } from "./api/ratings.js";

export async function registerRoutes(httpServer, app) {
  // Setup auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/vendor", getCurrentVendor);
  app.get("/api/logout", logoutVendor);

  // Vendor routes
  app.post("/api/vendors/register", registerVendor);
  app.post("/api/vendors/login", loginVendor);
  app.get("/api/vendors", getAllVendors);
  app.get("/api/vendors/:id", getVendorById);
  app.patch("/api/vendors/:id", isAuthenticated, updateVendor);
  app.get("/api/vendors/:id/products", getVendorProducts);
  app.get("/api/vendors/:id/ratings", getVendorRatings);

  // Product routes
  app.post("/api/products", isAuthenticated, createProduct);
  app.patch("/api/products/:id", isAuthenticated, updateProduct);
  app.delete("/api/products/:id", isAuthenticated, deleteProduct);

  // Rating routes
  app.post("/api/ratings", createRating);

  // Debug endpoint - check environment variables (remove after debugging)
  app.get("/api/debug/env", (req, res) => {
    res.json({
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_STARTS_WITH: process.env.DATABASE_URL?.substring(0, 15) || "NOT SET",
      SESSION_SECRET_SET: !!process.env.SESSION_SECRET,
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
      VERCEL: process.env.VERCEL || "NOT SET",
    });
  });

  return httpServer;
}
