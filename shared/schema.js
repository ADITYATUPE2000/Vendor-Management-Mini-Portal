import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, index, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Business categories
export const businessCategories = [
  "Contractor",
  "Material Supplier",
  "Consultant",
  "Fabricator",
  "Electrician",
  "Plumber",
  "Interior Designer",
  "Architect",
  "Other"
];

// Vendors table
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  businessCategory: varchar("business_category", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  description: text("description"),
  priceRange: varchar("price_range", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings/Feedback table
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  products: many(products),
  ratings: many(ratings),
}));

export const productsRelations = relations(products, ({ one }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  vendor: one(vendors, {
    fields: [ratings.vendorId],
    references: [vendors.id],
  }),
}));

// Insert schemas with validation
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  avgRating: true,
  totalReviews: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginVendorSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
});

export const updateVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  passwordHash: true,
  avgRating: true,
  totalReviews: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const updateProductSchema = createInsertSchema(products).omit({
  id: true,
  vendorId: true,
  createdAt: true,
  updatedAt: true,
}).partial();
