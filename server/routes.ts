import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, rentals, rentalItems } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      const allProducts = await db.query.products.findMany();
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Create a new rental
  app.post("/api/rentals", async (req, res) => {
    try {
      const { customerName, customerEmail, items, startDate, endDate } = req.body;
      
      const rental = await db.insert(rentals).values({
        customerName,
        customerEmail,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount: 0, // Calculate based on items and duration
        status: "pending"
      }).returning();

      // Add rental items
      for (const item of items) {
        await db.insert(rentalItems).values({
          rentalId: rental[0].id,
          productId: item.productId,
          quantity: item.quantity
        });

        // Update product stock
        await db
          .update(products)
          .set({ totalStock: db.raw('total_stock - ?', [item.quantity]) })
          .where(eq(products.id, item.productId));
      }

      res.status(201).json(rental[0]);
    } catch (error) {
      res.status(500).json({ message: "Error creating rental" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
