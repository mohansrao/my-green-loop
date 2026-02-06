import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Link as LinkIcon, Loader2, Globe, Clock, FileText } from 'lucide-react';

export default function AdminAddContent() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [url, setUrl] = useState('');
    const [metadata, setMetadata] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isFeatured, setIsFeatured] = useState<boolean>(false);

    // Fetch categories for the dropdown
    const { data: categories } = useQuery({
        queryKey: ['/api/categories'],
    });

    // Mutation to fetch metadata from URL
    const fetchMetadataMutation = useMutation({
        mutationFn: async (targetUrl: string) => {
            const response = await fetch('/api/admin/content/fetch-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch metadata');
            }

            return response.json();
        },
        onSuccess: (data) => {
            setMetadata(data);
            toast({
                title: "Details Fetched",
                description: "Metadata auto-populated from URL.",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    });

    // Mutation to save the content hub item
    const createContentMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create content');
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Resource published successfully!",
            });
            setLocation('/resources'); // Redirect or stay? Plan says redirect/success.
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    });

    const handleFetchDetails = () => {
        if (!url) return;
        fetchMetadataMutation.mutate(url);
    };

    const handlePublish = () => {
        if (!metadata || !selectedCategory) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select a category before publishing.",
            });
            return;
        }

        createContentMutation.mutate({
            ...metadata,
            contentType: metadata.type || 'article',
            categoryId: selectedCategory,
            isFeatured,
        });
    };

    const handleBack = () => {
        setLocation('/'); // Or wherever the list is
    };

    return (
        <div className="container max-w-3xl mx-auto py-10 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Resource</h1>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Paste URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Paste article or video URL here..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button
                                onClick={handleFetchDetails}
                                disabled={!url || fetchMetadataMutation.isPending}
                            >
                                {fetchMetadataMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Fetch Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Primary Category</label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="featured"
                                checked={isFeatured}
                                onCheckedChange={(checked) => setIsFeatured(!!checked)}
                            />
                            <label
                                htmlFor="featured"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Feature on homepage
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {metadata && (
                    <Card className="border-green-100 bg-green-50/10">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                Preview & Edit Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {metadata.image && (
                                <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
                                    <img src={metadata.image} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={metadata.description}
                                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                    <span>{metadata.source}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{metadata.type === 'video' ? 'Video' : 'Article'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-4 items-center justify-end">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={!metadata || !selectedCategory || createContentMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {createContentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Publish Resource
                    </Button>
                </div>
            </div>
        </div>
    );
}
