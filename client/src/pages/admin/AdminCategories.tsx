
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCategories() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
        color: "#16a34a",
        icon: "leaf"
    });

    const { data: categories, isLoading } = useQuery<any[]>({
        queryKey: ["/api/admin/categories"],
    });

    const createCategoryMutation = useMutation({
        mutationFn: async (data: typeof newCategory) => {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create category");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
            setIsAddOpen(false);
            setNewCategory({ name: "", description: "", color: "#16a34a", icon: "leaf" });
            toast({ title: "Category created successfully" });
        },
        onError: () => {
            toast({ title: "Failed to create category", variant: "destructive" });
        },
    });

    const toggleVisibilityMutation = useMutation({
        mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVisible }),
            });
            if (!res.ok) throw new Error("Failed to update visibility");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
            toast({ title: "Visibility updated" });
        },
        onError: () => {
            toast({ title: "Failed to update visibility", variant: "destructive" });
        },
    });

    const handleCreate = () => {
        if (!newCategory.name) return;
        createCategoryMutation.mutate(newCategory);
    };

    if (isLoading) return <div className="p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <AdminNav />
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                        <p className="text-gray-500 mt-2">Manage content categories and their visibility.</p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-green-700 hover:bg-green-800">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Icon/Color</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Visible</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories?.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.description || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: category.color || '#16a34a' }}
                                                />
                                                <span className="text-xs text-gray-500">{category.icon}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500">{category.slug}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={category.isVisible !== false} // Default to true if null/undefined
                                                onCheckedChange={(checked) =>
                                                    toggleVisibilityMutation.mutate({ id: category.id, isVisible: checked })
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No categories found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                                Create a new category for content organization.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g., Guides"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="desc" className="text-right">Description</Label>
                                <Input
                                    id="desc"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="icon" className="text-right">Icon Key</Label>
                                <Input
                                    id="icon"
                                    value={newCategory.icon}
                                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g., leaf, zap, shirt"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="color" className="text-right">Color</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                        className="w-12 h-10 p-1"
                                    />
                                    <span className="text-sm text-gray-500">{newCategory.color}</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createCategoryMutation.isPending}>
                                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
