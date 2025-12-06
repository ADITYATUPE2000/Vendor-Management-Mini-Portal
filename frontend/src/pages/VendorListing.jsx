import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorCard } from "@/components/VendorCard";
import { PageLoader } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { businessCategories } from "../../../shared/schema";
import { Search, SlidersHorizontal, Users, X } from "lucide-react";

export default function VendorListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const filteredVendors = vendors
    .filter((vendor) => {
      const matchesSearch = vendor.vendorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || vendor.businessCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (parseFloat(b.avgRating) || 0) - (parseFloat(a.avgRating) || 0);
      }
      if (sortBy === "reviews") {
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      }
      if (sortBy === "name") {
        return a.vendorName.localeCompare(b.vendorName);
      }
      return 0;
    });

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("rating");
  };

  const hasActiveFilters = searchQuery || categoryFilter !== "all";

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Vendors</h1>
          <p className="text-muted-foreground">
            Find the perfect vendor for your project needs
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="category-filter">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px]" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} data-testid="clear-filters">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : filteredVendors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Vendors Found"
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters to find vendors."
                : "No vendors have registered yet. Be the first!"
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
