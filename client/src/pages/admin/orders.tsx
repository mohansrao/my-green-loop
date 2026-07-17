import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, DollarSign, Clock, Search, Download, TrendingUp, Calendar, Eye } from "lucide-react";
import AdminNav from "@/components/admin/admin-nav";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

async function patchOrderStatus(id: number, status: string): Promise<Response> {
  const adminKey = localStorage.getItem("adminKey") ?? "";
  const res = await fetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  deliveryOption: string;
  deliveryAddress: string | null;
  deliveryDate: string;
  pickupDate: string;
}

interface OrderItem {
  id: number;
  rentalId: number;
  productId: number;
  quantity: number;
  productName: string;
  productCategory: string;
}

interface OrderDetail extends Order {
  items: OrderItem[];
}

function exportOrdersCSV(orders: Order[]) {
  const headers = ["Order ID", "Customer Name", "Email", "Status", "Total ($)", "Start Date", "End Date", "Order Date"];
  const rows = orders.map(o => [
    o.id,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.customerEmail.replace(/"/g, '""')}"`,
    o.status,
    parseFloat(o.totalAmount).toFixed(2),
    new Date(o.startDate).toLocaleDateString(),
    new Date(o.endDate).toLocaleDateString(),
    new Date(o.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function statusBadgeClass(status: string) {
  if (status === "completed") return "bg-green-50 text-green-700 border-green-200";
  if (status === "confirmed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "pending") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-red-50 text-red-700 border-red-200";
}

const STATUS_TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [
    { label: "Confirm", next: "confirmed", color: "bg-blue-600 hover:bg-blue-700 text-white" },
    { label: "Cancel", next: "cancelled", color: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  confirmed: [
    { label: "Complete", next: "completed", color: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "Cancel", next: "cancelled", color: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  completed: [],
  cancelled: [
    { label: "Restore to Pending", next: "pending", color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" },
  ],
};

function OrderDetailModal({ orderId, onClose }: { orderId: number | null; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: orderId !== null,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => patchOrderStatus(orderId!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/recent"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      toast({ title: "Status updated", description: "Order status has been changed." });
    },
    onError: () => {
      toast({ title: "Update failed", description: "Could not update order status.", variant: "destructive" });
    },
  });

  const transitions = order ? (STATUS_TRANSITIONS[order.status] ?? []) : [];

  return (
    <Dialog open={orderId !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Order #{orderId?.toString().padStart(4, "0")} Details
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer Name</p>
                <p className="font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <p className="font-medium text-gray-900 break-all">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <Badge
                  variant="outline"
                  className={statusBadgeClass(order.status)}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                <p className="font-semibold text-green-600 text-lg">${parseFloat(order.totalAmount).toFixed(2)}</p>
              </div>
            </div>

            {transitions.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Change Status</p>
                <div className="flex gap-2 flex-wrap">
                  {transitions.map(t => (
                    <Button
                      key={t.next}
                      size="sm"
                      className={t.color}
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate(t.next)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Rental Period</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
                  <p className="font-medium">{new Date(order.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">End Date</p>
                  <p className="font-medium">{new Date(order.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Delivery</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Option</p>
                  <p className="font-medium capitalize">{order.deliveryOption}</p>
                </div>
                {order.deliveryAddress && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Address</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Delivery Date</p>
                  <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Pickup Date</p>
                  <p className="font-medium">{new Date(order.pickupDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Order Items ({order.items.length})
              </p>
              {order.items.length === 0 ? (
                <p className="text-sm text-gray-500">No items found.</p>
              ) : (
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.productCategory}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-700">× {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-3 text-xs text-gray-400">
              Order placed on {new Date(order.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/recent"],
    refetchInterval: 30000,
  });

  const quickStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      patchOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/recent"] });
      toast({ title: "Status updated", description: "Order status has been changed." });
    },
    onError: () => {
      toast({ title: "Update failed", description: "Could not update order status.", variant: "destructive" });
    },
  });

  const stats = useMemo(() => {
    if (!orders) return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, todayOrders: 0, weekRevenue: 0, monthRevenue: 0, averageOrderValue: 0 };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const weekOrders = orders.filter(order => new Date(order.createdAt) >= weekAgo);
    const monthOrders = orders.filter(order => new Date(order.createdAt) >= monthAgo);
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: orders.filter(order => order.status === "pending").length,
      todayOrders: todayOrders.length,
      weekRevenue: weekOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      monthRevenue: monthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter(order => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      const orderDate = new Date(order.createdAt);
      const now = new Date();
      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= monthAgo;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  if (isLoading) {
    return (
      <div>
        <AdminNav />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Order Management</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportOrdersCSV(filteredOrders)}
              disabled={filteredOrders.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Orders</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalOrders}</div>
              <p className="text-xs text-blue-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-green-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending Orders</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</div>
              <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Today's Orders</CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.todayOrders}</div>
              <p className="text-xs text-purple-600 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Week Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">${stats.weekRevenue.toFixed(2)}</div>
              <p className="text-xs text-orange-600 mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800">Avg Order Value</CardTitle>
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">${stats.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-indigo-600 mt-1">Per order</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Search Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, email, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Orders ({filteredOrders.length} of {orders?.length || 0})
              </CardTitle>
              <div className="text-sm text-gray-500">
                Showing {searchTerm || statusFilter !== "all" || dateFilter !== "all" ? "filtered" : "all"} orders
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No orders have been placed yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Rental Period</TableHead>
                      <TableHead className="font-semibold">Order Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono font-medium text-blue-600">
                          #{order.id.toString().padStart(4, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">{order.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600">${parseFloat(order.totalAmount).toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          <select
                            value={order.status}
                            disabled={quickStatusMutation.isPending}
                            onChange={(e) => quickStatusMutation.mutate({ id: order.id, status: e.target.value })}
                            className={`text-xs font-medium px-2 py-1 rounded border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                              order.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                              order.status === "confirmed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              order.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(order.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              {" → "}
                              {new Date(order.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
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

      <OrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
