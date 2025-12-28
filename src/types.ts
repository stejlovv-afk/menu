export type CategoryId = 'coffee' | 'tea' | 'punsh' | 'seasonal' | 'ice' | 'food' | 'drinks';

export interface ProductSize {
  [ml: number]: number; // e.g., 250: 190
}

export interface Product {
  id: number;
  cat: CategoryId;
  name: string;
  img: string;
  price?: number;
  sizes?: ProductSize;
  noMilk?: boolean;
  noSyrup?: boolean;
  isBumble?: boolean;
}

export interface CartItem {
  id: string; // Unique ID for cart entry (uuid)
  productId: number;
  name: string; // Full constructed name
  basePrice: number;
  totalPrice: number;
  description: string;
  originalProduct: Product; // Keep reference for "Repeat Order" logic
}

export interface SelectionState {
  size: { ml: string; price: number } | null;
  milk: string | null;
  syrup: string | null;
  temp: 'Теплый' | 'Холодный' | null;
  sugar: string | null;
  cinnamon: boolean;
  juice: string | null;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
}

export interface Review {
  id: string;
  productId: number;
  rating: number; // 1-5
  text: string;
  userName: string;
  date: string;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  address: string;
}
