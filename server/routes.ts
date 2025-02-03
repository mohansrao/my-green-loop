import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, rentals, rentalItems } from "@db/schema";
import { eq, sql } from "drizzle-orm";

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
      const {
        customerName,
        customerEmail,
        phoneNumber,
        quantity,
        startDate,
        endDate,
      } = req.body;

      // Insert the rental record
      const [rental] = await db.insert(rentals).values({
        customerName: customerName,
        customerEmail: customerEmail,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalAmount: 0, // We'll calculate this based on duration and quantity
        status: "pending",
        deliveryOption: "pickup",
        deliveryAddress: null,
        deliveryDate: new Date(startDate),
        pickupDate: new Date(startDate),
        createdAt: new Date(),
      }).returning();

      // For simplicity, we'll create a rental item with the first product
      const [product] = await db.query.products.findMany({ limit: 1 });

      if (product) {
        await db.insert(rentalItems).values({
          rentalId: rental.id,
          productId: product.id,
          quantity: quantity
        });

        // Update product stock
        await db
          .update(products)
          .set({ 
            totalStock: sql`${products.totalStock} - ${quantity}` 
          })
          .where(eq(products.id, product.id));
      }

      res.status(201).json(rental);
    } catch (error) {
      console.error('Error creating rental:', error);
      res.status(500).json({ message: "Error creating rental" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}