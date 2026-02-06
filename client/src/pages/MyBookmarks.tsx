import { useState, useEffect } from 'react';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Bookmark, Sparkles, FilterX } from 'lucide-react';
import { useLocation } from 'wouter';

export default function MyBookmarks() {
    const [, setLocation] = useLocation();
    const [bookmarks, setBookmarks] = useState<any[]>([]);

    useEffect(() => {
        const loadBookmarks = () => {
            const saved = JSON.parse(localStorage.getItem('green_loop_bookmarks') || '[]');
            setBookmarks(saved);
        };

        loadBookmarks();

        // Listen for storage changes
        window.addEventListener('storage', loadBookmarks);
        return () => window.removeEventListener('storage', loadBookmarks);
    }, []);

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            {/* Header */}
            <section className="bg-green-50 border-b py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                                <Bookmark className="h-5 w-5" />
                                <span>Personal Library</span>
                            </div>
                            <h1 className="text-4xl font-bold text-green-950">My Saved Resources</h1>
                            <p className="text-muted-foreground mt-2 max-w-xl">
                                Your curated collection of articles, videos, and guides for living sustainably.
                            </p>
                        </div>
                        <Button
                            onClick={() => setLocation('/resources')}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                        >
                            Explore More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Grid */}
            <div className="container mx-auto px-4 py-12">
                {bookmarks.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-green-100">
                        <Sparkles className="h-12 w-12 text-green-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-green-900">No bookmarks yet</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                            Start exploring our curated library and bookmark resources you want to save for later.
                        </p>
                        <Button
                            className="mt-6 bg-green-600 text-white rounded-full px-8"
                            onClick={() => setLocation('/resources')}
                        >
                            Explore Resources
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-green-50">
                            <h2 className="text-lg font-bold text-green-900">{bookmarks.length} Resources Saved</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {bookmarks.map((item) => (
                                <ContentCard key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
