
import { useState } from "react";
import type { Rental } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface InventoryData {
  stockByProduct: Record<string, number>;
}

export default function AdminDashboard() {
  const [sortField, setSortField] = useState<'date' | 'name'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Record<string, Record<number, number>>>({
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

  const getDayInventory = (date: Date) => {
    if (!inventory) return {};
    const dateKey = format(date, 'yyyy-MM-dd');
    return inventory[dateKey] || {};
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="rentals">
        <TabsList className="mb-4">
          <TabsTrigger value="rentals">Customer Rentals</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rentals">
          <Card>
            <CardHeader>
              <CardTitle>Customer Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading bookings...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortDirection(sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc');
                          setSortField('name');
                        }}
                      >
                        Customer {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSortDirection(sortField === 'date' && sortDirection === 'asc' ? 'desc' : 'asc');
                          setSortField('date');
                        }}
                      >
                        Dates {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentals
                      ?.sort((a, b) => {
                        if (sortField === 'date') {
                          return sortDirection === 'asc' 
                            ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                            : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                        } else {
                          return sortDirection === 'asc'
                            ? a.customerName.localeCompare(b.customerName)
                            : b.customerName.localeCompare(a.customerName);
                        }
                      })
                      .map((rental) => (
                      <TableRow key={rental.id}>
                        <TableCell>
                          <div>{rental.customerName}</div>
                          <div className="text-sm text-gray-500">{rental.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(rental.startDate), 'MMM d, yyyy')} -
                            {format(new Date(rental.endDate), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`
                            inline-block px-2 py-1 rounded-full text-xs
                            ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              rental.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'}
                          `}>
                            {rental.status}
                          </div>
                        </TableCell>
                        <TableCell>${rental.totalAmount}</TableCell>
                        <TableCell>
                          {getRentalItems(rental.id).map(({product, quantity}) => (
                            product && (
                              <div key={product.id} className="text-sm">
                                {product.name} × {quantity}
                              </div>
                            )
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Inventory Calendar</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>&lt; Previous</Button>
                  <span className="font-normal">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={nextMonth}>Next &gt;</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      {generateCalendarDays().map((date) => (
                        <TableHead key={date.toISOString()} className="text-center min-w-[100px]">
                          {format(date, 'MMM d')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        {generateCalendarDays().map((date) => {
                          const stock = getDayInventory(date)[product.id] || 0;
                          return (
                            <TableCell 
                              key={date.toISOString()} 
                              className={`text-center ${
                                stock === 0 ? 'bg-red-50 text-red-800' :
                                stock < 3 ? 'bg-yellow-50 text-yellow-800' :
                                'bg-green-50 text-green-800'
                              }`}
                            >
                              {stock}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
