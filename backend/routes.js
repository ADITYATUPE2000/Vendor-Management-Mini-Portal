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

  return httpServer;
}
