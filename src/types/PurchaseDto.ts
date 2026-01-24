export interface AddCartItemDto {
    productSku?: string;
    quantity: number;
    components?: Record<string, string>;
}

export interface UpdatePurchaseDto {
    status?: string;
    pickupDate?: string;
}