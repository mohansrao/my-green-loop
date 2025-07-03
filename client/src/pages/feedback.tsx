import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { CalendarIcon, Upload, Star } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Santa Clara County cities
const SANTA_CLARA_CITIES = [
  "Campbell", "Cupertino", "Gilroy", "Los Altos", "Los Altos Hills", "Los Gatos",
  "Milpitas", "Monte Sereno", "Morgan Hill", "Mountain View", "Palo Alto",
  "San Jose", "Santa Clara", "Saratoga", "Sunnyvale"
];

const feedbackSchema = z.object({
  customerName: z.string().optional(),
  rentalDate: z.date({
    required_error: "Please select a rental date",
  }),
  cityOfUse: z.string().min(1, "Please select a city"),
  likelihoodToRentAgain: z.number().min(1).max(5),
  likelihoodToRecommend: z.number().min(1).max(5),
  orderingExperience: z.number().min(1).max(5),
  suggestions: z.string().optional(),
  platesUsed: z.number().min(0).optional(),
  glassesUsed: z.number().min(0).optional(),
  spoonsUsed: z.number().min(0).optional(),
  marketingConsent: z.boolean().default(false),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface RatingFieldProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function RatingField({ value, onChange, label }: RatingFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={cn(
                "w-6 h-6",
                rating <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Feedback() {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      customerName: "",
      likelihoodToRentAgain: 5,
      likelihoodToRecommend: 5,
      orderingExperience: 5,
      suggestions: "",
      platesUsed: 0,
      glassesUsed: 0,
      spoonsUsed: 0,
      marketingConsent: false,
    },
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData & { imageUrls: string[] }) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback has been submitted successfully.",
      });
      form.reset();
      setUploadedImages([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (uploadedImages.length + files.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload up to 3 images only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') && 
                         (file.type === 'image/jpeg' || file.type === 'image/png');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a JPG or PNG image.`,
          variant: "destructive",
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setUploadedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FeedbackFormData) => {
    // For now, we'll store image names - in production, you'd upload to cloud storage
    const imageUrls = uploadedImages.map(file => file.name);
    
    await submitFeedback.mutateAsync({
      ...data,
      imageUrls,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Share Your Experience</CardTitle>
          <p className="text-center text-muted-foreground">
            Help us improve our service by sharing your feedback
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Name */}
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rental Date */}
              <FormField
                control={form.control}
                name="rentalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Rental Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City of Use */}
              <FormField
                control={form.control}
                name="cityOfUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City of Use</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city in Santa Clara County" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SANTA_CLARA_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Upload Photos (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload photos of your event setup or how you used our cutlery (up to 3 images, JPG/PNG, 10MB max each)
                </p>
                
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Images
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {uploadedImages.length}/3 uploaded
                  </span>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating Fields */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="likelihoodToRentAgain"
                  render={({ field }) => (
                    <FormItem>
                      <RatingField
                        value={field.value}
                        onChange={field.onChange}
                        label="How likely are you to rent from us again?"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="likelihoodToRecommend"
                  render={({ field }) => (
                    <FormItem>
                      <RatingField
                        value={field.value}
                        onChange={field.onChange}
                        label="How likely are you to recommend us to others?"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderingExperience"
                  render={({ field }) => (
                    <FormItem>
                      <RatingField
                        value={field.value}
                        onChange={field.onChange}
                        label="How was your ordering experience?"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Usage Analytics */}
              <div className="space-y-4">
                <Label>Items Used (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand usage patterns by telling us how many items you used
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="platesUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plates Used</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="glassesUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Glasses Used</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spoonsUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spoons Used</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Suggestions */}
              <FormField
                control={form.control}
                name="suggestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggestions for New Items or Services</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What other items or services would you like to see?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Marketing Consent */}
              <FormField
                control={form.control}
                name="marketingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I give permission to use my photos and name/city for testimonials or marketing (optional)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}