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

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-green-800 text-center mb-8">Perfect for Every Occasion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70"
                alt="Family gathering outdoors with eco-friendly tableware"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Family Gatherings</h3>
                  <p className="text-sm">Reunions, BBQs & Picnics</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3"
                alt="Outdoor celebration setup"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Celebrations</h3>
                  <p className="text-sm">Birthdays, Anniversaries & More</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1519046904884-53103b34b206"
                alt="Beach gathering with sustainable dining"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Outdoor Events</h3>
                  <p className="text-sm">Beach Days & Park Activities</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205"
                alt="Cultural celebration setup"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Cultural Events</h3>
                  <p className="text-sm">Quinceañeras, Bar/Bat Mitzvahs</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622"
                alt="School event celebration"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">School Events</h3>
                  <p className="text-sm">Graduations & End-of-Year Parties</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3"
                alt="Sports event gathering"
                className="w-full h-64 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Sports Events</h3>
                  <p className="text-sm">Team Celebrations & Gatherings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
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

        {/* Customer Reviews Section - MOCKUP */}
        <div className="text-center mb-16 mt-24">
          <h2 className="text-3xl font-bold text-green-800 mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            
            {/* Sample Review 1 - Based on real data */}
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face" 
                    alt="Customer" 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Sarah M.</h3>
                    <p className="text-sm text-gray-600">Los Altos</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400">★</div>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(5/5)</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "Perfect for our family gathering! The stainless steel plates were beautiful and eco-friendly. Will definitely rent again."
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Family Event</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">50 Plates</span>
                </div>
              </CardContent>
            </Card>

            {/* Sample Review 2 */}
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                    alt="Customer" 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Michael R.</h3>
                    <p className="text-sm text-gray-600">San Jose</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400">★</div>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(5/5)</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "Amazing service! The pickup was easy and the tableware was spotless. Made our birthday celebration zero-waste!"
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Birthday</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">75 Sets</span>
                </div>
              </CardContent>
            </Card>

            {/* Sample Review 3 */}
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" 
                    alt="Customer" 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">Jennifer L.</h3>
                    <p className="text-sm text-gray-600">Sunnyvale</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400">★</div>
                  ))}
                  <div className="w-4 h-4 text-gray-300">★</div>
                  <span className="text-sm text-gray-600 ml-2">(4/5)</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "Great quality tableware for our graduation party. The kids loved the sustainable approach. Highly recommend!"
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Graduation</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">100 Sets</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Link href="/reviews">
              <Button variant="outline" className="bg-white text-green-700 border-green-700 hover:bg-green-50">
                View All Reviews
              </Button>
            </Link>
          </div>
        </div>

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