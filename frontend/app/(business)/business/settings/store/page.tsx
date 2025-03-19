"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { BusinessHours, Store, StoreType } from "@/types/store";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const { data: session, isPending } = authClient.useSession();

  const defaultBusinessHours = [
    { day: "Monday", open: "09:00", close: "17:00", isOpen: true },
    { day: "Tuesday", open: "09:00", close: "17:00", isOpen: true },
    { day: "Wednesday", open: "09:00", close: "17:00", isOpen: true },
    { day: "Thursday", open: "09:00", close: "17:00", isOpen: true },
    { day: "Friday", open: "09:00", close: "17:00", isOpen: true },
    { day: "Saturday", open: "09:00", close: "17:00", isOpen: true },
    { day: "Sunday", open: "09:00", close: "17:00", isOpen: false },
  ];

  const form = useForm<Store>({
    defaultValues: {
      name: "",
      type: StoreType.BAKERY,
      description: "",
      location: {
        address: "",
      },
      businessHours: defaultBusinessHours as BusinessHours[],
      contactNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch("/api/stores", {
          credentials: "include",
        });
        const data = await response.json();
        console.log("Store data:", data);
        const storeData = data.store || data;
        if (storeData) {
          setStore(storeData);
          form.reset(storeData);
        }
      } catch (error) {
        console.error("Error fetching store:", error);
        toast.error("Failed to load store data");
      }
    };

    fetchStore();
  }, [session, form]);

  const onSubmit = async (data: Store) => {
    try {
      setLoading(true);
      const method = store ? "PUT" : "POST";
      const response = await fetch("/api/stores", {
        credentials: "include",
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save store settings");
      }

      toast.success("Store settings saved successfully");
      const responseData = await response.json();
      setStore(responseData);
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error("Failed to save store settings");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return <Spinner />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 justify-center items-center flex flex-col h-screen">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Store name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                rules={{ required: "Store type is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select store type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={StoreType.BAKERY}>Bakery</SelectItem>
                        <SelectItem value={StoreType.SUPERMARKET}>
                          Supermarket
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter store description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.address"
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Label>Business Hours</Label>
                {defaultBusinessHours.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.isOpen`}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label>{day.day}</Label>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.open`}
                      render={({ field }) => (
                        <Input
                          type="time"
                          {...field}
                          disabled={
                            !form.watch(`businessHours.${index}.isOpen`)
                          }
                        />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.close`}
                      render={({ field }) => (
                        <Input
                          type="time"
                          {...field}
                          disabled={
                            !form.watch(`businessHours.${index}.isOpen`)
                          }
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter store email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
