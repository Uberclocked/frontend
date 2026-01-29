import type { ReviewResponseDto, CreateReviewDto, ModifyReviewDataDto, ProductRatingDto } from "../types/Review.ts";

import { fetchWithAuth } from "./api";

const BASE = "http://localhost:8080";

export async function getReviewsByProduct(skuPrefix: string): Promise<ReviewResponseDto[]> {
    const res = await fetch(`${BASE}/reviews/product/${skuPrefix}`);
    if (!res.ok) throw new Error("Failed to load reviews");
    return res.json();
}

export async function getProductRating(skuPrefix: string): Promise<ProductRatingDto> {
    const res = await fetch(`${BASE}/reviews/product/${skuPrefix}/rating`);
    if (!res.ok) throw new Error("Failed to load rating");
    return res.json();
}

export async function createReview(token: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    return fetchWithAuth(`${BASE}/reviews`, token, {
        method: "POST",
        body: JSON.stringify(dto),
    });
}

export async function updateReview(token: string, id: string, dto: ModifyReviewDataDto): Promise<ReviewResponseDto> {
    return fetchWithAuth(`${BASE}/reviews/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(dto),
    });
}

export async function deleteReview(token: string, id: string) {
    return fetchWithAuth(`${BASE}/reviews/${id}`, token, { method: "DELETE" });
}

export async function getMyReviews(token: string): Promise<ReviewResponseDto[]> {
    return fetchWithAuth(`${BASE}/reviews/me`, token, { method: "GET" });
}

export async function getAllReviews(token: string, skuPrefix?: string): Promise<ReviewResponseDto[]> {
    const qs = skuPrefix && skuPrefix.trim() ? `?skuPrefix=${encodeURIComponent(skuPrefix.trim())}` : "";
    return fetchWithAuth(`${BASE}/reviews${qs}`, token, { method: "GET" });
}
