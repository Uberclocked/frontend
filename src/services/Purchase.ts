import { fetchWithAuth } from "../services/api.ts";
import type { PurchaseResponseDto, UpdatePurchaseDto } from "../types/PurchaseDto.ts";

const BASE = "http://localhost:8080";

export async function createPurchase(token: string): Promise<PurchaseResponseDto> {
    return fetchWithAuth(`${BASE}/purchases/me`, token, { method: "POST" });
}

export async function getMyPurchases(token: string): Promise<PurchaseResponseDto[]> {
    return fetchWithAuth(`${BASE}/purchases/me`, token);
}

export async function getAllPurchases(token: string): Promise<PurchaseResponseDto[]> {
    return fetchWithAuth(`${BASE}/purchases`, token);
}

export async function updatePurchase(
    token: string,
    id: string,
    dto: UpdatePurchaseDto
): Promise<PurchaseResponseDto> {
    return fetchWithAuth(`${BASE}/purchases/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(dto),
    });
}

export async function deletePurchase(token: string, id: string) {
    return fetchWithAuth(`${BASE}/purchases/${id}`, token, { method: "DELETE" });
}