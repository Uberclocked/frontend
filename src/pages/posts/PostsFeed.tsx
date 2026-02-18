import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";

import PostCard from "@/components/common/post/card/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/services/api";
import { markInterest } from "@/services/Market";
import type { PostResponseDto, UUID } from "@/types/Market";
import type { UserDataDto } from "@/types/UserDataDto";

function PostsFeed() {
  const { posts } = useLoaderData() as { posts: PostResponseDto[] }
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently
  } = useAuth0();
  const [q, setQ] = useState("");
  const [myUserId, setMyUserId] = useState<UUID | null>(null);
  const [busyId, setBusyId] = useState<UUID | null>(null);
  const [interestedIds, setInterestedIds] = useState<Set<UUID>>(new Set());

  async function handleInterest(post: PostResponseDto) {
    if (!isAuthenticated) {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin + "/auth-callback",
        },
        appState: { returnTo: "/posts" },
      });
    }

    if (!myUserId || post.sellerId === myUserId) return;
    if (interestedIds.has(post.id)) return;

    setBusyId(post.id);
    try {
      const token = await getAccessTokenSilently();
      await markInterest(token, post.id);
      setInterestedIds(prev => new Set(prev).add(post.id));
    } catch (e: any) {
      alert(e.message ?? "Could not mark interest");
    } finally {
      setBusyId(null);
    }
  }


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

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(s));
  }, [posts, q]);

  return (
    <div className={"min-h-full min-w-full p-6"}>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exchange Area</h1>
            <p className="opacity-80">Active posts from the community.</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-80 outline-none ring-0
                         focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
                className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => {
                if (!isAuthenticated) return loginWithRedirect();
                window.location.href = "/posts/create";
              }}
            >
              Create
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                No posts found.
              </CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p) => {
              const isOwner = !!myUserId && p.sellerId === myUserId;
              const img = p.image ? `data:image/jpeg;base64,${p.image}` : "/placeholder.png";
              return (
                <PostCard
                  key={p.id}
                  post={p}
                  imageUrl={img}
                  isOwner={isOwner}
                  isBusy={busyId === p.id}
                  isInterested={interestedIds.has(p.id)}
                  onInterested={handleInterest}
                />
              );
            })}
          </div>
        )}
      </div>
    </div >
  );
}

export default PostsFeed;
