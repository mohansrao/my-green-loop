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

export const productRelations = relations(products, ({ many }) => ({
  rentalItems: many(rentalItems),
  inventoryDates: many(inventoryDates),
}));

export const rentalRelations = relations(rentals, ({ many }) => ({
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

export const inventoryDatesRelations = relations(inventoryDates, ({ one }) => ({
  product: one(products, {
    fields: [inventoryDates.productId],
    references: [products.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type Rental = typeof rentals.$inferSelect;
export type RentalItem = typeof rentalItems.$inferSelect;
export type InventoryDate = typeof inventoryDates.$inferSelect;