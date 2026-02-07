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
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div>{feedback.customerName || "Anonymous"}</div>
        <div className="text-xs text-muted-foreground">
          {feedback.marketingConsent && (
            <Badge variant="secondary" className="mt-1 h-5 text-[10px] px-1.5">Marketing OK</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          {format(new Date(feedback.rentalDate), "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <MapPin className="w-3.5 h-3.5" />
          {feedback.cityOfUse}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4 max-w-[180px]">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rent Again</span>
            <RatingStars rating={feedback.likelihoodToRentAgain} />
          </div>
          <div className="flex items-center justify-between gap-4 max-w-[180px]">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Recommend</span>
            <RatingStars rating={feedback.likelihoodToRecommend} />
          </div>
          <div className="flex items-center justify-between gap-4 max-w-[180px]">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Experience</span>
            <RatingStars rating={feedback.orderingExperience} />
          </div>
        </div>
      </TableCell>
      <TableCell>
        {(feedback.platesUsed || feedback.glassesUsed || feedback.spoonsUsed) ? (
          <div className="text-xs space-y-0.5">
            {feedback.platesUsed && <div>Plates: <span className="font-medium">{feedback.platesUsed}</span></div>}
            {feedback.glassesUsed && <div>Glasses: <span className="font-medium">{feedback.glassesUsed}</span></div>}
            {feedback.spoonsUsed && <div>Spoons: <span className="font-medium">{feedback.spoonsUsed}</span></div>}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs italic">No data</span>
        )}
      </TableCell>
      <TableCell className="max-w-xs">
        {feedback.suggestions ? (
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            "{feedback.suggestions}"
          </p>
        ) : (
          <span className="text-muted-foreground text-xs italic">No suggestions</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={feedback.isVisible ? "default" : "secondary"} className="text-[10px] h-5 px-1.5">
          {feedback.isVisible ? "Public" : "Hidden"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onToggleVisibility(feedback.id, !feedback.isVisible)}
        >
          {feedback.isVisible ? (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-blue-600" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function FeedbackTable({ 
  items, 
  onToggleVisibility, 
  isLoading, 
  emptyMessage 
}: { 
  items: FeedbackItem[]; 
  onToggleVisibility: (id: number, isVisible: boolean) => void;
  isLoading?: boolean;
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                <TableHead className="font-semibold text-gray-900">Rental Details</TableHead>
                <TableHead className="font-semibold text-gray-900">Ratings</TableHead>
                <TableHead className="font-semibold text-gray-900">Items Used</TableHead>
                <TableHead className="font-semibold text-gray-900">Suggestions</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading feedback...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <FeedbackCard
                    key={item.id}
                    feedback={item}
                    onToggleVisibility={onToggleVisibility}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ analytics }: { analytics: AnalyticsData | null }) {
  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-white border rounded-lg">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analytics Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Plates Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analytics.usage.total.plates.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">All time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Glasses Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analytics.usage.total.glasses.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Spoons Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{analytics.usage.total.spoons.toLocaleString()}</div>
            <p className="text-xs text-orange-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics.usage.total.events}</div>
            <p className="text-xs text-purple-600 mt-1">Sustainability tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Year to Date Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Year to Date ({analytics.year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-muted-foreground">Plates Used</span>
                <span className="font-semibold text-gray-900">{analytics.usage.yearToDate.plates.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-muted-foreground">Glasses Used</span>
                <span className="font-semibold text-gray-900">{analytics.usage.yearToDate.glasses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-muted-foreground">Spoons Used</span>
                <span className="font-semibold text-gray-900">{analytics.usage.yearToDate.spoons.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-semibold text-green-600">{analytics.usage.yearToDate.events}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Ratings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.averageRatings ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Rent Again</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.averageRatings.likelihoodToRentAgain}/5</div>
                  <RatingStars rating={Math.round(parseFloat(analytics.averageRatings.likelihoodToRentAgain))} />
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Recommend</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.averageRatings.likelihoodToRecommend}/5</div>
                  <RatingStars rating={Math.round(parseFloat(analytics.averageRatings.likelihoodToRecommend))} />
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Ordering</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{analytics.averageRatings.orderingExperience}/5</div>
                  <RatingStars rating={Math.round(parseFloat(analytics.averageRatings.orderingExperience))} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground italic">No rating data yet</div>
            )}
            <p className="text-center text-xs text-muted-foreground mt-6 italic">
              Results calculated from {analytics.totalFeedbackCount} verified customer submissions
            </p>
          </CardContent>
        </Card>
      </div>
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

  const visibleFeedback = feedback.filter(f => f.isVisible);

  if (feedbackLoading) {
    return (
      <div>
        <AdminNav />
        <div className="container mx-auto py-8 px-4 space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-100 rounded mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer feedback and view usage analytics
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 h-auto">
            <TabsTrigger value="feedback" className="py-2.5 data-[state=active]:bg-gray-100">
              All Submissions ({feedback.length})
            </TabsTrigger>
            <TabsTrigger value="public" className="py-2.5 data-[state=active]:bg-gray-100">
              Public Display ({visibleFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="py-2.5 data-[state=active]:bg-gray-100">
              Analytics Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="mt-0">
            <FeedbackTable 
              items={feedback} 
              onToggleVisibility={handleToggleVisibility} 
              emptyMessage="No feedback submissions yet."
            />
          </TabsContent>

          <TabsContent value="public" className="mt-0">
            <FeedbackTable 
              items={visibleFeedback} 
              onToggleVisibility={handleToggleVisibility} 
              emptyMessage="No public feedback available yet."
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsTab analytics={analytics || null} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}