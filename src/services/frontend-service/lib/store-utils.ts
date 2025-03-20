import { BusinessHours, Store, StoreType } from "@/types/store";
import { getDatabase } from "./mongodb";

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: "Monday", open: "09:00", close: "17:00", isOpen: true },
  { day: "Tuesday", open: "09:00", close: "17:00", isOpen: true },
  { day: "Wednesday", open: "09:00", close: "17:00", isOpen: true },
  { day: "Thursday", open: "09:00", close: "17:00", isOpen: true },
  { day: "Friday", open: "09:00", close: "17:00", isOpen: true },
  { day: "Saturday", open: "09:00", close: "17:00", isOpen: true },
  { day: "Sunday", open: "09:00", close: "17:00", isOpen: false },
];

export async function createDefaultStore(
  userId: string
): Promise<Store | null> {
  const db = await getDatabase();

  // Check if store already exists
  const existingStore = await db
    .collection<Store>("stores")
    .findOne({ ownerId: userId });
  if (existingStore && existingStore._id) {
    return { ...existingStore, _id: existingStore._id.toString() };
  }

  // Create default store
  const defaultStore: Omit<Store, "_id"> = {
    ownerId: userId,
    type: StoreType.BAKERY,
    name: "My Store",
    description: "Welcome to my store",
    location: {
      address: "",
    },
    businessHours: DEFAULT_BUSINESS_HOURS,
    contactNumber: "",
    email: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("stores").insertOne(defaultStore);
  return { ...defaultStore, _id: result.insertedId.toString() };
}
