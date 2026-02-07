import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getImpactStats } from '../services/impact-analytics';
import { db } from '@db';
import { products, rentals, rentalItems, inventoryDates } from '@db/schema';
import { eq } from 'drizzle-orm';

describe('Impact Analytics Integration', () => {
    // These IDs will be populated during test setup
    let rentalId: number;
    let productId1: number;
    let productId2: number;

    beforeEach(async () => {
        // Clean up affected tables before test (optional, careful with real DB)
        // For a development DB, we might just append data and check for increments, 
        // but for accurate testing of OUR logic, we want known state.
        // Since we don't want to wipe the user's dev DB, we will insert new unique items 
        // and calculate the impact for *those specific items*, 
        // OR we just rely on the fact that existing data + our data = result.
        // Let's rely on "delta" verification or just check if the function runs without error
        // and returns a plausible number.

        // BETTER STRATEGY: Create specific products with unique impacts
        const [p1] = await db.insert(products).values({
            name: 'Test Plate High Impact',
            description: 'Test',
            imageUrl: 'test',
            category: 'plates',
            totalStock: 100,
            co2Saved: "1.5",   // 1.5 kg
            waterSaved: "5.0", // 5.0 L
        }).returning();
        productId1 = p1.id;

        const [p2] = await db.insert(products).values({
            name: 'Test Spoon Low Impact',
            description: 'Test',
            imageUrl: 'test',
            category: 'cutlery',
            totalStock: 100,
            co2Saved: "0.1",
            waterSaved: "0.5",
        }).returning();
        productId2 = p2.id;

        // Create a rental
        const [r] = await db.insert(rentals).values({
            customerName: 'Test',
            customerEmail: 'test@test.com',
            startDate: new Date(),
            endDate: new Date(),
            totalAmount: "10",
            status: 'completed',
            deliveryOption: 'pickup',
            deliveryDate: new Date(),
            pickupDate: new Date()
        }).returning();
        rentalId = r.id;

        // Rent 10 High Impact items
        await db.insert(rentalItems).values({
            rentalId: r.id,
            productId: p1.id,
            quantity: 10
        });

        // Rent 20 Low Impact items
        await db.insert(rentalItems).values({
            rentalId: r.id,
            productId: p2.id,
            quantity: 20
        });
    });

    afterEach(async () => {
        // Cleanup
        if (rentalId) {
            await db.delete(rentalItems).where(eq(rentalItems.rentalId, rentalId));
            await db.delete(rentals).where(eq(rentals.id, rentalId));
        }
        if (productId1) await db.delete(products).where(eq(products.id, productId1));
        if (productId2) await db.delete(products).where(eq(products.id, productId2));
    });

    it('should calculate impact based on product-specific factors', async () => {
        const stats = await getImpactStats();

        // We can't know the exact total because of existing data, 
        // but we know it must be AT LEAST what we just added.
        // 10 * 1.5 = 15 kg CO2
        // 20 * 0.1 = 2 kg CO2
        // Total added CO2 = 17 kg

        // 10 * 5.0 = 50 L Water
        // 20 * 0.5 = 10 L Water
        // Total added Water = 60 L

        expect(stats.co2Saved).toBeGreaterThanOrEqual(17);
        expect(stats.waterSaved).toBeGreaterThanOrEqual(60);
        expect(stats.wasteDiverted).toBeGreaterThanOrEqual(30); // 10 + 20 items
    });
});
