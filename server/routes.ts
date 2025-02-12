import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, rentals, rentalItems, inventoryDates } from "@db/schema";
import { eq, and, between, sql, inArray } from "drizzle-orm";
import { addDays, format } from "date-fns";

export function registerRoutes(app: Express): Server {
  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const allProducts = await db.query.products.findMany();
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Get available inventory for specific dates
  app.get("/api/inventory/available", async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const allProducts = await db.query.products.findMany();
      const productStocks = new Map();

      // Initialize with total stock for each product
      allProducts.forEach(product => {
        productStocks.set(product.id, product.totalStock);
      });

      // Get the inventory dates for the range
      const inventoryForRange = await db.query.inventoryDates.findMany({
        where: and(
          between(
            inventoryDates.date, 
            format(start, 'yyyy-MM-dd'), 
            format(end, 'yyyy-MM-dd')
          )
        ),
      });

      // Calculate minimum stock per product
      inventoryForRange.forEach(inv => {
        const currentMin = productStocks.get(inv.productId);
        if (currentMin > inv.availableStock) {
          productStocks.set(inv.productId, inv.availableStock);
        }
      });

      const stockByProduct = Object.fromEntries(productStocks);
      res.json({ stockByProduct });
    } catch (error) {
      console.error('Error checking inventory:', error);
      res.status(500).json({ message: "Error checking inventory availability" });
    }
  });

  // Get inventory for date range
  app.get("/api/inventory/daily", async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const allProducts = await db.query.products.findMany();
      const inventoryForRange = await db.query.inventoryDates.findMany({
        where: and(
          between(
            inventoryDates.date, 
            format(start, 'yyyy-MM-dd'), 
            format(end, 'yyyy-MM-dd')
          )
        ),
      });

      // Transform into required format
      const dailyInventory: Record<string, Record<number, number>> = {};
      
      // Initialize all dates with default stock for all products
      let currentDate = start;
      while (currentDate <= end) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        dailyInventory[dateKey] = {};
        allProducts.forEach(product => {
          dailyInventory[dateKey][product.id] = product.totalStock;
        });
        currentDate = addDays(currentDate, 1);
      }

      // Override with actual inventory records where they exist
      inventoryForRange.forEach(inv => {
        const dateKey = format(new Date(inv.date), 'yyyy-MM-dd');
        dailyInventory[dateKey][inv.productId] = inv.availableStock;
      });

      console.log('[/api/inventory/daily] Response:', { dailyInventory });
      res.json({ dailyInventory });
    } catch (error) {
      console.error('Error fetching daily inventory:', error);
      res.status(500).json({ message: "Error fetching daily inventory" });
    }
  });

  // Get inventory for a single day
  // Get all rentals
  app.get("/api/rental-items", async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const items = await db.query.rentalItems.findMany();
      res.json(items);
    } catch (error) {
      console.error('Error fetching rental items:', error);
      res.status(500).json({ message: "Error fetching rental items" });
    }
  });

  app.post("/api/calculate-price", async (req, res) => {
    try {
      console.log('[Price Calculation] Request body:', req.body);
      const { items } = req.body;
      const products = await db.query.products.findMany();
      console.log('[Price Calculation] Found products:', products);
      
      const hasOverage = items.some(item => item.quantity > 50);
      console.log('[Price Calculation] Items with quantities:', items);
      console.log('[Price Calculation] Has overage:', hasOverage);
      console.log('[Price Calculation] Has overage:', hasOverage);
      const totalAmount = hasOverage ? 30 : 15;
      console.log('[Price Calculation] Final total amount:', totalAmount);
      
      res.json({ totalAmount });
    } catch (error) {
      console.error('[Price Calculation] Error:', error);
      res.status(500).json({ message: "Error calculating price" });
    }
  });

  app.get("/api/rentals", async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const allRentals = await db.query.rentals.findMany({
        orderBy: (rentals, { desc }) => [desc(rentals.createdAt)],
      });
      res.json(allRentals);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      res.status(500).json({ message: "Error fetching rentals" });
    }
  });

  app.get("/api/inventory/:date", async (req, res) => {
    try {
      const date = format(new Date(req.params.date), 'yyyy-MM-dd');
      const inventory = await db.query.inventoryDates.findFirst({
        where: eq(inventoryDates.date, date),
      });

      if (!inventory) {
        const [firstProduct] = await db.query.products.findMany({ limit: 1 });
        if (firstProduct) {
          await db.insert(inventoryDates).values({
            date,
            productId: firstProduct.id,
            availableStock: firstProduct.totalStock,
          });
        }
        return res.json({ availableStock: 100 }); // Default stock
      }

      res.json({ availableStock: inventory.availableStock });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ message: "Error fetching inventory" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        phoneNumber,
        items,
        startDate,
        endDate,
      } = req.body;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Check if enough inventory is available for each product
      const inventoryForRange = await db.query.inventoryDates.findMany({
        where: and(
          between(
            inventoryDates.date, 
            format(start, 'yyyy-MM-dd'), 
            format(end, 'yyyy-MM-dd')
          )
        ),
      });

      // Verify inventory availability for each product
      for (const item of items) {
        const minStock = inventoryForRange.length > 0
          ? Math.min(...inventoryForRange
              .filter(inv => inv.productId === item.productId)
              .map(inv => inv.availableStock))
          : 100;

        if (minStock < item.quantity) {
          return res.status(400).json({ 
            message: `Not enough inventory available for product ID ${item.productId}` 
          });
        }
      }

      // Calculate total amount
      const productsData = await db.query.products.findMany({
        where: inArray(
          products.id, 
          items.map(item => item.productId)
        )
      });

      // Group items by category and calculate total units per category
      const categoryQuantities = items.reduce((acc, item) => {
        const product = productsData.find(p => p.id === item.productId);
        if (product) {
          acc[product.category] = (acc[product.category] || 0) + item.quantity;
        }
        return acc;
      }, {} as Record<string, number>);

      // If any category has more than 50 units, charge $30, otherwise $15
      const hasOverage = Object.values(categoryQuantities).some(qty => qty > 50);
      const totalAmount = hasOverage ? 30 : 15;

      // Insert the rental record
      const [rental] = await db.insert(rentals).values({
        customerName,
        customerEmail,
        startDate: start,
        endDate: end,
        totalAmount,
        status: "pending",
        deliveryOption: "pickup",
        deliveryAddress: null,
        deliveryDate: start,
        pickupDate: start,
        createdAt: new Date(),
      }).returning();

      // Create rental items and update inventory
      for (const item of items) {
        const [rentalItem] = await db.insert(rentalItems).values({
          rentalId: rental.id,
          productId: item.productId,
          quantity: item.quantity
        }).returning();

        // Update inventory for each date in the range
        let currentDate = start;
        while (currentDate <= end) {
          const formattedDate = format(currentDate, 'yyyy-MM-dd');

          // Update or insert inventory record for this specific product
          await db
            .insert(inventoryDates)
            .values({
              date: formattedDate,
              productId: item.productId,
              availableStock: 100 - item.quantity,
            })
            .onConflictDoUpdate({
              target: [inventoryDates.date, inventoryDates.productId],
              set: {
                availableStock: sql`${inventoryDates.availableStock} - ${item.quantity}`,
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