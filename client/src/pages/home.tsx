import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ContentCard from "@/components/ContentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface ImpactRental {
  id: number;
  displayName: string;
  startDate: string;
  endDate: string;
  totalQuantity: number;
}

export default function Home() {
  const { data: contentData } = useQuery<any>({
    queryKey: ['/api/content?limit=3'],
  });
  const latestResources = contentData?.items || [];

  const { data: impactRentals = [] } = useQuery<ImpactRental[]>({
    queryKey: ['/api/rentals/recent-impact'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-16">

        {/* Hero — unchanged */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Eco-Friendly Dining Rentals
          </h1>
          <p className="text-lg text-green-700 max-w-2xl mx-auto">
            Rent sustainable tableware for your events. Make a difference while creating memorable experiences.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/catalog">
              <Button className="mt-8 bg-green-700 hover:bg-green-800">
                Rent Now
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline" className="mt-8 text-green-700 border-green-700 hover:bg-green-50">
                View Catalog
              </Button>
            </Link>
          </div>
        </header>

        {/* Why It Matters */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-green-800 text-center mb-6">Why It Matters</h2>
          <p className="text-gray-700 text-center text-lg mb-10">
            Every event is a chance to do something good. Single-use plastics and disposable tableware create
            mountains of waste — most of it ending up in landfills within hours of use. My Green Loop exists to
            prove that beautiful, well-set tables don't have to cost the planet anything.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Less Waste</h3>
              <p className="text-gray-600">
                Each set you borrow is one fewer stack of disposable plates and cups heading to the trash after your event.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">A Shared Resource</h3>
              <p className="text-gray-600">
                Our tableware serves dozens of families each month. One shared set does the work of thousands of disposable ones.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">A Lifestyle Choice</h3>
              <p className="text-gray-600">
                Choosing reusable tableware is a small shift that signals a bigger commitment — to your community and to the earth.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-green-800 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-green-800">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Your Event Date</h3>
              <p className="text-gray-600">Select when you need the tableware for your event</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-green-800">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Select & Book Items</h3>
              <p className="text-gray-600">Browse available items and complete your reservation</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-green-800">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pick Up Items</h3>
              <p className="text-gray-600">Collect your items on the Pick Up date</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-green-800">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Return Items</h3>
              <p className="text-gray-600">Return clean items by the Return date</p>
            </div>
          </div>
        </div>

        {/* Stat Block — replaces occasions photo grid */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/80 backdrop-blur rounded-xl p-8 border border-green-100">
              <p className="text-4xl font-bold text-green-700 mb-2">10+</p>
              <p className="text-lg font-semibold text-green-800 mb-1">Types of Events Served</p>
              <p className="text-gray-600 text-sm">
                From birthday parties and quinceañeras to school graduations and family reunions
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-8 border border-green-100">
              <p className="text-4xl font-bold text-green-700 mb-2">100</p>
              <p className="text-lg font-semibold text-green-800 mb-1">Tableware Sets Available</p>
              <p className="text-gray-600 text-sm">
                Each set includes a plate, glass, spoon, and fork — enough for up to 100 guests
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-8 border border-green-100">
              <p className="text-4xl font-bold text-green-700 mb-2">Sunnyvale</p>
              <p className="text-lg font-semibold text-green-800 mb-1">Service Area</p>
              <p className="text-gray-600 text-sm">
                Pick up at Wolfe &amp; Homestead. Serving the entire South Bay — no delivery required
              </p>
            </div>
          </div>
        </div>

        {/* Community Impact */}
        {impactRentals.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-green-800 text-center mb-2">Community Impact</h2>
            <p className="text-center text-gray-600 mb-8">Real neighbors. Real events. Real difference.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {impactRentals.map((rental) => (
                <Card key={rental.id} className="bg-white/80 backdrop-blur border border-green-100">
                  <CardContent className="pt-6">
                    <p className="text-lg font-semibold text-green-800 mb-1">{rental.displayName}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      {format(new Date(rental.startDate), "MMM d")}
                      {" – "}
                      {format(new Date(rental.endDate), "MMM d, yyyy")}
                    </p>
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-medium">{rental.totalQuantity}</span> items rented
                    </p>
                    <p className="text-green-700 text-sm font-medium">
                      🌿 Kept {rental.totalQuantity} sets out of the landfill
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Latest Resources Section */}
        {latestResources.length > 0 && (
          <div className="max-w-6xl mx-auto mb-24">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">Latest Resources</h2>
                <p className="text-gray-600">Discover tips and guides for sustainable living</p>
              </div>
              <Link href="/resources">
                <Button variant="ghost" className="text-green-700 hover:bg-green-50 group">
                  View All Resources
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestResources.map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="text-center mb-12 mt-24">
          <h2 className="text-3xl font-bold text-green-800 mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-left max-w-5xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">Should I wash the tableware before use?</h3>
              <p className="text-gray-600">Not required but we recommend checking well before the event and ensure the tableware is clean.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Should I wash the tableware after use?</h3>
              <p className="text-gray-600">Yes. Please return all the items in clean condition.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Will you deliver?</h3>
              <p className="text-gray-600">No. We don't.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Where is the pick up location?</h3>
              <p className="text-gray-600">In Sunnyvale at the intersection of Wolfe and Homestead.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How do I make the payment?</h3>
              <p className="text-gray-600">You can make via PayPal, Venmo or cash when you pick up.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How many dinner plates and glasses can I rent?</h3>
              <p className="text-gray-600">Up to a max of 100 units.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Do you rent tables and chairs?</h3>
              <p className="text-gray-600">No, we don't.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How much does it cost?</h3>
              <p className="text-gray-600">50 sets or less is $15 and anything more than that upto 100 is $30. This is the total cost which includes pick up and drop off days. Each set has a plate, glass, spoon and fork.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
