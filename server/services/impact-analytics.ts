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

export async function getImpactStats(): Promise<ImpactStats> {
    // 1. Get total items rented and impact metrics
    // We join rentalItems with products to get the specific impact per item
    const [impactResult] = await db
        .select({
            totalQuantity: sql<number>`sum(${rentalItems.quantity})`,
            // CO2 is stored in grams, calculation returns total grams
            totalCo2Grams: sql<number>`sum(${rentalItems.quantity} * ${products.co2Saved})`,
            // Water is stored in liters
            totalWater: sql<number>`sum(${rentalItems.quantity} * ${products.waterSaved})`
        })
        .from(rentalItems)
        .leftJoin(products, eq(rentalItems.productId, products.id));

    const wasteDiverted = Number(impactResult?.totalQuantity) || 0;

    // Convert grams to kg by dividing by 1000, then round to 2 decimals
    const totalCo2Grams = Number(impactResult?.totalCo2Grams) || 0;
    const co2Saved = Math.round((totalCo2Grams / 1000) * 100) / 100;

    // Water is already in liters, just round
    const waterSaved = Math.round((Number(impactResult?.totalWater) || 0) * 100) / 100;

    // 2. Get total number of rental orders
    const [rentalsResult] = await db
        .select({
            count: sql<number>`count(*)`
        })
        .from(rentals);

    const totalRentals = Number(rentalsResult?.count) || 0;

    // 4. Calculate Potential Impact (Catalogue Capacity)
    // Sum of (total_stock * 365) for each product
    // We can also calculate potential CO2/Water if needed, but for now we keep it as items count
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
