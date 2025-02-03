import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@db/schema";
import CalendarPicker from "@/components/calendar-picker";
import type { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Catalog() {
  const [showCalendar, setShowCalendar] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [, navigate] = useLocation();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      // Store the selected dates in sessionStorage
      sessionStorage.setItem('rentalDates', JSON.stringify({
        startDate: range.from,
        endDate: range.to
      }));
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="sm:max-w-xl">
          <div className="py-6">
            <h2 className="text-lg font-semibold mb-4">Select Your Rental Dates</h2>
            <CalendarPicker 
              onDateRangeChange={handleDateSelect}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}