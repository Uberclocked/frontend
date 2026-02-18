import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PostResponseDto, UUID } from "@/types/Market";
import { Link, useNavigate } from "react-router-dom";

function toImgSrc(image: string | null) {
  if (!image) return null;
  if (image.startsWith("data:")) return image;
  return `data:image/jpeg;base64,${image}`;
}

function statusBadgeClass() {
  return "bg-orange-500 text-white text-base px-3 py-1";
}

const card = "rounded-2xl border p-6 cursor-pointer hover:bg-muted/40 transition";

type Props = {
  post: PostResponseDto;
  busyId: UUID | null;
  markSold: (id: UUID) => void;
  remove: (id: UUID) => void;
};

function MyPostCard({ post, busyId, markSold, remove }: Props) {
  const imgSrc = toImgSrc(post.image);
  const navigate = useNavigate();

  return (
      <div
          className={card}
          onClick={() => navigate(`/posts/${post.id}`)}   // ✅ click card -> detail
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(`/posts/${post.id}`);
          }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            {/* ✅ Imagen que entra completa */}
            {imgSrc ? (
                <div className="h-24 w-24 rounded-xl border bg-white flex items-center justify-center p-2">
                  <img
                      src={imgSrc}
                      alt={post.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                  />
                </div>
            ) : (
                <div className="h-24 w-24 rounded-xl border flex items-center justify-center bg-white">
                  <span className="text-xs opacity-60">No image</span>
                </div>
            )}

            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-lg truncate">{post.title}</p>
                <Badge className={statusBadgeClass()}>{post.status}</Badge>
              </div>

              <p className="text-sm opacity-80">
                {post.category} • ${post.price} •{" "}
                <span className="opacity-90">by {post.sellerUserName}</span>
              </p>

              {post.description && (
                  <p className="leading-relaxed opacity-90">
                    {post.description.slice(0, 180)}
                    {post.description.length > 180 ? "..." : ""}
                  </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0">
              <Link to={`/posts/${post.id}/interested`}>View interested</Link>
            </Button>

            <Button
                onClick={() => markSold(post.id)}
                disabled={busyId === post.id || post.status !== "ACTIVE"}
                className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {busyId === post.id ? "Saving..." : "Mark as sold"}
            </Button>

            <Button
                onClick={() => remove(post.id)}
                disabled={busyId === post.id}
                variant="destructive"
                className="bg-red-500/90 hover:bg-red-600 shadow-sm text-white hover:text-white"            >
              {busyId === post.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
  );
}

export default MyPostCard;