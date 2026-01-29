import type {Product} from "../types/Entities.ts";

const BASE = "http://localhost:8080";

export async function getProducts(): Promise<Product[]> {
    return fetch(`${BASE}/products`).then(r => r.json());
}

export async function getFilteredProductsPublic(
    params: Record<string, string>
) {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE}/products/filter?${query}`).then(r => r.json());
}

export async function getProductBySkuPublic(skuPrefix: string): Promise<Product> {
    return fetch(`${BASE}/products/${skuPrefix}`).then(async (r) => {
        if (!r.ok) throw new Error("Failed to load product");
        return r.json();
    });
}

export async function getProductsByComponentPrefix(componentSkuPrefix: string): Promise<Product[]> {
    const url = `${BASE}/products/filter?componentSkuPrefix=${encodeURIComponent(componentSkuPrefix)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

