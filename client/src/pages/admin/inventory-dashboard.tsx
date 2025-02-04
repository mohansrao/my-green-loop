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
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: rentals, isLoading: rentalsLoading } = useQuery<Rental[]>({
    queryKey: ["/api/rentals"],
  });

  const { data: rentalItems } = useQuery({
    queryKey: ["/api/rental-items"],
  });

  const isLoading = productsLoading || inventoryLoading || rentalsLoading;
  
  const getRentalItems = (rentalId: number) => {
    if (!rentalItems || !products) return [];
    return rentalItems
      .filter((item: any) => item.rentalId === rentalId)
      .map((item: any) => ({
        product: products.find(p => p.id === item.productId),
        quantity: item.quantity
      }));
  };

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
                    <div className="mt-4 text-sm text-gray-600">
                      <div className="font-semibold mb-1">Rented Items:</div>
                      {getRentalItems(rental.id).map(({product, quantity}) => (
                        product && (
                          <div key={product.id} className="pl-2">
                            {product.name} × {quantity}
                          </div>
                        )
                      ))}
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