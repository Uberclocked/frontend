import {fetchWithAuth} from "../services/api.ts";
import type {Cart, CartItem} from "../types/Entities.ts";
import type {AddCartItemDto} from "../types/PurchaseDto.ts";

const BASE = "http://localhost:8080";

export async function getMyCart(token: string): Promise<Cart> {
    return fetchWithAuth(`${BASE}/carts/me`, token);
}

export async function addCartItem(
    token: string,
    dto: AddCartItemDto
): Promise<Cart> {
    return fetchWithAuth(`${BASE}/carts/me/items`, token, {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function updateCartItem(
    token: string,
    itemId: string,
    quantity: number
): Promise<CartItem> {
    return fetchWithAuth(
        `${BASE}/carts/me/items/${itemId}?quantity=${quantity}`,
        token,
        { method: "PATCH" }
    );
}

export async function updateCartComponent(
    token: string,
    itemId: string,
    componentType: string,
    newProductSku: string
): Promise<CartItem> {
    return fetchWithAuth(
        `${BASE}/carts/me/items/${itemId}/components?componentType=${componentType}&newProductSku=${newProductSku}`,
        token,
        { method: "PATCH" }
    );
}

export async function removeCartItem(token: string, itemId: string) {
    return fetchWithAuth(
        `${BASE}/carts/me/items/${itemId}`,
        token,
        { method: "DELETE" }
    );
}

export async function checkout(token: string): Promise<Cart> {
    return fetchWithAuth(`${BASE}/carts/me/checkout`, token, {
        method: "POST",
    });
}
export async function addCustomPcToCart(token: string, components: Record<string, string>, quantity = 1) {
    return fetchWithAuth(`${BASE}/carts/me/items`, token, {
        method: "POST",
        body: JSON.stringify({
            productSku: "",      
            quantity,
            components,
        }),
    });
}

export async function updateCartItemComponent(
    token: string,
    itemId: string,
    componentType: string,
    newProductSku: string
) {
    const qs = new URLSearchParams({ componentType, newProductSku });
    return fetchWithAuth(`${BASE}/carts/me/items/${itemId}/components?${qs.toString()}`, token, {
        method: "PATCH",
    });
}