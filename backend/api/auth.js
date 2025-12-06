import { storage } from "../storage.js";

/**
 * Get current authenticated vendor
 * GET /api/auth/vendor
 */
export async function getCurrentVendor(req, res) {
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
}

/**
 * Logout vendor
 * GET /api/logout
 */
export function logoutVendor(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.redirect("/");
  });
}

