import { useState, useMemo } from "react";
import type { Product } from "@db/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Added useMutation, useQueryClient
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"; // Added Label
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Added Dialog components
import { Package, AlertTriangle, TrendingUp, Search, Download, Edit2, Save } from "lucide-react"; // Added Edit2, Save
import AdminNav from "@/components/admin/admin-nav";
import { useToast } from "@/hooks/use-toast"; // Added toast

export default function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // State for editing
  const [editForm, setEditForm] = useState({ co2Saved: "", waterSaved: "", totalStock: "" });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await fetch(`/api/products/${editingProduct?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      co2Saved: String(product.co2Saved || 0.05),
      waterSaved: String(product.waterSaved || 0.5),
      totalStock: String(product.totalStock)
    });
  };

  const handleSave = () => {
    updateProductMutation.mutate({
      co2Saved: parseFloat(editForm.co2Saved),
      waterSaved: parseFloat(editForm.waterSaved),
      totalStock: parseInt(editForm.totalStock)
    });
  };

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    if (!products) return {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      categoryCounts: {},
      averageStock: 0
    };

    // ... existing stats logic ...
    const lowStockThreshold = 5;
    const lowStockItems = products.filter(p => p.totalStock <= lowStockThreshold && p.totalStock > 0).length;
    const outOfStockItems = products.filter(p => p.totalStock === 0).length;
    const averageStock = products.length > 0 ? products.reduce((sum, p) => sum + p.totalStock, 0) / products.length : 0;

    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts: products.length,
      lowStockItems,
      outOfStockItems,
      categoryCounts,
      averageStock
    };
  }, [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = product.totalStock <= 5 && product.totalStock > 0;
      } else if (stockFilter === "out") {
        matchesStock = product.totalStock === 0;
      } else if (stockFilter === "available") {
        matchesStock = product.totalStock > 5;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  if (productsLoading) {
    return (
      // ... existing loading state ...
      <div>
        <AdminNav />
        <div className="container mx-auto p-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Inventory
            </Button>
          </div>
        </div>

        {/* Existing Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ... stats cards ... */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Products</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{inventoryStats.totalProducts}</div>
              <p className="text-xs text-blue-600 mt-1">
                {Object.keys(inventoryStats.categoryCounts).length} categories
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{inventoryStats.lowStockItems}</div>
              <p className="text-xs text-yellow-600 mt-1">Items with ≤5 stock</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Out of Stock</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{inventoryStats.outOfStockItems}</div>
              <p className="text-xs text-red-600 mt-1">Unavailable items</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="plates">Plates</option>
                  <option value="glasses">Glasses</option>
                  <option value="cutlery">Cutlery</option>
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="available">Available (&gt;5)</option>
                  <option value="low">Low Stock (≤5)</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Products ({filteredProducts.length} of {products?.length || 0})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {!filteredProducts || filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Stock</TableHead>
                      <TableHead className="font-semibold">Impact (CO₂ / Water)</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 text-xs text-gray-400">ID: {product.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{product.totalStock}</span>
                            <Badge
                              variant="outline"
                              className={product.totalStock === 0 ? 'bg-red-50 text-red-700' : product.totalStock <= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}
                            >
                              {product.totalStock === 0 ? 'Out' : product.totalStock <= 5 ? 'Low' : 'OK'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1"><span className="text-gray-500">CO₂:</span> {product.co2Saved || "0.05"} kg</div>
                            <div className="flex items-center gap-1"><span className="text-gray-500">Water:</span> {product.waterSaved || "0.5"} L</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product: {editingProduct?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Total Stock
                </Label>
                <Input
                  id="stock"
                  value={editForm.totalStock}
                  onChange={(e) => setEditForm({ ...editForm, totalStock: e.target.value })}
                  className="col-span-3"
                  type="number"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="co2" className="text-right">
                  CO₂ Saved (kg)
                </Label>
                <Input
                  id="co2"
                  value={editForm.co2Saved}
                  onChange={(e) => setEditForm({ ...editForm, co2Saved: e.target.value })}
                  className="col-span-3"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="water" className="text-right">
                  Water Saved (L)
                </Label>
                <Input
                  id="water"
                  value={editForm.waterSaved}
                  onChange={(e) => setEditForm({ ...editForm, waterSaved: e.target.value })}
                  className="col-span-3"
                  type="number"
                  step="0.1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}