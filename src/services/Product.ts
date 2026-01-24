import type {Product} from "../types/Entities.ts";

const BASE = "http://localhost:8080";

export async function getProducts(): Promise<Product[]> {
    return fetch(`${BASE}/products`).then(r => r.json());
}

export async function filterProducts(params: URLSearchParams): Promise<Product[]> {
    return fetch(`${BASE}/products/filter?${params}`).then(r => r.json());
}
