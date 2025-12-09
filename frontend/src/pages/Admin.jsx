import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { PageLoader } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { 
  Search, 
  Users, 
  Eye, 
  MapPin, 
  Phone, 
  Mail,
  ExternalLink,
  Shield
} from "lucide-react";

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const filteredVendors = vendors.filter((vendor) =>
    vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.businessCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReviews = vendors.reduce((sum, v) => sum + (v.totalReviews || 0), 0);
  const avgRating = vendors.length > 0
    ? vendors.reduce((sum, v) => sum + (parseFloat(v.avgRating) || 0), 0) / vendors.length
    : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage and monitor all registered vendors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{vendors.length}</div>
              <div className="text-sm text-muted-foreground">Total Vendors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{totalReviews}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{avgRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {[...new Set(vendors.map(v => v.businessCategory))].length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Vendors</CardTitle>
                <CardDescription>
                  View and manage vendor profiles
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="admin-search"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PageLoader />
            ) : filteredVendors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Vendors Found"
                description={
                  searchQuery
                    ? "No vendors match your search criteria."
                    : "No vendors have registered yet."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => {
                      const rating = vendor.avgRating ? parseFloat(vendor.avgRating) : 0;
                      return (
                        <TableRow key={vendor.id} className="h-16" data-testid={`admin-row-${vendor.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.vendorName} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {vendor.vendorName?.charAt(0)?.toUpperCase() || 'V'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{vendor.vendorName}</div>
                                <div className="text-xs text-muted-foreground">{vendor.ownerName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" size="sm">{vendor.businessCategory}</Badge>
                          </TableCell>
                          <TableCell>{vendor.city}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StarRating rating={rating} size="sm" />
                              <span className="text-sm">{rating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{vendor.totalReviews || 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedVendor(vendor)}
                                data-testid={`view-vendor-${vendor.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Link href={`/vendor/${vendor.id}`}>
                                <Button variant="ghost" size="icon" data-testid={`link-vendor-${vendor.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
            </DialogHeader>
            {selectedVendor && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={selectedVendor.logoUrl || undefined} alt={selectedVendor.vendorName} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedVendor.vendorName?.charAt(0)?.toUpperCase() || 'V'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedVendor.vendorName}</h3>
                    <Badge variant="secondary" className="mt-1" size="sm">
                      {selectedVendor.businessCategory}
                    </Badge>
                    <div className="flex items-center gap-2 mt-2">
                      <StarRating rating={parseFloat(selectedVendor.avgRating) || 0} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        ({selectedVendor.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVendor.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedVendor.city}</span>
                  </div>
                </div>

                {selectedVendor.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedVendor.description}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                    Close
                  </Button>
                  <Link href={`/vendor/${selectedVendor.id}`}>
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
