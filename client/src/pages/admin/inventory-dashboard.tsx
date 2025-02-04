
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

  const handlePreviousMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calculate date range for current month
  const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  // Fetch inventory levels for each day
  const fetchDailyInventory = async (date: Date) => {
    const response = await fetch(`/api/inventory/${format(date, 'yyyy-MM-dd')}`);
    return response.json();
  };

  // Fetch inventory for all days in parallel
  const { data: inventoryDataByDate, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory/daily", startDate, endDate],
    queryFn: async () => {
      const inventoryPromises = days.map(day => fetchDailyInventory(day));
      const inventoryResults = await Promise.all(inventoryPromises);
      return days.reduce((acc, day, index) => {
        acc[format(day, 'yyyy-MM-dd')] = inventoryResults[index];
        return acc;
      }, {} as Record<string, any>);
    }
  });

  const isLoading = productsLoading || inventoryLoading;

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Calendar</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Availability</CardTitle>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>&lt; Previous</Button>
                <span className="font-semibold">{format(selectedDate, 'MMMM yyyy')}</span>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>Next &gt;</Button>
              </div>
            </div>
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
                    <div className="font-semibold mb-1">{format(day, 'MMM d')}</div>
                    <div className="space-y-1">
                      {products?.map(product => (
                        <div key={product.id} className="flex justify-between">
                          <span className="truncate">{product.name}:</span>
                          <span className={`font-medium ${
                            (inventoryDataByDate?.[format(day, 'yyyy-MM-dd')]?.availableStock || 0) === 0 
                              ? 'text-red-500' 
                              : 'text-green-500'
                          }`}>
                            {inventoryDataByDate?.[format(day, 'yyyy-MM-dd')]?.availableStock || 0}
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
