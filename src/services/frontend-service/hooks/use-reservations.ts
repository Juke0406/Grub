import { Reservation } from "@/types/reservation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UseReservationsOptions {
  status?: string;
  limit?: number;
  page?: number;
}

export function useReservations({
  status,
  limit = 10,
  page = 1,
}: UseReservationsOptions = {}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("status", status);
        queryParams.append("limit", limit.toString());
        queryParams.append("page", page.toString());

        const response = await fetch(
          `/api/reservation?${queryParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch reservations: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Reservation data:", data);
        setReservations(data.reservations);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch reservations"
        );
        toast.error("Failed to load reservations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [status, limit, page]);

  return { reservations, isLoading, error, pagination };
}
