import type { PostResponseDto } from "@/types/Market";

export interface Props {
  post: PostResponseDto,
  imageUrl: string,
  isBusy: boolean,
  isOwner: boolean,
  isInterested: boolean;
  onInterested: (post: PostResponseDto) => {},
}
