export type UUID = string;

export type PostStatus = "ACTIVE" | "SOLD" | "DELETED";

export type PostUpdateDataDto = {
  title: string;
  description: string;
  price: number;
  category: string;
};

export interface PostDataDto {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
}

export interface PostResponseDto {
  id: UUID;
  title: string;
  image: string | null;
  description: string;
  price: number;
  category: string;
  status: PostStatus;
  createdAt: string;
  sellerId: UUID;
  sellerUserName: string;
}

export interface PostInterestDto {
  id: UUID;
  userId: UUID;
  userName: string;
  infoPurchased: boolean;
}

export interface UserPublicDto {
  id: UUID;
  email: string;
  cellPhone: string;
  userName: string;
}
