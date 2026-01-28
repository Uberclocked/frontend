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
