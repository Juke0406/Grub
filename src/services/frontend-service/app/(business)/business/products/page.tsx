"use client";

import { PRODUCT_CATEGORIES } from "@/components/category-filter";
import { SearchHeader } from "@/components/search-header";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Store } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Spinner } from "@/components/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";

const formSchema = z.object({
  SKU: z.string().min(2, {
    message: "SKU must be at least 2 characters.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  originalPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please enter a valid price greater than 0.",
    }),
  discountedPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Please enter a valid discounted price (0 or greater).",
    }),
  quantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Please enter a valid quantity (0 or greater).",
    }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  expirationDate: z.date({
    required_error: "Please select an expiration date.",
  }),
});

const categories = [
  { id: "all", name: "All", icon: <Store className="h-4 w-4" /> },
  ...PRODUCT_CATEGORIES.slice(1), // Skip the "All Products" entry since we have our own
];

export default function ProductsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  const fetchStoreId = useCallback(async () => {
    if (!session?.user?.id) {
      console.error("No authenticated user found");
      return;
    }

    try {
      setIsStoreLoading(true);
      const storeRes = await fetch("/api/stores");
      const storeData = await storeRes.json();

      if (storeData?.store?._id) {
        setStoreId(storeData.store._id);
        fetchProducts(1, true);
      } else {
        console.error("No store found in response:", storeData);
      }
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setTimeout(() => {
        setIsStoreLoading(false);
      }, 3000);
    }
  }, [session?.user?.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      SKU: "",
      imageUrl: "",
      name: "",
      description: "",
      originalPrice: "",
      discountedPrice: "",
      quantity: "",
      category: "",
    },
  });

  const fetchProducts = useCallback(
    async (pageNum: number, resetProducts = false) => {
      try {
        const searchParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
        });

        if (searchValue) {
          searchParams.append("search", searchValue);
        }

        if (activeCategory !== "all") {
          searchParams.append("category", activeCategory);
        }

        // Add portal parameter to indicate this is from business portal
        searchParams.append("portal", "business");

        const res = await fetch(`/api/products?${searchParams.toString()}`);
        const data = await res.json();

        if (pageNum === 1 || resetProducts) {
          setProducts(data.products || []);
        } else {
          setProducts((prev) => [...prev, ...(data.products || [])]);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    [searchValue, activeCategory]
  );

  useEffect(() => {
    if (!isPending && session) {
      fetchStoreId();
    }
  }, [session, isPending, fetchStoreId]);

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  useEffect(() => {
    if (page > 1) {
      setIsLoadingMore(true);
      fetchProducts(page).finally(() => setIsLoadingMore(false));
    }
  }, [page, fetchProducts]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [searchValue, activeCategory, fetchProducts]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!storeId && !isStoreLoading) {
        toast.error("Store not found. Please set up your store first.");
        return;
      }

      setIsLoading(true);

      const payload = {
        ...values,
        originalPrice: parseFloat(values.originalPrice),
        discountedPrice: parseFloat(values.discountedPrice),
        inventory: {
          quantity: parseInt(values.quantity, 10),
          expirationDate: values.expirationDate,
        },
      };

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      const data = await res.json();
      toast.success(
        data.message ||
          `Product ${editingProduct ? "updated" : "created"} successfully!`
      );
      form.reset();
      setEditingProduct(null);
      fetchProducts(1, true);
    } catch (error) {
      console.error(error);
      toast.error(
        `Error ${
          editingProduct ? "updating" : "creating"
        } product. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      SKU: product.SKU,
      imageUrl: product.imageUrl,
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice.toString(),
      discountedPrice: product.discountedPrice.toString(),
      quantity: product.inventory.quantity.toString(),
      category: product.category,
      expirationDate: new Date(product.inventory.expirationDate),
    });
  };

  const handleDelete = async (productId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully!");
      setDeleteId(null);
      fetchProducts(1, true);
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Not Authenticated</h2>
          <p className="text-muted-foreground">
            Please sign in to access product management.
          </p>
          <Button
            className="mt-4"
            onClick={() => (window.location.href = "/auth/signin")}
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (!storeId && !isStoreLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Store Not Found</h2>
          <p className="text-muted-foreground">
            Please set up your store in the settings page before managing
            products.
          </p>
          <Button
            className="mt-4"
            onClick={() => (window.location.href = "/business/settings/store")}
          >
            Go to Store Settings
          </Button>
        </Card>
      </div>
    );
  }

  if (isStoreLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="list">Products List</TabsTrigger>
          <TabsTrigger value="create">Create Product</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <SearchHeader
            onSearch={setSearchValue}
            placeholder="Search products..."
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {products.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-6xl">
                  <Store />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No products yet</h3>
                  <p className="text-muted-foreground">
                    Get started by creating a new product or seeding mock data
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setActiveTab("create")}>
                    Create Product
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setIsSeeding(true);
                        const res = await fetch("/api/products/seed", {
                          method: "POST",
                        });
                        if (!res.ok) {
                          throw new Error("Failed to seed products");
                        }
                        const data = await res.json();
                        toast.success(
                          `Successfully seeded ${data.count} products`
                        );
                        fetchProducts(1, true);
                      } catch (error) {
                        console.error(error);
                        toast.error(
                          "Error seeding products. Please try again."
                        );
                      } finally {
                        setIsSeeding(false);
                      }
                    }}
                    disabled={isSeeding}
                  >
                    {isSeeding ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Seeding...
                      </span>
                    ) : (
                      "Seed Mock Data"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product: any, index: number) => (
                  <div
                    key={product._id}
                    ref={index === products.length - 1 ? lastProductRef : null}
                  >
                    <Card className="p-4 relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              handleEdit(product);
                              setActiveTab("create");
                            }}
                          >
                            Edit
                          </Button>
                          <AlertDialog
                            open={deleteId === product._id}
                            onOpenChange={(open) => !open && setDeleteId(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteId(product._id)}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the product.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product._id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="aspect-square relative mb-2">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="object-cover rounded-md w-full h-full"
                        />
                      </div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{product.category}</Badge>
                        <Badge variant="outline">SKU: {product.SKU}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm line-through text-muted-foreground">
                            ${product.originalPrice}
                          </p>
                          <p className="font-semibold text-lg">
                            ${product.discountedPrice}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Quantity
                          </p>
                          <p className="font-medium">
                            {product.inventory.quantity}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <Spinner className="h-8 w-8" />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-4 space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="SKU"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a category</option>
                            {PRODUCT_CATEGORIES.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discounted Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiration Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
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
                            disabled={(date) => {
                              const today = new Date();
                              const twoYearsFromNow = new Date();
                              twoYearsFromNow.setFullYear(
                                today.getFullYear() + 2
                              );
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                  {editingProduct && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      try {
                        setIsSeeding(true);
                        const res = await fetch("/api/products/seed", {
                          method: "POST",
                        });
                        if (!res.ok) {
                          throw new Error("Failed to seed products");
                        }
                        const data = await res.json();
                        toast.success(
                          `Successfully seeded ${data.count} products`
                        );
                        fetchProducts(1, true);
                        setActiveTab("list");
                      } catch (error) {
                        console.error(error);
                        toast.error(
                          "Error seeding products. Please try again."
                        );
                      } finally {
                        setIsSeeding(false);
                      }
                    }}
                    disabled={isSeeding}
                  >
                    {isSeeding ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Seeding...
                      </span>
                    ) : (
                      "Seed Mock Products"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
