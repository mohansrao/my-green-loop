import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { RentalFormData } from "@/lib/types";

export default function ThankYou() {
  const [rentalDetails, setRentalDetails] = useState<RentalFormData & { id: number }>();

  useEffect(() => {
    const details = sessionStorage.getItem('rentalConfirmation');
    if (details) {
      setRentalDetails(JSON.parse(details));
      sessionStorage.removeItem('rentalConfirmation');
    }
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
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
                <p><span className="font-medium">Items:</span> {rentalDetails.quantity}</p>
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
  );
}