import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Recycle, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
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
                All our items are sustainably sourced and help reduce single-use waste
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
                Professional cleaning and reuse cycle for all rental items
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <img
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6"
            alt="Eco-friendly outdoor dining event with sustainable tableware"
            className="rounded-lg mx-auto mb-8 max-w-4xl w-full object-cover h-[500px]"
          />
        </div>
      </div>
    </div>
  );
}