import type { PostResponseDto } from "@/types/Market";

export interface Props {
  post: PostResponseDto,
  imageUrl: string,
  isBusy: boolean,
  isOwner: boolean,
  onInterested: (post: PostResponseDto) => {},
}
