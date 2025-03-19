export enum StoreType {
  BAKERY = "BAKERY",
  SUPERMARKET = "SUPERMARKET",
}

export type BusinessHours = {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open: string;
  close: string;
  isOpen: boolean;
};

export type Store = {
  _id?: string | null;
  type: StoreType;
  ownerId: string;
  name: string;
  description?: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  businessHours: BusinessHours[];
  contactNumber?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StoreFormData = Omit<
  Store,
  "_id" | "ownerId" | "createdAt" | "updatedAt"
>;
