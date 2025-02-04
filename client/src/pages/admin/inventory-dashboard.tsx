import { useState } from "react";
import type { Rental } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";


interface InventoryData {
  stockByProduct: Record<string, number>;
}

export default function AdminDashboard() {
  // ... other existing code ...

  // Fetch rentals
  const { data: rentals, isLoading: rentalsLoading } = useQuery<Rental[]>({
    queryKey: ["/api/rentals"],
  });

  const isLoading = productsLoading || inventoryLoading || rentalsLoading;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Customer Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading bookings...</div>
            ) : (
              <div className="space-y-4">
                {rentals?.map((rental) => (
                  <Card key={rental.id} className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold">Customer</div>
                        <div>{rental.customerName}</div>
                        <div className="text-sm text-gray-500">{rental.customerEmail}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Dates</div>
                        <div className="text-sm">
                          {format(new Date(rental.startDate), 'MMM d, yyyy')} -
                          <br />
                          {format(new Date(rental.endDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Status</div>
                        <div className={`
                          inline-block px-2 py-1 rounded-full text-xs
                          ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            rental.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            'bg-blue-100 text-blue-800'}
                        `}>
                          {rental.status}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Amount</div>
                        <div>${rental.totalAmount}</div>
                      </div>
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