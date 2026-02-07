import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import ImpactCounter from "@/components/ImpactCounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    TreePine,
    Car,
    Droplets,
    Trophy,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ImpactStats {
    wasteDiverted: number;
    co2Saved: number;
    waterSaved: number;
    potentialImpact: number;
    totalRentals: number;
}

export default function Impact() {
    const { data: stats, isLoading } = useQuery<ImpactStats>({
        queryKey: ["/api/analytics/impact"],
    });

    const wasteDiverted = stats?.wasteDiverted || 0;
    const potentialImpact = stats?.potentialImpact || 0;

    // Calculate Equivalence Metaphors
    // Height of a stacked plate ~1.5cm = 0.015m
    // Eiffel tower = 330m
    // Empire State = 380m
    // Burj Khalifa = 828m
    const plateHeightMeters = 0.015;
    const stackHeight = wasteDiverted * plateHeightMeters;

    // Choose a landmark based on height
    let landmark = "a Giraffe (5m)";
    let comparison = "Taller than";

    if (stackHeight > 300) {
        landmark = "the Eiffel Tower (330m)";
    } else if (stackHeight > 93) {
        landmark = "the Statue of Liberty (93m)";
    } else if (stackHeight > 5) {
        landmark = "a 2-Story House";
    }

    // Community Goal Logic
    // Check next power of 10 milestone
    const nextMilestone = Math.pow(10, Math.ceil(Math.log10(wasteDiverted + 1)));
    // If we are exactly at a power of 10 (e.g. 100), aim for 1000
    const goal = nextMilestone === wasteDiverted ? nextMilestone * 10 : nextMilestone;
    const progressPercent = Math.min(100, (wasteDiverted / goal) * 100);

    // Mock data for the chart (for now, until we have daily history)
    // In a real app, we would fetch daily history from backend
    const chartData = [
        { name: "Mon", value: 120 },
        { name: "Tue", value: 200 },
        { name: "Wed", value: 150 },
        { name: "Thu", value: 300 },
        { name: "Fri", value: 250 },
        { name: "Sat", value: 400 },
        { name: "Sun", value: 380 },
    ];

    if (isLoading) {
        return <div className="min-h-screen pt-20 flex items-center justify-center text-green-700">Loading impact data...</div>;
    }

    return (
        <div className="min-h-screen bg-[#fcfdfa]">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-green-950 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20" />
                <div className="container relative mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                            Our Collective <span className="text-green-400">Impact</span>
                        </h1>
                        <p className="text-xl text-green-100/90 max-w-2xl mx-auto mb-12">
                            See how the My Green Loop community is reducing waste, one event at a time.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <ImpactCounter
                            value={wasteDiverted}
                            label="Waste Diverted"
                            subtext="Single-use items avoided"
                        />
                        <ImpactCounter
                            value={stats?.co2Saved || 0}
                            label="CO₂ Prevented"
                            unit="kg"
                            decimals={1}
                            subtext="Carbon emissions saved"
                        />
                        <ImpactCounter
                            value={stats?.waterSaved || 0}
                            label="Water Saved"
                            unit="L"
                            decimals={1}
                            subtext="Manufacturing water saved"
                        />
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 max-w-6xl">

                {/* Community Goal */}
                <div className="mb-20">
                    <Card className="border-none shadow-xl bg-gradient-to-r from-green-50 to-white overflow-hidden">
                        <CardContent className="p-8 md:p-12 relative">
                            <Trophy className="absolute top-4 right-4 h-24 w-24 text-yellow-500/10 rotate-12" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-green-900 mb-1">Community Goal</h2>
                                        <p className="text-green-700">Help us reach <span className="font-bold">{goal.toLocaleString()}</span> items diverted!</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-bold text-green-600">{Math.round(progressPercent)}%</span>
                                    </div>
                                </div>
                                <Progress value={progressPercent} className="h-4 bg-green-200" />
                                <div className="mt-8 flex gap-4">
                                    <Link href="/catalog">
                                        <Button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-8">
                                            Rent Now to Contribute
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Equivalency Block */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-green-900">What does this look like?</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="bg-blue-50/50 border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-6 p-6">
                                    <div className="bg-blue-100 p-4 rounded-full">
                                        <Building2 className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-lg">Height Check</h3>
                                        <p className="text-blue-800/80">
                                            If we stacked all the plates we've rented, it would be <br />
                                            <strong className="text-blue-700 block mt-1 text-xl">{comparison} {landmark}</strong>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-orange-50/50 border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-6 p-6">
                                    <div className="bg-orange-100 p-4 rounded-full">
                                        <Car className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-orange-900 text-lg">Emissions</h3>
                                        <p className="text-orange-800/80">
                                            That's equivalent to keeping a car off the road for <br />
                                            <strong className="text-orange-700 block mt-1 text-xl">{(stats?.co2Saved || 0) * 2} days</strong>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Catalog Capacity Highlight */}
                        <div className="mt-8 p-6 bg-green-900 rounded-3xl text-white">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <TreePine className="h-5 w-5 text-green-300" />
                                Our Potential
                            </h3>
                            <p className="text-green-100/80 mb-6">
                                With our current inventory, we have the capacity to divert <strong className="text-white">{potentialImpact.toLocaleString()}</strong> items from landfills every year.
                            </p>
                            <div className="flex gap-2">
                                <div className="h-2 flex-1 bg-green-500/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400 w-[15%]" />
                                </div>
                            </div>
                            <p className="text-xs text-green-400 mt-2 text-right">Current Utilization</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div>
                        <h2 className="text-3xl font-bold text-green-900 mb-8">Impact Trends</h2>
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle>Weekly Waste Diversion</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="name" tick={{ fill: '#14532d' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#14532d' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f0fdf4' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill="#16a34a" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
