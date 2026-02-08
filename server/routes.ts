import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import {
  products, rentals, rentalItems, inventoryDates, feedback,
  contentItems, contentCategories, contentCategoryMapping, contentTags, contentTagMapping, contentBookmarks
} from "@db/schema";
// Note: inArray is used instead of exists for category filtering — see the
// GET /api/content handler comments for the explanation of why exists() is
// incompatible with Drizzle's relational query API (db.query.*.findMany)
import { eq, and, sql, or, desc, inArray } from "drizzle-orm";
import { addDays, format } from "date-fns";
import { sendOrderNotification } from './services/twilio';
import twilioRoutes from './routes/twilio';
import { fetchUrlMetadata, extractDomain } from './services/metadata-fetcher';
import { getImpactStats } from './services/impact-analytics';

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

  // --- IMPACT ANALYTICS API ---

  /**
   * Get impact statistics (waste diverted, CO2 saved, etc.)
   * @route GET /api/analytics/impact
   */
  app.get("/api/analytics/impact", async (_req, res) => {
    try {
      const stats = await getImpactStats();
      // Set short cache to avoid re-calculating on every navigation
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json(stats);
    } catch (error) {
      console.error('Error fetching impact stats:', error);
      res.status(500).json({ message: "Error calculating impact statistics" });
    }
  });

  // --- CONTENT HUB API ---

  // PUBLIC ENDPOINTS

  /**
   * Get all content items with filtering and search
   * @route GET /api/content
   */
  app.get("/api/content", async (req, res) => {
    try {
      const { category, type, search, sort = 'recent', page = 1, limit = 20 } = req.query;

      // Start with base condition: only show published content
      const conditions = [eq(contentItems.status, 'published')];

      // Category filter: uses a two-step approach to avoid an incompatibility
      // between Drizzle's exists() subquery and the relational query API
      // (db.query.*.findMany). The exists() approach produced invalid SQL
      // referencing the raw table name "content_items" while the relational
      // query aliases it as "contentItems", causing a PostgreSQL error:
      // "invalid reference to FROM-clause entry for table 'content_items'".
      //
      // Fix: first query the mapping table for content IDs that belong to
      // the selected category, then use inArray() to filter the main query.
      if (category) {
        // Step 1: Get all content IDs associated with the selected category
        const matchingIds = await db
          .select({ contentId: contentCategoryMapping.contentId })
          .from(contentCategoryMapping)
          .where(eq(contentCategoryMapping.categoryId, Number(category)));
        const ids = matchingIds.map(r => r.contentId);

        // If no content is mapped to this category, return early with empty results
        if (ids.length === 0) {
          return res.json({ items: [], page: Number(page), limit: Number(limit) });
        }

        // Step 2: Add an inArray condition so the main query only returns
        // content items whose IDs match the category mapping results
        conditions.push(inArray(contentItems.id, ids));
      }

      // Optional content type filter (e.g., "article", "video")
      if (type) {
        conditions.push(eq(contentItems.contentType, type as string));
      }

      // Optional search filter: case-insensitive match on title or description
      if (search) {
        conditions.push(or(
          sql`${contentItems.title} ILIKE ${`%${search}%`}`,
          sql`${contentItems.description} ILIKE ${`%${search}%`}`
        ));
      }

      // Execute the main query using Drizzle's relational API to include
      // nested category data via the categoryMappings relation
      const items = await db.query.contentItems.findMany({
        where: and(...conditions),
        with: {
          categoryMappings: {
            with: { category: true }
          }
        },
        orderBy: sort === 'popular' ? desc(contentItems.viewCount) : desc(contentItems.createdAt),
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      });

      res.json({ items, page: Number(page), limit: Number(limit) });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ message: "Error fetching content" });
    }
  });

  /**
   * Get featured content items
   * @route GET /api/content/featured
   */
  app.get("/api/content/featured", async (_req, res) => {
    try {
      const featured = await db.query.contentItems.findMany({
        where: and(
          eq(contentItems.status, 'published'),
          eq(contentItems.isFeatured, true)
        ),
        with: {
          categoryMappings: { with: { category: true } }
        },
        limit: 5,
        orderBy: desc(contentItems.publishedAt),
      });
      res.json(featured);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured content" });
    }
  });

  /**
   * Get single content item details
   * @route GET /api/content/:id
   */
  app.get("/api/content/:id", async (req, res) => {
    try {
      const content = await db.query.contentItems.findFirst({
        where: eq(contentItems.id, Number(req.params.id)),
        with: {
          categoryMappings: { with: { category: true } },
          tagMappings: { with: { tag: true } }
        }
      });

      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Increment view count asynchronously
      db.update(contentItems)
        .set({ viewCount: sql`${contentItems.viewCount} + 1` })
        .where(eq(contentItems.id, Number(req.params.id)))
        .execute();

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content" });
    }
  });

  /**
   * Get visible content categories for public view
   * @route GET /api/categories
   */
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await db.query.contentCategories.findMany({
        where: eq(contentCategories.isVisible, true),
        orderBy: contentCategories.order,
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  /**
   * Get all content categories (Admin)
   * @route GET /api/admin/categories
   */
  app.get("/api/admin/categories", async (_req, res) => {
    try {
      const categories = await db.query.contentCategories.findMany({
        orderBy: contentCategories.order,
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  /**
   * Create content category
   * @route POST /api/categories
   */
  app.post("/api/categories", async (req, res) => {
    try {
      const { name, icon, color, description } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const [newCategory] = await db.insert(contentCategories).values({
        name,
        slug,
        icon,
        color,
        description,
        order: 0,
        isVisible: true
      }).returning();

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: "Error creating category" });
    }
  });

  /**
   * Update content category
   * @route PATCH /api/categories/:id
   */
  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const { name, icon, color, description, isVisible, order } = req.body;

      const updateData: any = {};
      if (name) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      if (icon !== undefined) updateData.icon = icon;
      if (color !== undefined) updateData.color = color;
      if (description !== undefined) updateData.description = description;
      if (isVisible !== undefined) updateData.isVisible = isVisible;
      if (order !== undefined) updateData.order = order;

      const [updated] = await db.update(contentCategories)
        .set(updateData)
        .where(eq(contentCategories.id, Number(req.params.id)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: "Error updating category" });
    }
  });

  // ADMIN ENDPOINTS

  /**
   * Admin: Fetch metadata for a URL before creation
   * @route POST /api/admin/content/fetch-metadata
   */
  app.post("/api/admin/content/fetch-metadata", async (req, res) => {
    try {
      const { url } = req.body;

      // Check for duplicate URL
      const existing = await db.query.contentItems.findFirst({
        where: eq(contentItems.url, url)
      });

      if (existing) {
        return res.status(409).json({ message: "This URL already exists in the library" });
      }

      const metadata = await fetchUrlMetadata(url);
      const domain = extractDomain(url);

      res.json({
        ...metadata,
        thumbnailUrl: metadata.image, // Map for database consistency
        source: domain,
        url,
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      res.status(500).json({ message: "Failed to fetch URL metadata" });
    }
  });

  /**
   * Admin: Create new content item
   * @route POST /api/admin/content
   */
  app.post("/api/admin/content", async (req, res) => {
    try {
      const {
        title, description, url, thumbnailUrl, contentType,
        source, readingTime, categoryId, isFeatured
      } = req.body;

      const [newContent] = await db.insert(contentItems).values({
        title,
        description,
        url,
        thumbnailUrl,
        contentType,
        source,
        readingTime,
        isFeatured: isFeatured || false,
        status: 'published',
        publishedAt: new Date(),
      }).returning();

      // Map to primary category
      await db.insert(contentCategoryMapping).values({
        contentId: newContent.id,
        categoryId: Number(categoryId),
        isPrimary: true,
      });

      res.status(201).json(newContent);
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ message: "Error creating content" });
    }
  });

  /**
   * Admin: Update existing content
   * @route PATCH /api/admin/content/:id
   */
  app.patch("/api/admin/content/:id", async (req, res) => {
    try {
      const [updated] = await db.update(contentItems)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(contentItems.id, Number(req.params.id)))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Content not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating content" });
    }
  });

  /**
   * Admin: Delete content item
   * @route DELETE /api/admin/content/:id
   */
  app.delete("/api/admin/content/:id", async (req, res) => {
    try {
      await db.delete(contentItems)
        .where(eq(contentItems.id, Number(req.params.id)));
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting content" });
    }
  });

  // --- END CONTENT HUB API ---

  /**
   * Update product details (stock, impact metrics)
   * @route PATCH /api/products/:id
   */
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

      const { co2Saved, waterSaved, totalStock } = req.body;

      await db.update(products)
        .set({
          co2Saved: co2Saved ? String(co2Saved) : undefined,
          waterSaved: waterSaved ? String(waterSaved) : undefined,
          totalStock: totalStock !== undefined ? Number(totalStock) : undefined
        })
        .where(eq(products.id, id));

      const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: "Error updating product" });
    }
  });

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
      const allProducts = await db.query.products.findMany({
        orderBy: (products, { asc }) => [asc(products.id)]
      });
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
        const totalAmount = hasOverage ? "30.00" : "15.00";

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

        // Prepare order details for notification
        const orderDetails = {
          startDate: format(start, 'MMMM do, yyyy'),
          endDate: format(end, 'MMMM do, yyyy'),
          items: items.map(item => {
            const product = productsData.find(p => p.id === item.productId);
            return {
              name: product?.name || 'Unknown Product',
              quantity: item.quantity
            };
          }),
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
        };

        // Send notifications after successful rental creation
        const notificationResult = await sendOrderNotification(
          rental.id,
          rental.customerName,
          Number(rental.totalAmount),
          phoneNumber, // Pass customer phone number
          orderDetails // Pass order details for message formatting
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