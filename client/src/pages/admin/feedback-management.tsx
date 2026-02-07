import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, EyeOff, Star, Calendar, MapPin, Image, TrendingUp } from "lucide-react";
import AdminNav from "@/components/admin/admin-nav";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface FeedbackItem {
  id: number;
  customerName?: string;
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
  marketingConsent: boolean;
  isVisible: boolean;
  createdAt: string;
}

interface AnalyticsData {
  usage: {
    total: {
      plates: number;
      glasses: number;
      spoons: number;
      events: number;
    };
    yearToDate: {
      plates: number;
      glasses: number;
      spoons: number;
      events: number;
    };
  };
  averageRatings: {
    likelihoodToRentAgain: string;
    likelihoodToRecommend: string;
    orderingExperience: string;
  } | null;
  totalFeedbackCount: number;
  year: number;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ feedback, onToggleVisibility }: { 
  feedback: FeedbackItem; 
  onToggleVisibility: (id: number, isVisible: boolean) => void; 
}) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {feedback.customerName || "Anonymous"}
              {feedback.marketingConsent && (
                <Badge variant="secondary" className="ml-2">Marketing OK</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(feedback.rentalDate), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {feedback.cityOfUse}
              </div>
              {feedback.imageUrls.length > 0 && (
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  {feedback.imageUrls.length} photo{feedback.imageUrls.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleVisibility(feedback.id, !feedback.isVisible)}
          >
            {feedback.isVisible ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Likelihood to Rent Again</p>
            <RatingStars rating={feedback.likelihoodToRentAgain} />
          </div>
          <div>
            <p className="text-sm font-medium">Likelihood to Recommend</p>
            <RatingStars rating={feedback.likelihoodToRecommend} />
          </div>
          <div>
            <p className="text-sm font-medium">Ordering Experience</p>
            <RatingStars rating={feedback.orderingExperience} />
          </div>
        </div>

        {/* Usage Data */}
        {(feedback.platesUsed || feedback.glassesUsed || feedback.spoonsUsed) && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Items Used</p>
            <div className="flex gap-4 text-sm">
              {feedback.platesUsed && (
                <span>Plates: {feedback.platesUsed}</span>
              )}
              {feedback.glassesUsed && (
                <span>Glasses: {feedback.glassesUsed}</span>
              )}
              {feedback.spoonsUsed && (
                <span>Spoons: {feedback.spoonsUsed}</span>
              )}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {feedback.suggestions && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Suggestions</p>
            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
              {feedback.suggestions}
            </p>
          </div>
        )}

        {/* Images */}
        {feedback.imageUrls.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Photos</p>
            <div className="flex gap-2">
              {feedback.imageUrls.map((url, index) => (
                <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {url}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Submitted: {format(new Date(feedback.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
            <Badge variant={feedback.isVisible ? "default" : "secondary"}>
              {feedback.isVisible ? "Public" : "Hidden"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ analytics }: { analytics: AnalyticsData | null }) {
  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Usage Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Usage (All Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plates Used:</span>
                  <span className="font-semibold">{analytics.usage.total.plates.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Glasses Used:</span>
                  <span className="font-semibold">{analytics.usage.total.glasses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spoons Used:</span>
                  <span className="font-semibold">{analytics.usage.total.spoons.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total Events:</span>
                  <span className="font-semibold">{analytics.usage.total.events}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Year to Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Year to Date ({analytics.year})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plates Used:</span>
                  <span className="font-semibold">{analytics.usage.yearToDate.plates.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Glasses Used:</span>
                  <span className="font-semibold">{analytics.usage.yearToDate.glasses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Spoons Used:</span>
                  <span className="font-semibold">{analytics.usage.yearToDate.spoons.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Events in {analytics.year}:</span>
                  <span className="font-semibold">{analytics.usage.yearToDate.events}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Average Ratings */}
      {analytics.averageRatings && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Average Customer Ratings</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Likelihood to Rent Again</p>
                  <div className="text-2xl font-bold mb-2">{analytics.averageRatings.likelihoodToRentAgain}/5</div>
                  <RatingStars rating={Math.round(parseFloat(analytics.averageRatings.likelihoodToRentAgain))} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Likelihood to Recommend</p>
                  <div className="text-2xl font-bold mb-2">{analytics.averageRatings.likelihoodToRecommend}/5</div>
                  <RatingStars rating={Math.round(parseFloat(analytics.averageRatings.likelihoodToRecommend))} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Ordering Experience</p>
                  <div className="text-2xl font-bold mb-2">{analytics.averageRatings.orderingExperience}/5</div>
                  <RatingStars rating={Math.round(parseFloat(analytics.averageRatings.orderingExperience))} />
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Based on {analytics.totalFeedbackCount} feedback submissions
          </p>
        </div>
      )}
    </div>
  );
}

export default function FeedbackManagement() {
  const [activeTab, setActiveTab] = useState("feedback");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
  });

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/feedback/analytics"],
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      const res = await apiRequest("PATCH", `/api/feedback/${id}/visibility`, { isVisible });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Feedback visibility updated",
        description: "Changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating visibility",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleVisibility = (id: number, isVisible: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible });
  };

  if (feedbackLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <AdminNav />
        <div className="text-center py-8">Loading feedback data...</div>
      </div>
    );
  }

  const visibleFeedback = feedback.filter(f => f.isVisible);
  const hiddenFeedback = feedback.filter(f => !f.isVisible);

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer feedback and view usage analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback">
            All Feedback ({feedback.length})
          </TabsTrigger>
          <TabsTrigger value="public">
            Public ({visibleFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-6">
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback submissions yet.
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {feedback.length} total submissions • {visibleFeedback.length} public • {hiddenFeedback.length} hidden
                </p>
              </div>
              
              {feedback.map((item) => (
                <FeedbackCard
                  key={item.id}
                  feedback={item}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          {visibleFeedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No public feedback available. Make feedback visible to display it here.
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {visibleFeedback.length} public feedback submissions
                </p>
              </div>
              
              {visibleFeedback.map((item) => (
                <FeedbackCard
                  key={item.id}
                  feedback={item}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab analytics={analytics || null} />
        </TabsContent>
      </Tabs>
    </div>
  </div>
  );
}