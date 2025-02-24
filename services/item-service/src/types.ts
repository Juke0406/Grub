export interface Variables {
  userId: string;
}

export interface Bindings {
  // Add any bindings here if needed
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_ENDPOINT: string;
  MINIO_BUCKET: string;
}

export interface Env {
  Variables: Variables;
  Bindings: Bindings;
}

export interface Location {
  address: string;
  postal: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ItemImage {
  url: string;
  key: string;
  isPrimary: boolean;
}

export interface Item {
  id?: string;
  category: string;
  brand?: string;
  condition: string;
  age?: number;
  features: string[];
  price?: number;
  description: string;
  images: ItemImage[];
  location: Location;
  createdAt?: Date;
  updatedAt?: Date;
}
