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
  deliveryOption: z.enum(['delivery', 'pickup']),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.date(),
  pickupDate: z.date(),
});

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<RentalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      deliveryOption: "delivery",
    }
  });

  const onSubmit = async (data: RentalFormData) => {
    try {
      await apiRequest("POST", "/api/rentals", data);
      toast({
        title: "Success!",
        description: "Your rental has been confirmed.",
      });
      navigate("/");
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

                <DeliveryScheduler
                  onScheduleChange={(scheduleData) => {
                    form.setValue('deliveryOption', scheduleData.deliveryOption);
                    form.setValue('deliveryAddress', scheduleData.deliveryAddress);
                    form.setValue('deliveryDate', scheduleData.deliveryDate);
                    form.setValue('pickupDate', scheduleData.pickupDate);
                  }}
                  className="mt-6"
                />

                <Button type="submit" className="w-full">
                  Confirm Rental
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}