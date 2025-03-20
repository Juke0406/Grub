"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<
    (Reservation & { userRating?: number })[]
  >([]);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const setLoading = (orderId: string, action: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`${orderId}-${action}`]: isLoading,
    }));
  };

  const fetchOrders = async () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
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
              {orders.map((order) => (
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
                            updateOrderStatus(order._id, "confirmed", "confirm")
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
                          disabled={loadingStates[`${order._id}-not-collected`]}
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
        </CardContent>
      </Card>
    </div>
  );
}
