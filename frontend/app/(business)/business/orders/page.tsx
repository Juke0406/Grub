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
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Reservation[]>([]);
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/reservation");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const { reservations } = await response.json();
      setOrders(reservations);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
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
    <div className="container mx-auto py-8">
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
                    <Badge
                      variant="default"
                      className={STATUS_BADGES[order.status].color}
                    >
                      {STATUS_BADGES[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.status === "pending" && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateOrderStatus(order._id, "confirmed")
                        }
                      >
                        Confirm
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(order._id, "ready")}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === "ready" && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          PIN: {order.completionPin}
                        </Badge>
                        <Badge variant="outline">Awaiting customer</Badge>
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
