                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { products, rentals, rentalItems, inventoryDates, feedback } from "@db/schema";
import { eq, and, between, sql, inArray, desc } from "drizzle-orm";
import { addDays, format } from "date-fns";
import { sendOrderNotification } from './services/twilio';
import twilioRoutes from './routes/twilio';

/**
 * Registers all API routes for the application
 * Handles endpoints for products, inventory management, rentals, and Twilio webhooks
 * 
 * @param {Express} app - Express application instance
 * @returns {Server} HTTP server instance
 */
export function registerRoutes(app: Express): Server {
  /**
   * Register Twilio webhook routes for handling messaging callbacks
   */
  app.use('/api/webhook/twilio', twilioRoutes);

  /**
   * Get all available products
   * @route GET /api/products
   * @returns {Object[]} List of all products with their details
   */
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

  /**
   * Get recent orders for admin notifications
   * @route GET /api/orders/recent
   * @returns {Object[]} List of recent orders
   */
  app.get("/api/orders/recent", async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      const recentOrders = await db.query.rentals.findMany({
        orderBy: (rentals, { desc }) => [desc(rentals.createdAt)],
        limit: 20,
      });
      res.json(recentOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ error: "Failed to fetch recent orders" });
    }
  });

  /**
   * Get available inventory for a specific date range
   * Calculates minimum available stock for each product within the range
   * 
   * @route GET /api/inventory/available
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Object} Minimum available stock for each product
   */
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

  // Get all rental items
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

  /**
   * Create a new rental order
   * Handles inventory verification, rental creation, and WhatsApp notifications
   * Uses transaction to ensure data consistency
   * 
   * @route POST /api/rentals
   * @param {Object} req.body
   * @param {string} req.body.customerName - Name of the customer
   * @param {string} req.body.customerEmail - Email of the customer
   * @param {string} req.body.phoneNumber - Customer's phone number
   * @param {Object[]} req.body.items - Array of items to rent
   * @param {string} req.body.startDate - Rental start date
   * @param {string} req.body.endDate - Rental end date
   * @returns {Object} Created rental order details
   */
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

      // Use transaction to ensure atomic operations
      const rental = await db.transaction(async (tx) => {
        // Lock and check inventory with FOR UPDATE
        const inventoryForRange = await tx.query.inventoryDates.findMany({
          where: and(
            between(
              inventoryDates.date, 
              format(start, 'yyyy-MM-dd'), 
              format(end, 'yyyy-MM-dd')
            )
          ),
          for: 'update'
        });

        // Verify inventory availability for each product
        for (const item of items) {
          const minStock = inventoryForRange.length > 0
            ? Math.min(...inventoryForRange
                .filter(inv => inv.productId === item.productId)
                .map(inv => inv.availableStock))
            : 100;

          if (minStock < item.quantity) {
            throw new Error(`Not enough inventory available for product ID ${item.productId}`);
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
          await db.insert(rentalItems).values({
            rentalId: rental.id,
            productId: item.productId,
            quantity: item.quantity
          });

          // Update inventory for each date in the range
          let currentDate = start;
          while (currentDate <= end) {
            const formattedDate = format(currentDate, 'yyyy-MM-dd');

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

        // Send notifications after successful rental creation
        const notificationResult = await sendOrderNotification(
          rental.id, 
          rental.customerName, 
          Number(rental.totalAmount),
          phoneNumber // Pass customer phone number
        );

        // Import and send email notifications as backup
        const { sendOrderEmailNotification } = await import('./services/email');
        const emailResult = await sendOrderEmailNotification(
          rental.id,
          rental.customerName,
          rental.customerEmail,
          Number(rental.totalAmount)
        );

        if (!notificationResult.success) {
          console.warn(`SMS notifications failed for rental ID: ${rental.id}`, 
            notificationResult.results?.filter(r => !r.success).map(r => `${r.recipient}: ${r.hint}`).join(', ') || 'Unknown error'
          );
        }

        if (!emailResult.success) {
          console.warn(`Email notifications failed for rental ID: ${rental.id}`, 
            emailResult.results?.filter(r => !r.success).map(r => `${r.recipient}: ${r.error}`).join(', ') || 'Unknown error'
          );
        }

        return rental;
      });

      res.status(201).json(rental);
    } catch (error) {
      console.error('Error creating rental:', error);
      if (error.message.includes('Not enough inventory')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating rental" });
      }
    }
  });

  /**
   * Submit customer feedback
   * @route POST /api/feedback
   * @param {Object} req.body - Feedback data
   * @returns {Object} Created feedback record
   */
  app.post("/api/feedback", async (req, res) => {
    try {
      const {
        customerName,
        rentalDate,
        cityOfUse,
        imageUrls,
        likelihoodToRentAgain,
        likelihoodToRecommend,
        orderingExperience,
        suggestions,
        platesUsed,
        glassesUsed,
        spoonsUsed,
        marketingConsent
      } = req.body;

      // Validate required fields
      if (!rentalDate || !cityOfUse || !likelihoodToRentAgain || !likelihoodToRecommend || !orderingExperience) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate rating values (1-5)
      const ratings = [likelihoodToRentAgain, likelihoodToRecommend, orderingExperience];
      if (ratings.some(rating => rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Ratings must be between 1 and 5" });
      }

      const [newFeedback] = await db.insert(feedback).values({
        customerName: customerName || null,
        rentalDate: new Date(rentalDate),
        cityOfUse,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
        likelihoodToRentAgain,
        likelihoodToRecommend,
        orderingExperience,
        suggestions: suggestions || null,
        platesUsed: platesUsed || null,
        glassesUsed: glassesUsed || null,
        spoonsUsed: spoonsUsed || null,
        marketingConsent: marketingConsent || false,
        isVisible: false, // Admin needs to approve
        createdAt: new Date()
      }).returning();

      res.status(201).json(newFeedback);
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ message: "Error submitting feedback" });
    }
  });

  /**
   * Get all feedback for admin review
   * @route GET /api/feedback
   * @returns {Object[]} List of all feedback with visibility control
   */
  app.get("/api/feedback", async (_req, res) => {
    try {
      const allFeedback = await db.query.feedback.findMany({
        orderBy: desc(feedback.createdAt)
      });

      // Parse image URLs for each feedback
      const processedFeedback = allFeedback.map(fb => ({
        ...fb,
        imageUrls: fb.imageUrls ? JSON.parse(fb.imageUrls) : []
      }));

      res.json(processedFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: "Error fetching feedback" });
    }
  });

  /**
   * Get public feedback (only visible ones)
   * @route GET /api/feedback/public
   * @returns {Object[]} List of approved feedback for public display
   */
  app.get("/api/feedback/public", async (_req, res) => {
    try {
      const publicFeedback = await db.query.feedback.findMany({
        where: eq(feedback.isVisible, true),
        orderBy: desc(feedback.createdAt)
      });

      // Parse image URLs and filter out sensitive data
      const processedFeedback = publicFeedback.map(fb => ({
        id: fb.id,
        customerName: fb.customerName,
        rentalDate: fb.rentalDate,
        cityOfUse: fb.cityOfUse,
        imageUrls: fb.imageUrls ? JSON.parse(fb.imageUrls) : [],
        likelihoodToRentAgain: fb.likelihoodToRentAgain,
        likelihoodToRecommend: fb.likelihoodToRecommend,
        orderingExperience: fb.orderingExperience,
        suggestions: fb.suggestions,
        createdAt: fb.createdAt
      }));

      res.json(processedFeedback);
    } catch (error) {
      console.error('Error fetching public feedback:', error);
      res.status(500).json({ message: "Error fetching public feedback" });
    }
  });

  /**
   * Update feedback visibility (admin only)
   * @route PATCH /api/feedback/:id/visibility
   * @param {boolean} req.body.isVisible - Whether feedback should be public
   * @returns {Object} Updated feedback record
   */
  app.patch("/api/feedback/:id/visibility", async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;

      if (typeof isVisible !== 'boolean') {
        return res.status(400).json({ message: "isVisible must be a boolean" });
      }

      const [updatedFeedback] = await db
        .update(feedback)
        .set({ isVisible })
        .where(eq(feedback.id, parseInt(id)))
        .returning();

      if (!updatedFeedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      res.json(updatedFeedback);
    } catch (error) {
      console.error('Error updating feedback visibility:', error);
      res.status(500).json({ message: "Error updating feedback visibility" });
    }
  });

  /**
   * Get usage analytics from feedback data
   * @route GET /api/feedback/analytics
   * @returns {Object} Analytics data with totals and year-to-date metrics
   */
  app.get("/api/feedback/analytics", async (_req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);

      // Get all feedback with usage data
      const allFeedback = await db.query.feedback.findMany({
        where: sql`(plates_used IS NOT NULL OR glasses_used IS NOT NULL OR spoons_used IS NOT NULL)`
      });

      // Get year-to-date feedback
      const ytdFeedback = await db.query.feedback.findMany({
        where: and(
          sql`(plates_used IS NOT NULL OR glasses_used IS NOT NULL OR spoons_used IS NOT NULL)`,
          sql`created_at >= ${yearStart}`
        )
      });

      // Calculate totals
      const totalStats = allFeedback.reduce((acc, fb) => {
        acc.plates += fb.platesUsed || 0;
        acc.glasses += fb.glassesUsed || 0;
        acc.spoons += fb.spoonsUsed || 0;
        acc.events += 1;
        return acc;
      }, { plates: 0, glasses: 0, spoons: 0, events: 0 });

      // Calculate year-to-date stats
      const ytdStats = ytdFeedback.reduce((acc, fb) => {
        acc.plates += fb.platesUsed || 0;
        acc.glasses += fb.glassesUsed || 0;
        acc.spoons += fb.spoonsUsed || 0;
        acc.events += 1;
        return acc;
      }, { plates: 0, glasses: 0, spoons: 0, events: 0 });

      // Calculate average ratings
      const ratingsData = await db.query.feedback.findMany({
        where: sql`likelihood_to_rent_again IS NOT NULL`
      });

      const avgRatings = ratingsData.reduce((acc, fb) => {
        acc.rentAgain += fb.likelihoodToRentAgain;
        acc.recommend += fb.likelihoodToRecommend;
        acc.ordering += fb.orderingExperience;
        acc.count += 1;
        return acc;
      }, { rentAgain: 0, recommend: 0, ordering: 0, count: 0 });

      const analytics = {
        usage: {
          total: totalStats,
          yearToDate: ytdStats
        },
        averageRatings: avgRatings.count > 0 ? {
          likelihoodToRentAgain: (avgRatings.rentAgain / avgRatings.count).toFixed(1),
          likelihoodToRecommend: (avgRatings.recommend / avgRatings.count).toFixed(1),
          orderingExperience: (avgRatings.ordering / avgRatings.count).toFixed(1)
        } : null,
        totalFeedbackCount: ratingsData.length,
        year: currentYear
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}