import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { MapPin } from "lucide-react";

export function VendorCard({ vendor }) {
  const avgRating = vendor.avgRating ? parseFloat(vendor.avgRating) : 0;

  return (
    <Card className="overflow-visible hover-elevate active-elevate-2 transition-all duration-200" data-testid={`vendor-card-${vendor.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.vendorName} className="object-cover" />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {vendor.vendorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`vendor-name-${vendor.id}`}>
              {vendor.vendorName}
            </h3>
            <Badge variant="secondary" className="mt-1" size="sm">
              {vendor.businessCategory}
            </Badge>
            <div className="flex items-center gap-1 mt-2 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-sm">{vendor.city}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-sm text-muted-foreground">
              ({vendor.totalReviews || 0} reviews)
            </span>
          </div>
        </div>

        {vendor.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {vendor.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/vendor/${vendor.id}`} className="w-full">
          <Button variant="outline" className="w-full" data-testid={`view-profile-${vendor.id}`}>
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
