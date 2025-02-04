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
import { Card, CardContent } from "@/components/ui/card";

interface ProductAvailability extends Product {
  availableStock: number;
}

export default function Catalog() {
  const [showCalendar, setShowCalendar] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [productAvailability, setProductAvailability] = useState<ProductAvailability[]>([]);
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleNext = async () => {
    if (dateRange?.from && dateRange?.to) {
      try {
        // Check inventory availability for each product
        const response = await fetch(
          `/api/inventory/available?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
        );
        const data = await response.json();

        if (!products) return;

        // Map products with their availability
        const availability = products.map(product => ({
          ...product,
          availableStock: data.stockByProduct[product.id] || 0
        }));

        setProductAvailability(availability);
        setShowCalendar(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to check inventory availability.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddToCart = (productId: number, quantity: number) => {
    const product = productAvailability.find(p => p.id === productId);
    if (!product) return;

    const currentQuantity = cart.get(productId) || 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity > product.availableStock) {
      toast({
        title: "Cannot Add to Cart",
        description: "Not enough items available in stock.",
        variant: "destructive",
      });
      return;
    }

    setCart(new Map(cart.set(productId, newQuantity)));
    toast({
      title: "Added to Cart",
      description: `Added ${quantity} item(s) to cart.`,
    });
  };

  const handleProceedToCheckout = () => {
    if (dateRange?.from && dateRange?.to && cart.size > 0) {
      sessionStorage.setItem('rentalDates', JSON.stringify({
        startDate: dateRange.from,
        endDate: dateRange.to
      }));
      sessionStorage.setItem('cart', JSON.stringify(Array.from(cart.entries())));
      navigate('/checkout');
    }
  };

  const handleChangeDates = () => {
    setShowCalendar(true);
    setCart(new Map());
    setProductAvailability([]);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="sm:max-w-xl">
          <div className="py-6">
            <h2 className="text-2xl font-semibold mb-2 text-green-800">Select Your Rental Period</h2>
            <p className="text-gray-600 mb-6">
              Choose your preferred pickup and return dates.
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
        {!showCalendar && (
          <>
            <div className="flex justify-between items-center mb-6">
              <Button onClick={handleChangeDates} variant="outline">
                Change Dates
              </Button>
              {cart.size > 0 && (
                <Button onClick={handleProceedToCheckout}>
                  Proceed to Checkout ({Array.from(cart.values()).reduce((a, b) => a + b, 0)} items)
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                productAvailability.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    availableStock={product.availableStock}
                    onAddToCart={(quantity) => handleAddToCart(product.id, quantity)}
                    cartQuantity={cart.get(product.id) || 0}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}