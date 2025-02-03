import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, rentals, rentalItems, inventoryDates } from "@db/schema";
import { eq, and, between, sql } from "drizzle-orm";
import { addDays, format } from "date-fns";

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

  // Get available inventory for a date range
  app.get("/api/inventory/available", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Get the inventory dates for the range
      const inventoryForRange = await db.query.inventoryDates.findMany({
        where: and(
          between(inventoryDates.date, start, end)
        ),
      });

      // If no inventory records exist for these dates, create them with default stock
      if (inventoryForRange.length === 0) {
        const [firstProduct] = await db.query.products.findMany({ limit: 1 });
        if (firstProduct) {
          let currentDate = start;
          while (currentDate <= end) {
            await db.insert(inventoryDates).values({
              date: currentDate,
              productId: firstProduct.id,
              availableStock: firstProduct.totalStock,
            });
            currentDate = addDays(currentDate, 1);
          }
        }
        return res.json({ availableStock: 100 }); // Default stock
      }

      // Return the minimum available stock across the date range
      const minStock = Math.min(...inventoryForRange.map(inv => inv.availableStock));
      res.json({ availableStock: minStock });
    } catch (error) {
      console.error('Error checking inventory:', error);
      res.status(500).json({ message: "Error checking inventory availability" });
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

      // Check if enough inventory is available
      const start = new Date(startDate);
      const end = new Date(endDate);

      const inventoryForRange = await db.query.inventoryDates.findMany({
        where: and(
          between(inventoryDates.date, start, end)
        ),
      });

      const minStock = inventoryForRange.length > 0
        ? Math.min(...inventoryForRange.map(inv => inv.availableStock))
        : 100;

      if (minStock < quantity) {
        return res.status(400).json({ 
          message: "Not enough inventory available for the selected dates" 
        });
      }

      // Insert the rental record
      const [rental] = await db.insert(rentals).values({
        customerName: customerName,
        customerEmail: customerEmail,
        startDate: start,
        endDate: end,
        totalAmount: 0, // We'll calculate this based on duration and quantity
        status: "pending",
        deliveryOption: "pickup",
        deliveryAddress: null,
        deliveryDate: start,
        pickupDate: start,
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

        // Update inventory for each date in the range
        let currentDate = start;
        while (currentDate <= end) {
          const formattedDate = format(currentDate, 'yyyy-MM-dd');

          // Update or insert inventory record
          await db
            .insert(inventoryDates)
            .values({
              date: currentDate,
              productId: product.id,
              availableStock: product.totalStock - quantity,
            })
            .onConflictDoUpdate({
              target: [inventoryDates.date, inventoryDates.productId],
              set: {
                availableStock: sql`${inventoryDates.availableStock} - ${quantity}`,
              },
            });

          currentDate = addDays(currentDate, 1);
        }
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