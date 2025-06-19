import { useState, useMemo } from "react";
import type { Product } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Package, AlertTriangle, TrendingUp, Search, Download } from "lucide-react";
import AdminNav from "@/components/admin/admin-nav";

export default function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    if (!products) return { 
      totalProducts: 0, 
      lowStockItems: 0, 
      outOfStockItems: 0, 
      categoryCounts: {},
      averageStock: 0
    };
    
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
      <div>
        <AdminNav />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        {/* Enhanced Inventory Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Search and Filter Controls */}
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
              <div className="text-sm text-gray-500">
                Showing {searchTerm || categoryFilter !== "all" || stockFilter !== "all" ? "filtered" : "all"} products
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!filteredProducts || filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchTerm || categoryFilter !== "all" || stockFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "No products have been added yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Stock Level</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-gray-600 truncate">
                            {product.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-lg font-semibold">
                            {product.totalStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              product.totalStock === 0 ? 'bg-red-50 text-red-700 border-red-200' :
                              product.totalStock <= 5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }
                          >
                            {product.totalStock === 0 ? 'Out of Stock' :
                             product.totalStock <= 5 ? 'Low Stock' :
                             'Available'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}