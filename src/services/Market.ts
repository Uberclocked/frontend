import { fetchWithAuth } from "@/services/api";
import type {
  PostDataDto,
  PostInterestDto,
  PostResponseDto,
  PostUpdateDataDto,
  UserPublicDto,
  UUID
} from "@/types/Market";

const BASE = "http://localhost:8080";

// PUBLIC

export async function getPostsPublic(): Promise<PostResponseDto[]> {
  const res = await fetch(`${BASE}/posts`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getPostByIdPublic(id: UUID): Promise<PostResponseDto> {
  const res = await fetch(`${BASE}/posts/${id}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// AUTHENTICATED

export async function getPosts(token: string): Promise<PostResponseDto[]> {
  return fetchWithAuth<PostResponseDto[]>(`${BASE}/posts`, token);
}

export async function getPostById(
  token: string,
  id: UUID
): Promise<PostResponseDto> {
  return fetchWithAuth<PostResponseDto>(`${BASE}/posts/${id}`, token);
}

export async function createPost(
  token: string,
  dto: PostDataDto,
  image: File | null
): Promise<PostResponseDto> {
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
}

export async function getMyPosts(token: string): Promise<PostResponseDto[]> {
  return fetchWithAuth<PostResponseDto[]>(`${BASE}/posts/me`, token);
}

export async function updatePost(
  token: string,
  id: UUID,
  dto: PostUpdateDataDto
): Promise<PostResponseDto> {
  return fetchWithAuth<PostResponseDto>(
    `${BASE}/posts/${id}`,
    token,
    {
      method: "PATCH",
      body: JSON.stringify(dto),
    }
  );
}

export async function deletePost(token: string, id: UUID): Promise<void> {
  return fetchWithAuth<void>(
    `${BASE}/posts/${id}`,
    token,
    { method: "DELETE" }
  );
}

export async function markAsSold(token: string, id: UUID): Promise<void> {
  return fetchWithAuth<void>(
    `${BASE}/posts/${id}/sold`,
    token,
    { method: "POST" }
  );
}

export async function markInterest(
  token: string,
  postId: UUID
): Promise<void> {
  return fetchWithAuth<void>(
    `${BASE}/posts/${postId}/interest`,
    token,
    { method: "POST" }
  );
}

export async function getInterested(
  token: string,
  postId: UUID
): Promise<PostInterestDto[]> {
  return fetchWithAuth<PostInterestDto[]>(
    `${BASE}/posts/${postId}/interested`,
    token
  );
}

export async function purchaseInterestedInfo(
  token: string,
  postId: UUID,
  interestedUserId: UUID
): Promise<UserPublicDto> {
  return fetchWithAuth<UserPublicDto>(
    `${BASE}/posts/${postId}/interested/${interestedUserId}/purchase`,
    token,
    { method: "POST" }
  );
}

export async function getInterestedInfo(
  token: string,
  postId: UUID,
  interestedUserId: UUID
): Promise<UserPublicDto> {
  return fetchWithAuth<UserPublicDto>(
    `${BASE}/posts/${postId}/interested/${interestedUserId}`,
    token
  );
}

export async function hasMyInterest(token: string, postId: string) {
  const res = await fetch(`${BASE}/posts/${postId}/interest/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Could not check interest");
  return (await res.json()) as boolean;
}

export async function getAllPostsAdmin(
  token: string
): Promise<PostResponseDto[]> {
  return fetchWithAuth<PostResponseDto[]>(
    `${BASE}/posts/admin/all`,
    token
  );
}

