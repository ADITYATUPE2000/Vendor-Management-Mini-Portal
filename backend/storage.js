import { vendors, products, ratings } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc } from "drizzle-orm";

// Storage interface implementation with database
export class DatabaseStorage {
  // Vendor operations
  async getVendor(id) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByEmail(email) {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
    return vendor;
  }

  async getAllVendors() {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async createVendor(vendorData) {
    const [vendor] = await db.insert(vendors).values(vendorData).returning();
    return vendor;
  }

  async updateVendor(id, vendorData) {
    const [vendor] = await db
      .update(vendors)
      .set({ ...vendorData, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async deleteVendor(id) {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Product operations
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByVendor(vendorId) {
    return await db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(productData) {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id, productData) {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id) {
    await db.delete(products).where(eq(products.id, id));
  }

  // Rating operations
  async getRating(id) {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }

  async getRatingsByVendor(vendorId) {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.vendorId, vendorId))
      .orderBy(desc(ratings.createdAt));
  }

  async createRating(ratingData) {
    const [rating] = await db.insert(ratings).values(ratingData).returning();
    
    // Update vendor's average rating and total reviews
    const vendorRatings = await this.getRatingsByVendor(ratingData.vendorId);
    const totalReviews = vendorRatings.length;
    const avgRating = vendorRatings.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    await db
      .update(vendors)
      .set({ 
        avgRating: avgRating.toFixed(2), 
        totalReviews,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, ratingData.vendorId));
    
    return rating;
  }

  async deleteRating(id) {
    const rating = await this.getRating(id);
    if (rating) {
      await db.delete(ratings).where(eq(ratings.id, id));
      
      // Update vendor's average rating and total reviews
      const vendorRatings = await this.getRatingsByVendor(rating.vendorId);
      const totalReviews = vendorRatings.length;
      const avgRating = totalReviews > 0 
        ? vendorRatings.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      await db
        .update(vendors)
        .set({ 
          avgRating: avgRating.toFixed(2), 
          totalReviews,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, rating.vendorId));
    }
  }
}

export const storage = new DatabaseStorage();
