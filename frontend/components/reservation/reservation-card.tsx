import { Reservation } from "@/types/reservation";
import { STATUS_BADGES } from "@/types/reservation";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MapPin, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

export function ReservationCard({ reservation, onDelete }: { reservation: Reservation; onDelete: (id:string) => void }) {
  const pickupDate = new Date(reservation.pickupTime);
  const endPickupDate = new Date(reservation.pickupEndTime);
  const status = STATUS_BADGES[reservation.status];

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/reservation/${reservation._id}`, {
        method: "DELETE",
      });
      console.log(reservation._id)
      setSuccess(true);
      onDelete(reservation._id);
      setTimeout(() => {
        setOpen(false); 
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
      <Card className="p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{reservation.storeName}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {reservation.storeLocation}
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
                <div>
                  <p>
                    {item.name} × {item.quantity}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Original: ${item.originalPrice.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium">${discountedPrice.toFixed(2)}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-2 mt-4">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              Pickup: {pickupDate.toLocaleTimeString()} -{" "}
              {endPickupDate.toLocaleTimeString()}
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
          <Button
            variant="outline"
            className="flex-1 min-w-[180px] hover:bg-red-50 hover:text-red-500"
            onClick={() => setOpen(true)}
          >
            Cancel Reservation
          </Button>
        </div>
      </Card>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Confirm Cancellation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Are you sure you want to cancel this reservation?
            </p>
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-800">
              Cancelling too many reservations may negatively affect your rating
              and lower your future priority for securing reservations.
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
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
    </>
  );
}
