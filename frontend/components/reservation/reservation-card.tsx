import { Reservation, STATUS_BADGES } from "@/types/reservation";
import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Timer,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function ReservationCard({
  reservation,
  onDelete,
}: {
  reservation: Reservation;
  onDelete: (id: string) => void;
}) {
  const pickupDate = new Date(reservation.pickupTime);
  const endPickupDate = new Date(reservation.pickupEndTime);
  const status = STATUS_BADGES[reservation.status];

  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/reservation/${reservation._id}`, {
        method: "DELETE",
      });
      console.log(reservation._id);
      setSuccess(true);
      onDelete(reservation._id);
      setTimeout(() => {
        setCancelOpen(false);
        // Optional: Trigger a re-fetch or state update in parent to remove the card
      }, 1500);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <div className="relative h-48 bg-gray-100">
          {reservation.storeImage ? (
            <Image
              src={reservation.storeImage}
              alt={reservation.storeName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{reservation.storeName}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{reservation.storeLocation}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Navigation className="w-4 h-4" />
                  <span>{(Math.random() * 3 + 0.5).toFixed(1)} km</span>
                </div>
              </div>
            </div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>

          <div className="space-y-2 flex-1">
            {reservation.items.map((item, index) => {
              const discountedPrice =
                item.originalPrice * (1 - item.discountPercentage / 100);
              return (
                <div
                  key={index}
                  className="flex justify-between items-start text-sm"
                >
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p>
                        {item.name} × {item.quantity}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Original: ${item.originalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">${discountedPrice.toFixed(2)}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t space-y-2 mt-4">
            <div className="flex items-center text-sm gap-1">
              <Timer className="w-4 h-4" />
              <span>
                Pickup:{" "}
                {pickupDate.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}{" "}
                -{" "}
                {endPickupDate.toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
            </div>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>
                Total Savings: $
                {reservation.items
                  .reduce(
                    (total, item) =>
                      total +
                      item.originalPrice *
                        (item.discountPercentage / 100) *
                        item.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4">
            <Button className="flex-1 min-w-[180px]">Get Directions</Button>
            {reservation.status === "ready" && (
              <Button
                variant="default"
                className="flex-1 min-w-[180px]"
                onClick={() => setCompleteOpen(true)}
              >
                Complete Order
              </Button>
            )}
            {reservation.status === "pending" && (
              <Button
                variant="outline"
                className="flex-1 min-w-[180px] hover:bg-red-50 hover:text-red-500"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Reservation
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Modal */}
      {/* Cancel Modal */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Confirm Cancellation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Are you sure you want to cancel this reservation?</p>
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-800">
              Cancelling too many reservations may negatively affect your rating
              and lower your future priority for securing reservations.
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setCancelOpen(false)}
              disabled={isLoading}
            >
              Keep Reservation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading || success}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : success ? (
                "Cancelled"
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Modal */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Completion PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter the completion PIN provided by the store owner to
              confirm your order collection.
            </p>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => {
                setError("");
                setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
              }}
              className="w-full px-4 py-2 text-xl tracking-widest font-mono text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCompleteOpen(false);
                setPin("");
                setError("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (pin.length !== 6) {
                  setError("Please enter a 6-digit PIN");
                  return;
                }
                setIsLoading(true);
                try {
                  const response = await fetch(
                    `/api/reservation/${reservation._id}/complete`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ pin }),
                    }
                  );

                  if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to complete order");
                  }

                  setSuccess(true);
                  onDelete(reservation._id); // Trigger refetch of reservations
                  setTimeout(() => {
                    setCompleteOpen(false);
                    setPin("");
                  }, 1500);
                } catch (error: any) {
                  console.error("Error completing order:", error);
                  setError(error.message || "Invalid PIN");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || success || pin.length !== 6}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : success ? (
                "Order Completed!"
              ) : (
                "Complete Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
