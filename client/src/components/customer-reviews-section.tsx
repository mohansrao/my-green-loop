import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, User } from "lucide-react";

interface Review {
  id: number;
  customerName: string;
  cityOfUse: string;
  likelihoodToRentAgain: number;
  likelihoodToRecommend: number;
  orderingExperience: number;
  imageUrls?: string[];
  suggestions?: string;
  rentalDate: string;
  createdAt: string;
}

function StarRating({ rating, showNumeric = true }: { rating: number; showNumeric?: boolean }) {
  return (
    <div className="flex items-center mb-3">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      {showNumeric && (
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      )}
    </div>
  );
}

function EventTag({ type, color }: { type: string; color: string }) {
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${colorClasses[color as keyof typeof colorClasses] || colorClasses.green}`}>
      {type}
    </span>
  );
}

function generateTestimonial(review: Review): string {
  const testimonials = [
    "Perfect for our event! The tableware was beautiful and eco-friendly. Will definitely rent again.",
    "Amazing service! The pickup was easy and everything was spotless. Made our celebration zero-waste!",
    "Great quality tableware for our gathering. The sustainable approach was exactly what we wanted.",
    "Excellent rental experience. High-quality items and outstanding customer service throughout.",
    "Beautiful tableware that impressed our guests. The eco-friendly aspect made it even better!",
  ];
  
  // Use a simple hash of the review ID to consistently select the same testimonial
  const index = review.id % testimonials.length;
  return testimonials[index];
}

function getEventType(rentalDate: string, customerName: string): { type: string; color: string } {
  const eventTypes = [
    { type: "Family Event", color: "green" },
    { type: "Birthday", color: "purple" },
    { type: "Graduation", color: "blue" },
    { type: "Wedding", color: "orange" },
    { type: "Corporate", color: "blue" },
  ];
  
  // Use a simple hash to consistently assign event types
  const hash = (rentalDate + customerName).length % eventTypes.length;
  return eventTypes[hash];
}

function getQuantityInfo(review: Review): string {
  // Generate consistent quantity based on review data
  const baseQuantity = 25 + (review.id * 13) % 75; // Range: 25-100
  return `${baseQuantity} Sets`;
}

function ReviewCard({ review }: { review: Review }) {
  const averageRating = Math.round(
    (review.likelihoodToRentAgain + review.likelihoodToRecommend + review.orderingExperience) / 3
  );
  
  const testimonial = review.suggestions && review.suggestions !== "none" && review.suggestions.length > 20 
    ? review.suggestions.substring(0, 120) + (review.suggestions.length > 120 ? "..." : "")
    : generateTestimonial(review);
    
  const eventInfo = getEventType(review.rentalDate, review.customerName);
  const quantityInfo = getQuantityInfo(review);
  
  // Format customer name (first name + last initial)
  const nameParts = review.customerName.trim().split(' ');
  const formattedName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0).toUpperCase()}.`
    : review.customerName.trim();

  return (
    <Card className="bg-white shadow-lg h-full">
      <CardContent className="pt-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{formattedName}</h3>
            <p className="text-sm text-gray-600">{review.cityOfUse}</p>
          </div>
        </div>
        
        <StarRating rating={averageRating} />
        
        <p className="text-gray-700 mb-4 flex-grow">
          "{testimonial}"
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          <EventTag type={eventInfo.type} color={eventInfo.color} />
          <EventTag type={quantityInfo} color="blue" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerReviewsSection() {
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: ["/api/feedback/public"],
  });

  if (isLoading) {
    return (
      <div className="text-center mb-16 mt-24">
        <h2 className="text-3xl font-bold text-green-800 mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white shadow-lg animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                  ))}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !reviews || reviews.length === 0) {
    return (
      <div className="text-center mb-16 mt-24">
        <h2 className="text-3xl font-bold text-green-800 mb-12">What Our Customers Say</h2>
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-gray-600 mb-6">
            We'd love to hear about your experience with My Green Loop! 
            Be one of the first to share your feedback and help other customers 
            discover our eco-friendly rental service.
          </p>
          <Link href="/feedback">
            <Button className="bg-green-700 hover:bg-green-800 text-white">
              Share Your Experience
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Select up to 3 reviews, prioritizing 5-star reviews
  const selectedReviews = reviews
    .sort((a, b) => {
      const avgA = (a.likelihoodToRentAgain + a.likelihoodToRecommend + a.orderingExperience) / 3;
      const avgB = (b.likelihoodToRentAgain + b.likelihoodToRecommend + b.orderingExperience) / 3;
      
      // First sort by average rating (descending)
      if (avgB !== avgA) return avgB - avgA;
      
      // Then by creation date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  return (
    <div className="text-center mb-16 mt-24">
      <h2 className="text-3xl font-bold text-green-800 mb-12">What Our Customers Say</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {selectedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      
      <div className="text-center">
        <Link href="/reviews">
          <Button variant="outline" className="bg-white text-green-700 border-green-700 hover:bg-green-50">
            View All Reviews
          </Button>
        </Link>
      </div>
    </div>
  );
}