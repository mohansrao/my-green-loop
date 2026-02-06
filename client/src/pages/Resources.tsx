import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import ContentCard from '@/components/ContentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    FilterX,
    Leaf,
    Recycle,
    Shirt,
    Zap,
    ShoppingBag,
    Lightbulb,
    Sparkles,
    ArrowRight,
    Globe,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, any> = {
    'leaf': Leaf,
    'recycle': Recycle,
    'shirt': Shirt,
    'zap': Zap,
    'shopping-bag': ShoppingBag,
    'lightbulb': Lightbulb
};

export default function Resources() {
    const [, setLocation] = useLocation();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    // Fetch categories
    const { data: categories } = useQuery<any[]>({
        queryKey: ['/api/categories'],
    });

    // Fetch content
    const { data: contentData, isLoading } = useQuery<any>({
        queryKey: ['/api/content', { category: selectedCategory, search }],
    });

    // Fetch featured content for the hero section
    const { data: featuredItems } = useQuery<any[]>({
        queryKey: ['/api/content/featured'],
    });

    const featured = featuredItems?.[0]; // Get the top featured item
    const items = contentData?.items || [];

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-green-950 text-white py-16 md:py-24">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20" />
                <div className="container relative mx-auto px-4 text-center">
                    <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Curated Sustainability Knowledge
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Sustainable Living <span className="text-green-400">Resource Library</span>
                    </h1>
                    <p className="text-lg md:text-xl text-green-100/80 max-w-2xl mx-auto mb-10">
                        Discover articles, videos, and guides to help you live a more eco-friendly life. Hand-picked resources for your green journey.
                    </p>

                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-900/40" />
                        <Input
                            placeholder="Search for topics, guides, or videos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 pl-12 pr-4 rounded-full bg-white text-green-950 border-none shadow-xl text-lg placeholder:text-green-900/30"
                        />
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-green-900 uppercase tracking-wider text-sm">Categories</h3>
                                {selectedCategory && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedCategory(null)}
                                        className="h-7 text-xs text-muted-foreground hover:text-green-700"
                                    >
                                        <FilterX className="h-3 w-3 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                {categories?.map((cat, idx) => {
                                    const Icon = CATEGORY_ICONS[cat.icon] || Leaf;
                                    const isActive = selectedCategory === cat.id;

                                    return (
                                        <motion.button
                                            key={cat.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.05 }}
                                            whileHover={{ x: 5 }}
                                            onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                                                isActive
                                                    ? "bg-green-100 text-green-900 shadow-inner"
                                                    : "hover:bg-white hover:shadow-sm text-green-800/70"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                isActive ? "bg-white text-green-700" : "bg-green-50 text-green-600"
                                            )}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-sm">{cat.name}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-6 text-white shadow-lg overflow-hidden relative"
                        >
                            <Sparkles className="absolute top-2 right-2 h-16 w-16 text-white/10" />
                            <h4 className="font-bold relative">Join the community</h4>
                            <p className="text-xs text-white/80 mt-2 relative">Get weekly updates on new green resources.</p>
                            <Button size="sm" className="mt-4 w-full bg-white text-green-700 hover:bg-green-50 border-none relative">
                                Subscribe
                            </Button>
                        </motion.div>
                    </aside>

                    {/* Content Grid */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            {/* Featured Hero Card (if no search/filter) */}
                            {!selectedCategory && !search && featured && (
                                <motion.div
                                    key="featured"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    className="group relative w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 cursor-pointer shadow-2xl"
                                    onClick={() => window.open(featured.url, '_blank')}
                                >
                                    <img
                                        src={featured.thumbnailUrl}
                                        alt={featured.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                                        <Badge className="mb-4 bg-green-500 text-white border-none uppercase tracking-widest text-[10px] font-bold">Featured Resource</Badge>
                                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 line-clamp-2 leading-tight">
                                            {featured.title}
                                        </h2>
                                        <div className="flex items-center gap-4 text-green-100/70 text-sm">
                                            <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {featured.source}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {featured.readingTime} min read</span>
                                        </div>
                                        <Button className="mt-6 bg-white text-green-950 hover:bg-green-50 rounded-full px-8 h-12 font-bold group/btn">
                                            Read Story
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            layout
                            className="flex items-center justify-between mb-8"
                        >
                            <h2 className="text-2xl font-bold text-green-900">
                                {selectedCategory ? categories?.find(c => c.id === selectedCategory)?.name : 'Latest Resources'}
                            </h2>
                            <div className="text-sm text-muted-foreground font-medium">
                                {items.length} items found
                            </div>
                        </motion.div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="animate-pulse space-y-4">
                                        <div className="aspect-video bg-green-100 rounded-2xl" />
                                        <div className="h-6 bg-green-100 rounded w-2/3" />
                                        <div className="h-4 bg-green-100 rounded w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-green-100"
                            >
                                <Search className="h-12 w-12 text-green-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-900">No resources found</h3>
                                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-6 border-green-200 text-green-700"
                                    onClick={() => { setSearch(''); setSelectedCategory(null); }}
                                >
                                    Clear All Filters
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
                            >
                                {items.map((item: any) => (
                                    <ContentCard key={item.id} item={item} />
                                ))}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

// Local Badge function removed as it is now imported from @/components/ui/badge
