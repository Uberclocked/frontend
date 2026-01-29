import { fetchWithAuth } from "@/services/api";
import type {PostDataDto, PostInterestDto, PostResponseDto, UserPublicDto, UUID} from "@/types/Market";

const BASE = "http://localhost:8080";

export const marketApi = {

    async getPostsPublic(): Promise<PostResponseDto[]> {
        const res = await fetch(`${BASE}/posts`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    },

    async getPostByIdPublic(id: UUID): Promise<PostResponseDto> {
        const res = await fetch(`${BASE}/posts/${id}`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    },

    getPosts(token: string): Promise<PostResponseDto[]> {
        return fetchWithAuth<PostResponseDto[]>(`${BASE}/posts`, token);
    },

    getPostById(token: string, id: UUID): Promise<PostResponseDto> {
        return fetchWithAuth<PostResponseDto>(`${BASE}/posts/${id}`, token);
    },

    async createPost(token: string, dto: PostDataDto, image: File | null): Promise<PostResponseDto> {
        const fd = new FormData();

        fd.append(
            "data",
            new Blob([JSON.stringify(dto)], { type: "application/json" })
        );

        if (image) fd.append("image", image);

        const res = await fetch(`${BASE}/posts`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: fd,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `API error ${res.status}`);
        }

        return res.json();
    },

    getMyPosts(token: string): Promise<PostResponseDto[]> {
        return fetchWithAuth<PostResponseDto[]>(`${BASE}/posts/me`, token);
    },

    updatePost(token: string, id: UUID, dto: PostDataDto): Promise<PostResponseDto> {
        return fetchWithAuth<PostResponseDto>(`${BASE}/posts/${id}`, token, {
            method: "PATCH",
            body: JSON.stringify(dto),
        });
    },

    deletePost(token: string, id: UUID): Promise<void> {
        return fetchWithAuth<void>(`${BASE}/posts/${id}`, token, { method: "DELETE" });
    },

    markAsSold(token: string, id: UUID): Promise<void> {
        return fetchWithAuth<void>(`${BASE}/posts/${id}/sold`, token, { method: "POST" });
    },

    markInterest(token: string, postId: UUID): Promise<void> {
        return fetchWithAuth<void>(`${BASE}/posts/${postId}/interest`, token, { method: "POST" });
    },

    getInterested(token: string, postId: UUID): Promise<PostInterestDto[]> {
        return fetchWithAuth<PostInterestDto[]>(`${BASE}/posts/${postId}/interested`, token);
    },

    purchaseInterestedInfo(token: string, postId: UUID, interestedUserId: UUID): Promise<UserPublicDto> {
        return fetchWithAuth<UserPublicDto>(
            `${BASE}/posts/${postId}/interested/${interestedUserId}/purchase`,
            token,
            { method: "POST" }
        );
    },

    getInterestedInfo(token: string, postId: UUID, interestedUserId: UUID): Promise<UserPublicDto> {
        return fetchWithAuth<UserPublicDto>(`${BASE}/posts/${postId}/interested/${interestedUserId}`, token);
    },

    getAllPostsAdmin(token: string): Promise<PostResponseDto[]> {
        return fetchWithAuth<PostResponseDto[]>(`${BASE}/posts/admin/all`, token);
    }
};