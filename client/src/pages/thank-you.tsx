
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { RentalFormData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@db/schema";

interface RentalConfirmation extends RentalFormData {
  id: number;
  items: [number, number][];
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
}

export default function ThankYou() {
  const [rentalDetails, setRentalDetails] = useState<RentalConfirmation>();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const details = sessionStorage.getItem('rentalConfirmation');
    if (details) {
      setRentalDetails(JSON.parse(details));
      sessionStorage.removeItem('rentalConfirmation');
    }
  }, []);

  const getProductName = (productId: number) => {
    return products?.find(p => p.id === productId)?.name || 'Product';
  };

  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Thank You!</h1>
              <p className="text-gray-600 text-center mb-6">
                Your rental request has been successfully submitted.
              </p>

              {rentalDetails && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <h2 className="font-semibold mb-2">Order Details:</h2>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Order ID:</span> #{rentalDetails.id}</p>
                    <p><span className="font-medium">Name:</span> {rentalDetails.customerName}</p>
                    <p><span className="font-medium">Email:</span> {rentalDetails.customerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {rentalDetails.phoneNumber}</p>

                    <div className="pt-2">
                      <p className="font-medium mb-1">Items:</p>
                      {rentalDetails.items.map(([productId, quantity]) => {
                        const product = products?.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <div key={productId} className="pl-2 flex justify-between">
                            <span>{getProductName(productId)} x{quantity}</span>
                          </div>
                        );
                      })}
                      <div className="mt-4 pt-2 border-t border-gray-200">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>${rentalDetails.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <p><span className="font-medium">Pickup Date:</span> {format(new Date(rentalDetails.pickupDate), 'PPP')}</p>
                    <p><span className="font-medium">Return Date:</span> {format(new Date(rentalDetails.returnDate), 'PPP')}</p>
                  </div>
                </div>
              )}

              <Link href="/">
                <Button className="w-full bg-green-700 hover:bg-green-800">
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
