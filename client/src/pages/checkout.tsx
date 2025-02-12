import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { RentalFormData } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@db/schema";
import { format } from "date-fns";

const formSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [totalAmount, setTotalAmount] = useState<number>();
  
  // Retrieve rental dates and cart from sessionStorage
  const rentalDates = JSON.parse(sessionStorage.getItem('rentalDates') || '{}');
  const cartItems: [number, number][] = JSON.parse(sessionStorage.getItem('cart') || '[]');

  useEffect(() => {
    const calculatePrice = async () => {
      try {
        const formattedItems = cartItems.map(([productId, quantity]) => ({
          productId,
          quantity
        }));
        const response = await apiRequest("POST", "/api/calculate-price", { items: formattedItems });
        const data = await response.json();
        setTotalAmount(data.totalAmount);
      } catch (error) {
        console.error('Error calculating price:', error);
      }
    };
    calculatePrice();
  }, [cartItems]);

  // Fetch products to get details for cart items
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<RentalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      phoneNumber: "",
    }
  });

  const cartTotal = cartItems.reduce((total, [, quantity]) => total + quantity, 0);

  const getProductDetails = (productId: number) => {
    return products?.find(p => p.id === productId);
  };

  const onSubmit = async (data: RentalFormData) => {
    try {
      // Format cart items for the API
      const formattedItems = cartItems.map(([productId, quantity]) => ({
        productId,
        quantity
      }));

      const response = await apiRequest("POST", "/api/rentals", {
        ...data,
        startDate: new Date(rentalDates.startDate).toISOString(),
        endDate: new Date(rentalDates.endDate).toISOString(),
        items: formattedItems
      });

      const rentalDetails = await response.json();

      // Store the rental details for the confirmation page
      sessionStorage.setItem('rentalConfirmation', JSON.stringify({
        ...data,
        id: rentalDetails.id,
        items: cartItems,
        pickupDate: rentalDates.startDate,
        returnDate: rentalDates.endDate,
        totalAmount
      }));

      // Clear the rental dates and cart
      sessionStorage.removeItem('rentalDates');
      sessionStorage.removeItem('cart');

      navigate("/thank-you");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" onClick={() => navigate('/catalog')}>
              ← Back to Catalog
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Rental Period</h3>
                  <p className="text-sm text-gray-600">
                    From: {format(new Date(rentalDates.startDate), 'PPP')}
                  </p>
                  <p className="text-sm text-gray-600">
                    To: {format(new Date(rentalDates.endDate), 'PPP')}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Items ({cartTotal})</h3>
                  <div className="space-y-2">
                    {cartItems.map(([productId, quantity]) => {
                      const product = getProductDetails(productId);
                      if (!product) return null;
                      return (
                        <div key={productId} className="flex justify-between text-sm">
                          <span>{product.name} (x{quantity})</span>
                        </div>
                      );
                    })}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Complete Reservation
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}