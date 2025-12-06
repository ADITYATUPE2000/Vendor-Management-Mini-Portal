import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export function ProductCard({ product }) {
  return (
    <Card className="overflow-hidden" data-testid={`product-card-${product.id}`}>
      <div className="aspect-video relative bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold truncate" data-testid={`product-name-${product.id}`}>
          {product.name}
        </h4>
        {product.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        {product.priceRange && (
          <Badge variant="secondary" className="mt-2" size="sm">
            {product.priceRange}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
