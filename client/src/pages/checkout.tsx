import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { RentalFormData } from "@/lib/types";
import DeliveryScheduler from "@/components/delivery-scheduler";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  deliveryOption: z.enum(['delivery', 'pickup']),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.date(),
  pickupDate: z.date(),
});

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Retrieve rental dates from sessionStorage
  const rentalDates = JSON.parse(sessionStorage.getItem('rentalDates') || '{}');

  const form = useForm<RentalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      phoneNumber: "",
      quantity: 1,
      deliveryOption: "delivery",
      startDate: rentalDates.startDate ? new Date(rentalDates.startDate) : undefined,
      endDate: rentalDates.endDate ? new Date(rentalDates.endDate) : undefined,
    }
  });

  const onSubmit = async (data: RentalFormData) => {
    try {
      await apiRequest("POST", "/api/rentals", data);
      // Clear the rental dates from sessionStorage
      sessionStorage.removeItem('rentalDates');
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
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Rental</CardTitle>
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

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Items</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DeliveryScheduler
                  onScheduleChange={(scheduleData) => {
                    form.setValue('deliveryOption', scheduleData.deliveryOption);
                    form.setValue('deliveryAddress', scheduleData.deliveryAddress);
                    form.setValue('deliveryDate', scheduleData.deliveryDate);
                    form.setValue('pickupDate', scheduleData.pickupDate);
                  }}
                />

                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}