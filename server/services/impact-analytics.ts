import { db } from "@db";
import { products, rentals, rentalItems, inventoryDates } from "@db/schema";
import { sql, eq } from "drizzle-orm";

export interface ImpactStats {
    wasteDiverted: number; // Total items rented (all time)
    co2Saved: number;      // in kg
    waterSaved: number;    // in liters
    potentialImpact: number; // yearly capacity (total stock * 365)
    totalRentals: number;
}

// Estimates per item
const CO2_PER_ITEM_KG = 0.05; // ~50g CO2 saved per reuse vs disposable
const WATER_PER_ITEM_LITER = 0.5; // ~0.5L water saved per reuse vs manufacturing

export async function getImpactStats(): Promise<ImpactStats> {
    // 1. Get total items rented across all time
    // We sum the quantity from all rental_items
    const [itemsResult] = await db
        .select({
            totalQuantity: sql<number>`sum(${rentalItems.quantity})`
        })
        .from(rentalItems);

    const wasteDiverted = Number(itemsResult?.totalQuantity) || 0;

    // 2. Get total number of rental orders
    const [rentalsResult] = await db
        .select({
            count: sql<number>`count(*)`
        })
        .from(rentals);

    const totalRentals = Number(rentalsResult?.count) || 0;

    // 3. Calculate Environmental Savings
    const co2Saved = Math.round(wasteDiverted * CO2_PER_ITEM_KG * 100) / 100;
    const waterSaved = Math.round(wasteDiverted * WATER_PER_ITEM_LITER * 100) / 100;

    // 4. Calculate Potential Impact (Catalogue Capacity)
    // Sum of total_stock of all products * 365 days
    const [stockResult] = await db
        .select({
            totalStock: sql<number>`sum(${products.totalStock})`
        })
        .from(products);

    const totalStock = Number(stockResult?.totalStock) || 0;
    const potentialImpact = totalStock * 365;

    return {
        wasteDiverted,
        co2Saved,
        waterSaved,
        potentialImpact,
        totalRentals
    };
}
