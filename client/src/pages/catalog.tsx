import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@db/schema";
import CalendarPicker from "@/components/calendar-picker";
import type { DateRange } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface ProductAvailability extends Product {
  availableStock: number;
}

export default function Catalog() {
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
        const response = await fetch(
          `/api/inventory/available?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
        );
        const data = await response.json();

        if (!products) return;

        const availability = products.map(product => ({
          ...product,
          availableStock: data.stockByProduct[product.id] || 0
        }));

        setProductAvailability(availability);
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


  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Event Date</h2>
        <div className="grid gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Calendar className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">
                    Choose your pickup date (when you'll pick the items) and return date (when you'll return them). 
                    This helps us ensure the items are available for your entire event.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <CalendarPicker
          className="bg-white mb-6"
          onDateRangeChange={setDateRange}
        />

        <Button
          onClick={handleNext}
          disabled={!dateRange?.from || !dateRange?.to}
          className="w-full"
        >
          Check Availability
        </Button>

        <div className="flex justify-between items-center mt-6">
          {cart.size > 0 && (
            <Button onClick={handleProceedToCheckout}>
              Proceed to Checkout ({Array.from(cart.values()).reduce((a, b) => a + b, 0)} items)
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
      </div>
    </div>
  );
}