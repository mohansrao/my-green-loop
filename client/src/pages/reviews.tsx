import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Users, Utensils, Wine, Coffee } from "lucide-react";
import { format } from "date-fns";

interface PublicFeedback {
  id: number;
  customerName: string;
  rentalDate: string;
  cityOfUse: string;
  imageUrls: string[];
  likelihoodToRentAgain: number;
  likelihoodToRecommend: number;
  orderingExperience: number;
  suggestions?: string;
  platesUsed?: number;
  glassesUsed?: number;
  spoonsUsed?: number;
  createdAt: string;
}

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    </div>
  );
}

function UsageStats({ feedback }: { feedback: PublicFeedback }) {
  const stats = [
    { icon: Utensils, label: "Plates", value: feedback.platesUsed },
    { icon: Wine, label: "Glasses", value: feedback.glassesUsed },
    { icon: Coffee, label: "Spoons", value: feedback.spoonsUsed },
  ].filter(stat => stat.value && stat.value > 0);

  if (stats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {stat.value} {stat.label}
          </Badge>
        );
      })}
    </div>
  );
}

export default function Reviews() {
  const { data: reviews, isLoading, error } = useQuery<PublicFeedback[]>({
    queryKey: ["/api/feedback/public"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center">
            <p className="text-red-600">Error loading reviews. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h1>
          <p className="text-xl text-gray-600">
            See what our customers are saying about their eco-friendly dining experiences
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Reviews Yet</h2>
            <p className="text-gray-600">
              Be the first to share your experience with My Green Loop!
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {reviews.map((review) => (
              <Card key={review.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {review.customerName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(review.rentalDate), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {review.cityOfUse}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      Verified Customer
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Rating Summary */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <StarRating rating={review.likelihoodToRentAgain} label="Would Rent Again" />
                    <StarRating rating={review.likelihoodToRecommend} label="Would Recommend" />
                    <StarRating rating={review.orderingExperience} label="Ordering Experience" />
                  </div>

                  {/* Usage Statistics */}
                  <UsageStats feedback={review} />

                  {/* Customer Comments */}
                  {review.suggestions && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Customer Comments:</h4>
                      <p className="text-gray-700 leading-relaxed">{review.suggestions}</p>
                    </div>
                  )}

                  {/* Images */}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Event Photos:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {review.imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Event photo ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}