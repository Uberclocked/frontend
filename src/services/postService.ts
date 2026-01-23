import type { PostDataDto } from "../types/PostDataDto";
import type { PostDto } from "../types/PostDto";
import type { UserPublicDto } from "../types/UserPublicDto";

import { fetchWithAuth } from "./api";

const BASE = "http://localhost:8080/posts";

export const postService = {
    create: (data: PostDataDto, token: string) =>
        fetchWithAuth<PostDto>(BASE, token, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getAll: (): Promise<PostDto[]> =>
        fetch(BASE).then(r => r.json()),

    getMine: (token: string): Promise<PostDto[]> =>
        fetchWithAuth<PostDto[]>(`${BASE}/me`, token),

    update: (id: string, data: PostDataDto, token: string) =>
        fetchWithAuth<PostDto>(`${BASE}/${id}`, token, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: (id: string, token: string) =>
        fetchWithAuth<void>(`${BASE}/${id}`, token, {
            method: "DELETE",
        }),

    markAsSold: (id: string, token: string) =>
        fetchWithAuth<void>(`${BASE}/${id}/sold`, token, {
            method: "POST",
        }),

    markInterest: (id: string, token: string) =>
        fetchWithAuth<void>(`${BASE}/${id}`, token, {
            method: "POST",
        }),

    buySellerInfo: (id: string, token: string): Promise<UserPublicDto> =>
        fetchWithAuth<UserPublicDto>(`${BASE}/${id}/users/me`, token, {
            method: "POST",
        }),
};
