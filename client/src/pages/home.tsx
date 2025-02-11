import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Recycle, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Eco-Friendly Dining Rentals
          </h1>
          <p className="text-lg text-green-700 max-w-2xl mx-auto">
            Rent sustainable tableware for your events. Make a difference while creating memorable experiences.
          </p>
          <Link href="/catalog">
            <Button className="mt-8 bg-green-700 hover:bg-green-800">
              Rent Now
            </Button>
          </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <Leaf className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Eco-Friendly</h2>
              <p className="text-gray-600">
                We offer reusable plates, glasses and cutlery that help reduce single-use waste
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <Calendar className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Flexible Rentals</h2>
              <p className="text-gray-600">
                Choose your dates and duration with our easy booking system
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <Recycle className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Zero Waste</h2>
              <p className="text-gray-600">
                Reuse tableware and enjoy your party guilt-free by generating zero waste
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto">
          <img
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6"
            alt="Eco-friendly outdoor dining event with sustainable tableware"
            className="rounded-lg mx-auto mb-16 w-full object-cover h-[500px]"
          />
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                <h3 className="text-lg font-semibold mb-2">Check Inventory</h3>
                <p className="text-gray-600">Browse available items for your selected dates</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-green-800">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Make the Booking</h3>
                <p className="text-gray-600">Complete your reservation with delivery details</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-green-800">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Pick Up Items</h3>
                <p className="text-gray-600">Collect your items on the Pick Up date</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-green-800">5</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Return Items</h3>
                <p className="text-gray-600">Return clean items by the Return date</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}