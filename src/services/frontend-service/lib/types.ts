type Item = {
  id: string;
  name: string;
  shop: string;
  type: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  distance: number;
  rating: number;
  availableUntil: string; // comes from item.inventory.expirationDate
  quantity: number; // comes from item.inventory.quantity
};
