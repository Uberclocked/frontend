import type {CartItem} from "@/types/Entities.ts";

export type PurchaseStatus = "CREATED" | "PAID" | "READY" | "DELIVERED" | "CANCELLED";

export type PurchaseResponseDto = {
    id: string;
    status: PurchaseStatus;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    pickupDate: string | null;
    cartId: string;
    items: CartItem[];
};

export type UpdatePurchaseDto = {
    status?: PurchaseStatus | null;
    pickupDate?: string | null;
};

export type AddCartItemDto = {
    productSku?: string | null;
    quantity: number;
    components?: Record<string, string>;
};
