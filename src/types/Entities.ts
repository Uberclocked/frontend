export interface Product {
  skuPrefix: string;
  name: string;
  image: string | null;
  price: number;
  stock: number;
  active: boolean;
  component: {
    skuPrefix: string;
    displayName: string;
  };
  attributes: Record<string, string>;
}

export interface CartItem {
  id: string;
  name: string;
  image: string | null;
  stock: number;
  quantity: number;
  totalPrice: number;
  productSku?: string | null;
  productName?: string | null;
  components: Record<string, string>;
}

export interface Cart {
  id: string;
  status: "ACTIVE" | "COMPLETED";
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  status: "CREATED" | "PAID" | "READY" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  pickupDate?: string;
  items: CartItem[];
}
