export interface UserRating {
  _id: string;
  userId: string;
  rating: number; // Rating from 0-100
  lastUpdated: string;
}

export const getRatingCategory = (
  rating: number
): {
  label: string;
  color: string;
} => {
  if (rating >= 98) return { label: "Excellent", color: "text-green-500" };
  if (rating >= 90) return { label: "Good", color: "text-blue-500" };
  if (rating >= 80) return { label: "Fair", color: "text-yellow-500" };
  return { label: "Poor", color: "text-red-500" };
};

// Rating deductions for different scenarios
export const RATING_PENALTIES = {
  CANCELLATION: -5,
  NOT_COLLECTED: -10,
} as const;

// Default starting rating for new users
export const DEFAULT_RATING = 100;
