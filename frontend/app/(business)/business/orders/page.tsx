"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedOrder, setSelectedOrder] = useState<Reservation | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

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

      // If the order was completed and we got a pin, show the dialog
      if (newStatus === "completed" && updatedOrder.completionPin) {
        setSelectedOrder(updatedOrder);
        setShowPinDialog(true);
      }

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
                <TableRow key={order._id}>
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
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateOrderStatus(order._id, "completed")
                        }
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Completion PIN</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center mb-4">
              Share this PIN with the customer to complete their order:
            </p>
            <div className="text-4xl font-mono text-center bg-secondary p-4 rounded-lg">
              {selectedOrder?.completionPin}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              The customer will need to enter this PIN to mark their order as
              collected.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
