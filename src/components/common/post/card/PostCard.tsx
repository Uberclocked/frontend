import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Props } from "./PostCard.types";


const card = "rounded-2xl p-6 border";

function statusBadgeClass() {
  return "bg-orange-500 text-white text-base px-3 py-1";

}

function PostCard({ post, imageUrl, isOwner, isBusy, isInterested, onInterested }: Props) {
  const disabled = isOwner || isBusy || isInterested || post.status !== "ACTIVE";

  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {imageUrl ? (
              <div className="h-24 w-24 rounded-xl border bg-white flex items-center justify-center p-2">
                <img
                    src={imageUrl}
                    alt={post.title}
                    className="max-h-full max-w-full object-contain"
                />
              </div>
          ) : (
              <div className="h-24 w-24 rounded-xl border flex items-center justify-center bg-white">
                <span className="text-xs opacity-60">No image</span>
              </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <p className="font-semibold text-lg">{post.title}</p>
              <Badge className={statusBadgeClass()}>{post.status}</Badge>
            </div>

            <p className="text-sm opacity-80">
              {post.category} • ${post.price} •{" "}
              <span className="opacity-90">by {post.sellerUserName}</span>
            </p>

            <p className="leading-relaxed opacity-90">
              {post.description?.slice(0, 180)}
              {post.description?.length > 180 ? "..." : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Link to={`/posts/${post.id}`}>Detail</Link>
          </Button>

          <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                                  onClick={() => onInterested(post)} disabled={disabled}>
            {isOwner ? "Your post" : isInterested ? "Interested" : isBusy ? "Saving..." : "I'm interested"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PostCard;
