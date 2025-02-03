import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@db/schema";
import CalendarPicker from "@/components/calendar-picker";
import type { DateRange } from "react-day-picker";

export default function Catalog() {
  const [showCalendar, setShowCalendar] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleNext = async () => {
    if (dateRange?.from && dateRange?.to) {
      try {
        // Check inventory availability before proceeding
        const response = await fetch(
          `/api/inventory/available?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
        );
        const data = await response.json();

        if (data.availableStock <= 0) {
          toast({
            title: "No Availability",
            description: "Sorry, no items are available for the selected dates.",
            variant: "destructive",
          });
          return;
        }

        sessionStorage.setItem('rentalDates', JSON.stringify({
          startDate: dateRange.from,
          endDate: dateRange.to
        }));
        navigate('/checkout');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check inventory availability.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="sm:max-w-xl">
          <div className="py-6">
            <h2 className="text-2xl font-semibold mb-2 text-green-800">Select Your Rental Period</h2>
            <p className="text-gray-600 mb-6">
              Choose your preferred pickup and return dates. Our eco-friendly dining items are available for rental periods between 1 and 30 days.
            </p>
            <CalendarPicker 
              onDateRangeChange={setDateRange}
            />
            <Button
              className="w-full mt-6"
              disabled={!dateRange?.from || !dateRange?.to}
              onClick={handleNext}
            >
              Next
            </Button>
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