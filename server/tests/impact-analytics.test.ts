import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getImpactStats } from '../services/impact-analytics';
import { db } from '@db';

// Mock the database
jest.mock('@db', () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn(),
    },
}));

describe('getImpactStats', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should calculate impact stats correctly', async () => {
        // Mock data
        const mockRentalsCount = [{ count: 100 }];
        const mockItemsSum = [{ totalQuantity: 500 }];
        const mockStockSum = [{ totalStock: 1000 }];

        // Setup chain mocks
        const fromMock = jest.fn();

        // Order in service: 
        // 1. rentalItems (wasteDiverted)
        // 2. rentals (totalRentals)
        // 3. products (potentialImpact)

        fromMock
            .mockResolvedValueOnce(mockItemsSum)   // 1. rentalItems
            .mockResolvedValueOnce(mockRentalsCount) // 2. rentals
            .mockResolvedValueOnce(mockStockSum);    // 3. products

        (db.select as any).mockReturnValue({
            from: fromMock
        });

        const stats = await getImpactStats();

        // Assertions
        expect(stats.wasteDiverted).toBe(500);
        expect(stats.totalRentals).toBe(100);

        // CO2 = 500 * 0.05 = 25
        expect(stats.co2Saved).toBe(25);

        // Water = 500 * 0.5 = 250
        expect(stats.waterSaved).toBe(250);

        // Potential = 1000 * 365 = 365000
        expect(stats.potentialImpact).toBe(365000);
    });

    it('should handle zero values gracefully', async () => {
        const fromMock = jest.fn().mockResolvedValue([]);
        (db.select as any).mockReturnValue({ from: fromMock });

        const stats = await getImpactStats();

        expect(stats.wasteDiverted).toBe(0);
        expect(stats.co2Saved).toBe(0);
        expect(stats.waterSaved).toBe(0);
        expect(stats.potentialImpact).toBe(0);
    });
});
