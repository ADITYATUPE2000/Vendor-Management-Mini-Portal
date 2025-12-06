import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";
import { PageLoader } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  MessageSquare,
  ArrowLeft,
  Calendar
} from "lucide-react";

export default function VendorProfile() {
  const [, params] = useRoute("/vendor/:id");
  const vendorId = params?.id;

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["/api/vendors", vendorId],
    enabled: !!vendorId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/vendors", vendorId, "products"],
    enabled: !!vendorId,
  });

  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ["/api/vendors", vendorId, "ratings"],
    enabled: !!vendorId,
  });

  if (vendorLoading) {
    return <PageLoader />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={Package}
          title="Vendor Not Found"
          description="The vendor you're looking for doesn't exist or has been removed."
          actionLabel="Browse Vendors"
          onAction={() => window.location.href = "/vendors"}
        />
      </div>
    );
  }

  const avgRating = vendor.avgRating ? parseFloat(vendor.avgRating) : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/vendors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.vendorName} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {vendor.vendorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold" data-testid="vendor-profile-name">
                  {vendor.vendorName}
                </h1>
                <Badge variant="secondary">{vendor.businessCategory}</Badge>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} size="md" showValue />
                <span className="text-muted-foreground">
                  ({vendor.totalReviews || 0} reviews)
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {vendor.city}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {vendor.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {vendor.contactNumber}
                </div>
              </div>

              {vendor.description && (
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  {vendor.description}
                </p>
              )}

              <div className="mt-6">
                <Link href={`/vendor/${vendor.id}/feedback`}>
                  <Button data-testid="leave-feedback-btn">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Leave Feedback
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Products & Services
                </h2>
                {productsLoading ? (
                  <PageLoader />
                ) : products.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <EmptyState
                        icon={Package}
                        title="No Products Listed"
                        description="This vendor hasn't added any products yet."
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Client Reviews
                </h2>
                {ratingsLoading ? (
                  <PageLoader />
                ) : ratings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <EmptyState
                        icon={MessageSquare}
                        title="No Reviews Yet"
                        description="Be the first to leave a review for this vendor."
                        actionLabel="Leave Feedback"
                        onAction={() => window.location.href = `/vendor/${vendor.id}/feedback`}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((review) => (
                      <Card key={review.id} data-testid={`review-${review.id}`}>
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
                )}
              </section>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Vendor Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-semibold">{products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={avgRating} size="sm" />
                      <span className="font-semibold">{avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{vendor.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary" size="sm">{vendor.businessCategory}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-semibold">{vendor.city}</span>
                  </div>

                  <div className="pt-4 border-t">
                    <Link href={`/vendor/${vendor.id}/feedback`} className="w-full">
                      <Button className="w-full" data-testid="sidebar-feedback-btn">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Leave a Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
