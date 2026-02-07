import { pgTable, text, serial, integer, boolean, timestamp, decimal, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  totalStock: integer("total_stock").notNull().default(100),
  co2Saved: decimal("co2_saved", { precision: 10, scale: 3 }).default("50.000").notNull(), // grams per item
  waterSaved: decimal("water_saved", { precision: 10, scale: 3 }).default("28.000").notNull(), // liters per item
});

export const inventoryDates = pgTable("inventory_dates", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  availableStock: integer("available_stock").notNull(),
}, (table) => {
  return {
    dateProductIdx: unique().on(table.date, table.productId),
  };
});

export const rentals = pgTable("rentals", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  deliveryOption: text("delivery_option").notNull(),
  deliveryAddress: text("delivery_address"),
  deliveryDate: timestamp("delivery_date").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rentalItems = pgTable("rental_items", {
  id: serial("id").primaryKey(),
  rentalId: integer("rental_id").notNull().references(() => rentals.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name"),
  rentalDate: date("rental_date").notNull(),
  cityOfUse: text("city_of_use").notNull(),
  imageUrls: text("image_urls"), // JSON array of image URLs
  likelihoodToRentAgain: integer("likelihood_to_rent_again").notNull(), // 1-5 scale
  likelihoodToRecommend: integer("likelihood_to_recommend").notNull(), // 1-5 scale
  orderingExperience: integer("ordering_experience").notNull(), // 1-5 scale
  suggestions: text("suggestions"),
  platesUsed: integer("plates_used"),
  glassesUsed: integer("glasses_used"),
  spoonsUsed: integer("spoons_used"),
  marketingConsent: boolean("marketing_consent").default(false),
  isVisible: boolean("is_visible").default(false), // Admin control
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content Hub Tables
export const contentCategories = pgTable("content_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull().unique(),
  thumbnailUrl: text("thumbnail_url"),
  contentType: text("content_type").notNull(), // article, video, podcast
  source: text("source"), // domain name
  readingTime: integer("reading_time"), // in minutes
  isFeatured: boolean("is_featured").default(false),
  status: text("status").notNull().default("published"), // draft, published, archived
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  bookmarkCount: integer("bookmark_count").default(0),
  createdBy: integer("created_by"), // admin user id (when auth is added)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const contentCategoryMapping = pgTable("content_category_mapping", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => contentCategories.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueContentCategory: unique().on(table.contentId, table.categoryId),
}));

export const contentTags = pgTable("content_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentTagMapping = pgTable("content_tag_mapping", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => contentTags.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueContentTag: unique().on(table.contentId, table.tagId),
}));

export const contentBookmarks = pgTable("content_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // reference to users table when auth is added
  contentId: integer("content_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserContent: unique().on(table.userId, table.contentId),
}));

// Relations for existing tables
export const productsRelations = relations(products, ({ many }) => ({
  inventoryDates: many(inventoryDates),
  rentalItems: many(rentalItems),
}));

export const inventoryDatesRelations = relations(inventoryDates, ({ one }) => ({
  product: one(products, {
    fields: [inventoryDates.productId],
    references: [products.id],
  }),
}));

export const rentalsRelations = relations(rentals, ({ many }) => ({
  items: many(rentalItems),
}));

export const rentalItemsRelations = relations(rentalItems, ({ one }) => ({
  rental: one(rentals, {
    fields: [rentalItems.rentalId],
    references: [rentals.id],
  }),
  product: one(products, {
    fields: [rentalItems.productId],
    references: [products.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  // Add relations if needed in the future
}));

// Content Hub Relations
export const contentItemsRelations = relations(contentItems, ({ many }) => ({
  categoryMappings: many(contentCategoryMapping),
  tagMappings: many(contentTagMapping),
  bookmarks: many(contentBookmarks),
}));

export const contentCategoriesRelations = relations(contentCategories, ({ many }) => ({
  contentMappings: many(contentCategoryMapping),
}));

export const contentCategoryMappingRelations = relations(contentCategoryMapping, ({ one }) => ({
  content: one(contentItems, {
    fields: [contentCategoryMapping.contentId],
    references: [contentItems.id],
  }),
  category: one(contentCategories, {
    fields: [contentCategoryMapping.categoryId],
    references: [contentCategories.id],
  }),
}));

export const contentTagsRelations = relations(contentTags, ({ many }) => ({
  contentMappings: many(contentTagMapping),
}));

export const contentTagMappingRelations = relations(contentTagMapping, ({ one }) => ({
  content: one(contentItems, {
    fields: [contentTagMapping.contentId],
    references: [contentItems.id],
  }),
  tag: one(contentTags, {
    fields: [contentTagMapping.tagId],
    references: [contentTags.id],
  }),
}));

export const contentBookmarksRelations = relations(contentBookmarks, ({ one }) => ({
  content: one(contentItems, {
    fields: [contentBookmarks.contentId],
    references: [contentItems.id],
  }),
}));

// Schema exports for validation
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertRentalSchema = createInsertSchema(rentals);
export const selectRentalSchema = createSelectSchema(rentals);
export const insertFeedbackSchema = createInsertSchema(feedback);
export const selectFeedbackSchema = createSelectSchema(feedback);

// Content Hub schema exports
export const insertContentItemSchema = createInsertSchema(contentItems);
export const selectContentItemSchema = createSelectSchema(contentItems);
export const insertContentCategorySchema = createInsertSchema(contentCategories);
export const selectContentCategorySchema = createSelectSchema(contentCategories);

// TypeScript types
export type Product = typeof products.$inferSelect;
export type Rental = typeof rentals.$inferSelect;
export type RentalItem = typeof rentalItems.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type InventoryDate = typeof inventoryDates.$inferSelect;

// Content Hub types
export type ContentItem = typeof contentItems.$inferSelect;
export type ContentCategory = typeof contentCategories.$inferSelect;
export type ContentTag = typeof contentTags.$inferSelect;
export type ContentBookmark = typeof contentBookmarks.$inferSelect;

export type InsertFeedback = typeof feedback.$inferInsert;