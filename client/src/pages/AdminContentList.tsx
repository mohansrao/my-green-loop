import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    ExternalLink,
    Edit,
    Trash2,
    Search,
    Filter,
    MoreVertical,
    Star,
    Eye,
    Bookmark
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminNav from "@/components/admin/admin-nav";

export default function AdminContentList() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    // Fetch all content items
    const { data, isLoading } = useQuery<any>({
        queryKey: ['/api/content', { search, limit: 100 }],
    });

    const contentItems = data?.items || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`/api/admin/content/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete content');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/content'] });
            toast({
                title: "Deleted",
                description: "Resource removed from library.",
            });
        },
    });

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div>
            <AdminNav />
            <div className="container mx-auto py-8 px-4 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resource Library</h1>
                        <p className="text-muted-foreground mt-1">Manage and curate sustainability content</p>
                    </div>
                    <Button
                        onClick={() => setLocation('/admin/resources/add')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Resource
                    </Button>
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search resources..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Filter className="h-4 w-4" />
                            <span>Showing {contentItems.length} resources</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[400px] font-semibold">Content</TableHead>
                                    <TableHead className="font-semibold">Category</TableHead>
                                    <TableHead className="font-semibold">Type</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Stats</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Loading resources...
                                        </TableCell>
                                    </TableRow>
                                ) : contentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No resources found. Click "Add New Resource" to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contentItems.map((item: any) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex gap-3">
                                                    <div className="h-12 w-20 flex-shrink-0 rounded bg-muted overflow-hidden border">
                                                        <img
                                                            src={item.thumbnailUrl}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                            onError={(e: any) => e.target.src = 'https://placehold.co/400x225?text=Eco'}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium line-clamp-1">{item.title}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            {item.source}
                                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.categoryMappings?.[0]?.category?.name || 'Uncategorized'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="capitalize">
                                                    {item.contentType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={item.isFeatured ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200" : "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100"}>
                                                        {item.status}
                                                    </Badge>
                                                    {item.isFeatured && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" /> {item.viewCount}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Bookmark className="h-3 w-3" /> {item.bookmarkCount}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setLocation(`/admin/resources/edit/${item.id}`)}>
                                                            <Edit className="h-4 w-4 mr-2" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                                                            <ExternalLink className="h-4 w-4 mr-2" /> View Original
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
