"use client";

import { Spinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reservation, STATUS_BADGES } from "@/types/reservation";
import { getRatingCategory } from "@/types/user-rating";
import { format } from "date-fns";
import { Inbox, RotateCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<
    (Reservation & { userRating?: number })[]
  >([]);
  const [filteredOrders, setFilteredOrders] = useState<
    (Reservation & { userRating?: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const setLoading = (orderId: string, action: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`${orderId}-${action}`]: isLoading,
    }));
  };

  // Handle search input
  useEffect(() => {
    const filtered = orders.filter((order) => {
      const searchStr = searchQuery.toLowerCase();
      const items = order.items
        .map((item) => item.name.toLowerCase())
        .join(" ");
      const status = STATUS_BADGES[order.status].label.toLowerCase();
      const orderDate = format(
        new Date(order.createdAt),
        "MMM d, h:mm a"
      ).toLowerCase();

      return (
        items.includes(searchStr) ||
        status.includes(searchStr) ||
        orderDate.includes(searchStr) ||
        order.completionPin?.toString().includes(searchStr)
      );
    });
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reservation");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const { reservations } = await response.json();

      // Fetch user ratings for each order
      const ordersWithRatings = await Promise.all(
        reservations.map(async (order: Reservation) => {
          try {
            const ratingResponse = await fetch(
              `/api/user-rating?userId=${order.userId}`
            );
            if (ratingResponse.ok) {
              const ratingData = await ratingResponse.json();
              return { ...order, userRating: ratingData.rating };
            }
          } catch (error) {
            console.error("Error fetching user rating:", error);
          }
          return order;
        })
      );

      setOrders(ordersWithRatings);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh orders every minute
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    action: string
  ) => {
    try {
      setLoading(orderId, action, true);
      const response = await fetch(`/api/reservation/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      const updatedOrder = await response.json();

      // Refresh orders list
      fetchOrders();
      toast.success(`Order ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(orderId, action, false);
    }
  };

  const handleNotCollected = async (orderId: string) => {
    try {
      setLoading(orderId, "not-collected", true);
      const response = await fetch(
        `/api/reservation/${orderId}/not-collected`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to mark as not collected");
      fetchOrders();
      toast.success("Order marked as not collected");
    } catch (error) {
      console.error("Error marking as not collected:", error);
      toast.error("Failed to mark as not collected");
    } finally {
      setLoading(orderId, "not-collected", false);
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      setLoading(orderId, "cancel", true);
      const response = await fetch(`/api/reservation/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });

      if (!response.ok) throw new Error("Failed to cancel order");
      fetchOrders();
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setLoading(orderId, "cancel", false);
    }
  };

  const calculateTotal = (items: Reservation["items"]) => {
    return items.reduce((total, item) => {
      const discountedPrice =
        item.originalPrice * (1 - item.discountPercentage / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orders Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              <RotateCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Time</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pickup Time</TableHead>
                  <TableHead>User Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map((order) => (
                  <TableRow key={order._id} className="!h-[96px]">
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      {order.items.map((item, index) => (
                        <div key={index}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      ${calculateTotal(order.items).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.pickupTime), "h:mm a")}
                    </TableCell>
                    <TableCell>
                      {order.userRating && (
                        <Badge
                          variant="secondary"
                          className={getRatingCategory(order.userRating).color}
                        >
                          {getRatingCategory(order.userRating).label} (
                          {order.userRating})
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={STATUS_BADGES[order.status].color}
                      >
                        {STATUS_BADGES[order.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            disabled={loadingStates[`${order._id}-confirm`]}
                            onClick={() =>
                              updateOrderStatus(
                                order._id,
                                "confirmed",
                                "confirm"
                              )
                            }
                          >
                            {loadingStates[`${order._id}-confirm`]
                              ? "Confirming..."
                              : "Confirm"}
                          </Button>

                          <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={loadingStates[`${order._id}-cancel`]}
                            onClick={() => handleCancel(order._id)}
                          >
                            {loadingStates[`${order._id}-cancel`]
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </Button>
                        </div>
                      )}
                      {order.status === "confirmed" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            disabled={loadingStates[`${order._id}-ready`]}
                            onClick={() =>
                              updateOrderStatus(order._id, "ready", "ready")
                            }
                          >
                            {loadingStates[`${order._id}-ready`]
                              ? "Marking Ready..."
                              : "Mark Ready"}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={loadingStates[`${order._id}-cancel`]}
                            onClick={() => handleCancel(order._id)}
                          >
                            {loadingStates[`${order._id}-cancel`]
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </Button>
                        </div>
                      )}
                      {order.status === "ready" && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            PIN: {order.completionPin}
                          </Badge>
                          <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={
                              loadingStates[`${order._id}-not-collected`]
                            }
                            onClick={() => handleNotCollected(order._id)}
                          >
                            {loadingStates[`${order._id}-not-collected`]
                              ? "Marking..."
                              : "Not Collected"}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && currentOrders.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-4">
              <Inbox className="h-12 w-12 text-muted-foreground" />
              <div className="text-xl font-medium text-muted-foreground">
                No orders found
              </div>
              <div className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms or clear the search to see all orders"
                  : "New orders will appear here once customers make reservations"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
