import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { PageLoader } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { businessCategories } from "../../../shared/schema";
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  Eye, 
  MapPin,
  Phone,
  Mail,
  Loader2,
  ExternalLink
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  priceRange: z.string().optional(),
});

const updateVendorSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  businessCategory: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
});

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { vendor, isLoading: authLoading, isAuthenticated } = useAuth();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please login to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
    }
  }, [authLoading, isAuthenticated, setLocation, toast]);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/vendors", vendor?.id, "products"],
    enabled: !!vendor?.id,
  });

  const productForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      priceRange: "",
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(updateVendorSchema),
    defaultValues: {
      vendorName: "",
      ownerName: "",
      contactNumber: "",
      businessCategory: "",
      city: "",
      description: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (vendor) {
      profileForm.reset({
        vendorName: vendor.vendorName || "",
        ownerName: vendor.ownerName || "",
        contactNumber: vendor.contactNumber || "",
        businessCategory: vendor.businessCategory || "",
        city: vendor.city || "",
        description: vendor.description || "",
        logoUrl: vendor.logoUrl || "",
      });
    }
  }, [vendor, profileForm]);

  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/products", { ...data, vendorId: vendor.id });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendor.id, "products"] });
      setProductDialogOpen(false);
      productForm.reset();
      toast({ title: "Product added successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to add product", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendor.id, "products"] });
      setProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: "Product updated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendor.id, "products"] });
      setDeleteProductId(null);
      toast({ title: "Product deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PATCH", `/api/vendors/${vendor.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/vendor"] });
      setEditProfileOpen(false);
      toast({ title: "Profile updated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    },
  });

  const handleProductSubmit = (data) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      priceRange: product.priceRange || "",
    });
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
    productForm.reset();
  };

  if (authLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !vendor) {
    return null;
  }

  const avgRating = vendor.avgRating ? parseFloat(vendor.avgRating) : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-border">
                  <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.vendorName} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {vendor.vendorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{vendor.vendorName}</CardTitle>
                <Badge variant="secondary" className="mx-auto mt-2" size="sm">
                  {vendor.businessCategory}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <StarRating rating={avgRating} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    ({vendor.totalReviews || 0} reviews)
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.city}</span>
                  </div>
                </div>

                {vendor.description && (
                  <p className="text-sm text-muted-foreground pt-4 border-t">
                    {vendor.description}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" data-testid="edit-profile-btn">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your vendor profile information
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="vendorName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vendor Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="ownerName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Owner Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="contactNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="businessCategory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {businessCategories.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="logoUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com/logo.png" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditProfileOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={updateProfileMutation.isPending}>
                              {updateProfileMutation.isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                              ) : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Link href={`/vendor/${vendor.id}`} className="w-full">
                    <Button variant="outline" className="w-full" data-testid="view-public-profile-btn">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{products.length}</div>
                    <div className="text-sm text-muted-foreground">Products</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{avgRating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{vendor.totalReviews || 0}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your product listings</CardDescription>
                </div>
                <Dialog open={productDialogOpen} onOpenChange={(open) => {
                  if (!open) handleCloseProductDialog();
                  else setProductDialogOpen(true);
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="add-product-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                      <DialogDescription>
                        {editingProduct ? "Update your product details" : "Add a new product to showcase"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-product-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://example.com/image.jpg" data-testid="input-product-image" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} data-testid="input-product-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="priceRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Range</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., $100 - $500" data-testid="input-product-price" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={handleCloseProductDialog}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            data-testid="submit-product"
                          >
                            {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            ) : editingProduct ? "Update Product" : "Add Product"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <PageLoader />
                ) : products.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No Products Yet"
                    description="Add your first product to showcase on your profile"
                    actionLabel="Add Product"
                    onAction={() => setProductDialogOpen(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden" data-testid={`product-item-${product.id}`}>
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
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{product.name}</h4>
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {product.description}
                                </p>
                              )}
                              {product.priceRange && (
                                <Badge variant="secondary" className="mt-2" size="sm">
                                  {product.priceRange}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                                data-testid={`edit-product-${product.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteProductId(product.id)}
                                className="text-destructive"
                                data-testid={`delete-product-${product.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductMutation.mutate(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
