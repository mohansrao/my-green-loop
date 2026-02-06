import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Globe, Share2, Bookmark, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface ContentCardProps {
    item: {
        id: number;
        title: string;
        description: string;
        url: string;
        thumbnailUrl: string;
        contentType: string;
        source: string;
        readingTime: number;
        categoryMappings: any[];
    }
}

export default function ContentCard({ item }: ContentCardProps) {
    const { toast } = useToast();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const category = item.categoryMappings?.[0]?.category;

    // Check if item is already bookmarked on mount
    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('green_loop_bookmarks') || '[]');
        setIsBookmarked(bookmarks.some((b: any) => b.id === item.id));
    }, [item.id]);

    const toggleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        const bookmarks = JSON.parse(localStorage.getItem('green_loop_bookmarks') || '[]');
        let newBookmarks;

        if (isBookmarked) {
            newBookmarks = bookmarks.filter((b: any) => b.id !== item.id);
            toast({
                title: "Bookmark Removed",
                description: "Resource removed from your saved list.",
            });
        } else {
            newBookmarks = [...bookmarks, item];
            toast({
                title: "Bookmarked!",
                description: "Resource saved to your bookmarks.",
            });
        }

        localStorage.setItem('green_loop_bookmarks', JSON.stringify(newBookmarks));
        setIsBookmarked(!isBookmarked);

        // Trigger storage event for other components to update
        window.dispatchEvent(new Event('storage'));
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const shareData = {
            title: item.title,
            text: item.description,
            url: item.url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(item.url);
                toast({
                    title: "Link Copied!",
                    description: "Resource link copied to your clipboard.",
                });
            } catch (err) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not copy link to clipboard.",
                });
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5 }}
        >
            <Card className="group flex flex-col h-full overflow-hidden border-none shadow-none bg-transparent hover:bg-white/50 transition-all duration-300">
                {/* Thumbnail */}
                <div
                    className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted cursor-pointer"
                    onClick={() => window.open(item.url, '_blank')}
                >
                    <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e: any) => e.target.src = 'https://placehold.co/400x225?text=Sustainable+Living'}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-black/80 text-white backdrop-blur-md border-none capitalize">
                            {item.contentType}
                        </Badge>
                        {category && (
                            <Badge
                                className="border-none text-white shadow-sm font-medium"
                                style={{ backgroundColor: category.color || '#2d5016' }}
                            >
                                {category.name}
                            </Badge>
                        )}
                    </div>
                </div>

                <CardContent
                    className="flex-1 p-4 pb-2 cursor-pointer"
                    onClick={() => window.open(item.url, '_blank')}
                >
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{item.source}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.readingTime} min</span>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-green-800 transition-colors">
                        {item.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {item.description}
                    </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-green-100 text-green-700 hover:bg-green-50 hover:text-green-800"
                        onClick={() => window.open(item.url, '_blank')}
                    >
                        View Resource
                        <ExternalLink className="ml-2 h-3.3 w-3.5" />
                    </Button>

                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full transition-colors",
                                isBookmarked ? "text-green-600 bg-green-50" : "text-muted-foreground hover:text-green-600"
                            )}
                            onClick={toggleBookmark}
                        >
                            {isBookmarked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-green-600"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
