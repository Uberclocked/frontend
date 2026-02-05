import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api";
import { marketApi } from "@/services/Market";
import type { PostResponseDto, UUID } from "@/types/Market";

type UserDataDto = {
  id: UUID;
  userName: string;
  email: string;
  country: string;
  cellPhone: string;
};

const shell = "min-h-screen p-6";
const card = "rounded-2xl p-6 border";

function statusBadgeClass(status: string) {
  if (status === "ACTIVE") return "text-white text-base px-3 py-1";
  return "text-sm px-3 py-1";
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [post, setPost] = useState<PostResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [myUserId, setMyUserId] = useState<UUID | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyUserId(null);
      return;
    }

    async function loadProfile() {
      const token = await getAccessTokenSilently();
      const data = await fetchWithAuth<UserDataDto>("http://localhost:8080/me", token);
      setMyUserId(data.id);
    }

    void loadProfile();
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    async function loadPost() {
      if (!id) return;
      setLoading(true);
      try {
        const token = await getAccessTokenSilently();
        setPost(await marketApi.getPostById(token, id));
      } catch (e: any) {
        alert(e.message ?? "Error loading post");
      } finally {
        setLoading(false);
      }
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    void loadPost();
  }, [isAuthenticated, id, getAccessTokenSilently]);

  const isOwner = useMemo(() => {
    if (!post || !myUserId) return false;
    return post.sellerId === myUserId;
  }, [post, myUserId]);

  const imgSrc = useMemo(() => {
    if (!post?.image) return null;

    if (post.image.startsWith("data:")) return post.image;

    return `data:image/jpeg;base64,${post.image}`;
  }, [post]);

  async function onInterested() {
    if (!id) return;
    if (isOwner) return;

    setBusy(true);
    try {
      const token = await getAccessTokenSilently();
      await marketApi.markInterest(token, id);
      alert("✅ Marked as interested!");
    } catch (e: any) {
      alert(e.message ?? "Could not mark interest");
    } finally {
      setBusy(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={shell + " flex items-center justify-center"}>
        <Button
          onClick={() => loginWithRedirect()}
          className="focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          Login to view post
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={shell + " flex items-center justify-center"}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={shell}>
        <div className="mx-auto max-w-3xl space-y-4">
          <div className={card}>
            <p>Post not found.</p>
          </div>
          <Button
            asChild
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Link to="/posts">Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <Button
            asChild
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Link to="/posts">Back</Link>
          </Button>

          <Badge className={statusBadgeClass(post.status)}>{post.status}</Badge>
        </div>

        <div className={card}>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            {/* Left content */}
            <div className="flex-1 min-w-0 space-y-2">
              <h1 className="text-2xl font-bold">{post.title}</h1>

              <p className="opacity-80">
                {post.category} • ${post.price}
              </p>

              <p className="text-sm opacity-80">
                Posted by <span className="font-semibold">{post.sellerUserName}</span>
              </p>

              <p className="mt-4 whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>

              <div className="pt-4">
                <Button
                  onClick={onInterested}
                  disabled={busy || post.status !== "ACTIVE" || isOwner}
                  className="focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  {isOwner ? "Your post" : busy ? "Saving..." : "I'm interested"}
                </Button>
              </div>
            </div>

            <div className="shrink-0">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={post.title}
                  loading="lazy"
                  className="h-28 w-28 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-28 w-28 rounded-xl border flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
