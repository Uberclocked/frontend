import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostResponseDto, UUID } from "@/types/Market";
import {Link} from "react-router-dom";


function toImgSrc(image: string | null) {
  if (!image) return null;
  if (image.startsWith("data:")) return image;
  return `data:image/jpeg;base64,${image}`;
}

function statusBadgeClass(status: string) {
  if (status === "ACTIVE") return "text-white text-base px-3 py-1";
  return "text-sm px-3 py-1";
}

const card = "rounded-2xl border p-6";

function MyPostCard({ post, busyId, markSold, remove }: { post: PostResponseDto, busyId: UUID | null, markSold: (id: UUID) => void, remove: (id: UUID) => void }) {
  const imgSrc = toImgSrc(post.image);

  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {imgSrc ? (
            <img src={imgSrc} alt={post.title} className="h-24 w-24 rounded-xl object-cover border" loading="lazy" />
          ) : (
            <div className="h-24 w-24 rounded-xl border flex items-center justify-center">
              <span className="text-xs">No image</span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <p className="font-semibold text-lg">{post.title}</p>
              <Badge className={statusBadgeClass(post.status)}>{post.status}</Badge>
            </div>
            <p className="text-sm opacity-80">
              {post.category} • ${post.price} • <span className="opacity-90">by {post.sellerUserName}</span>
            </p>
            {post.description && (
              <p className="leading-relaxed opacity-90">
                {post.description.slice(0, 180)}
                {post.description.length > 180 ? "..." : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button asChild className="focus-visible:ring-0 focus-visible:ring-offset-0">
            <Link to={`/posts/${post.id}/interested`}>View interested</Link>
          </Button>

          <Button
              onClick={() => markSold(post.id)}
              disabled={busyId === post.id || post.status !== "ACTIVE"}
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {busyId === post.id ? "Saving..." : "Mark as sold"}
          </Button>
          <Button
              variant="destructive"
              onClick={() => remove(post.id)}
              disabled={busyId === post.id}
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {busyId === post.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MyPostCard;
