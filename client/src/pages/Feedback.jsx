import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { PageLoader } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  MessageSquare,
  Calendar
} from "lucide-react";

const feedbackSchema = z.object({
  clientName: z.string().min(1, "Your name is required"),
  projectName: z.string().min(1, "Project name is required"),
  rating: z.number().min(1, "Please select a rating").max(5),
  comments: z.string().optional(),
});

export default function Feedback() {
  const [, params] = useRoute("/vendor/:id/feedback");
  const [, setLocation] = useLocation();
  const vendorId = params?.id;
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["/api/vendors", vendorId],
    enabled: !!vendorId,
  });

  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ["/api/vendors", vendorId, "ratings"],
    enabled: !!vendorId,
  });

  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      clientName: "",
      projectName: "",
      rating: 0,
      comments: "",
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/ratings", {
        ...data,
        vendorId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendorId, "ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsSuccess(true);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    feedbackMutation.mutate(data);
  };

  if (vendorLoading) {
    return <PageLoader />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={MessageSquare}
          title="Vendor Not Found"
          description="The vendor you're looking for doesn't exist."
          actionLabel="Browse Vendors"
          onAction={() => setLocation("/vendors")}
        />
      </div>
    );
  }

  const avgRating = vendor.avgRating ? parseFloat(vendor.avgRating) : 0;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully. It helps other clients make informed decisions.
            </p>
            <div className="flex flex-col gap-2">
              <Link href={`/vendor/${vendorId}`}>
                <Button className="w-full" data-testid="back-to-profile-btn">
                  Back to Vendor Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSuccess(false);
                  form.reset();
                }}
                data-testid="submit-another-btn"
              >
                Submit Another Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Link 
          href={`/vendor/${vendorId}`} 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Profile
        </Link>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.vendorName} className="object-cover" />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {vendor.vendorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">{vendor.vendorName}</h2>
                <Badge variant="secondary" size="sm">{vendor.businessCategory}</Badge>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={avgRating} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    ({vendor.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Your Feedback</CardTitle>
            <CardDescription>
              Share your experience working with {vendor.vendorName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-client-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Office Renovation" {...field} data-testid="input-project-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating *</FormLabel>
                      <FormControl>
                        <div className="pt-2">
                          <StarRating
                            rating={field.value}
                            size="lg"
                            interactive
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share details about your experience..."
                          className="min-h-[120px]"
                          {...field}
                          data-testid="input-comments"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={feedbackMutation.isPending}
                  data-testid="submit-feedback"
                >
                  {feedbackMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {ratings.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.clientName}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm text-muted-foreground">{review.projectName}</span>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {review.comments && (
                      <p className="mt-3 text-muted-foreground">{review.comments}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
