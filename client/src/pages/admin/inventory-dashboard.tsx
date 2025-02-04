
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Product } from "@db/schema";
import { startOfDay, endOfDay, format, addDays, eachDayOfInterval } from "date-fns";
import { useState } from "react";

interface InventoryData {
  stockByProduct: Record<string, number>;
}

export default function InventoryDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate date range for current month
  const startDate = startOfDay(selectedDate);
  const endDate = endOfDay(addDays(startDate, 30));

  // Fetch inventory levels
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery<InventoryData>({
    queryKey: ["/api/inventory/available", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }],
  });

  const isLoading = productsLoading || inventoryLoading;

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Calendar</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading inventory data...</div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold p-2">{day}</div>
                ))}
                {days.map((day, index) => (
                  <Card key={index} className="p-2 min-h-[120px] text-sm">
                    <div className="font-semibold mb-1">{format(day, 'd')}</div>
                    <div className="space-y-1">
                      {products?.map(product => (
                        <div key={product.id} className="flex justify-between">
                          <span className="truncate">{product.name}:</span>
                          <span className={`font-medium ${
                            (inventoryData?.stockByProduct[product.id] || 0) === 0 
                              ? 'text-red-500' 
                              : 'text-green-500'
                          }`}>
                            {inventoryData?.stockByProduct[product.id] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
