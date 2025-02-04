import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@db/schema";
import { startOfDay, endOfDay } from "date-fns";

interface InventoryData {
  stockByProduct: Record<string, number>;
}

export default function InventoryDashboard() {
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch current inventory levels
  const today = new Date();
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery<InventoryData>({
    queryKey: ["/api/inventory/available", {
      startDate: startOfDay(today).toISOString(),
      endDate: endOfDay(today).toISOString(),
    }],
  });

  const isLoading = productsLoading || inventoryLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Dashboard</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading inventory data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => {
                    const availableStock = inventoryData?.stockByProduct[product.id];
                    const stockStatus = 
                      !availableStock ? "No Records" :
                      availableStock === 0 ? "Out of Stock" :
                      availableStock < 20 ? "Low Stock" :
                      "In Stock";

                    return (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.totalStock}</TableCell>
                        <TableCell>{availableStock}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded text-sm ${
                              stockStatus === "Out of Stock" ? "bg-red-100 text-red-800" :
                              stockStatus === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}
                          >
                            {stockStatus}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}