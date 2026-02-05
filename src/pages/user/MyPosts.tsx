import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { marketApi } from "@/services/Market";
import type { PostResponseDto, UUID } from "@/types/Market";

const shell = "min-h-screen p-6";
const card = "rounded-2xl border p-6";

function statusBadgeClass(status: string) {
  if (status === "ACTIVE") return "text-white text-base px-3 py-1";
  return "text-sm px-3 py-1";
}

function toImgSrc(image: string | null) {
  if (!image) return null;
  if (image.startsWith("data:")) return image;
  return `data:image/jpeg;base64,${image}`;
}

export default function MyPosts() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<UUID | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(s));
  }, [posts, q]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently();
      const data = await marketApi.getMyPosts(token);
      setPosts(data);
    } catch (e: any) {
      setError(e.message ?? "Error loading your posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function markSold(id: UUID) {
    setBusyId(id);
    try {
      const token = await getAccessTokenSilently();
      await marketApi.markAsSold(token, id);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "SOLD" } : p)));
      window.location.reload();
    } catch (e: any) {
      alert(e.message ?? "Could not mark as sold");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: UUID) {
    const ok = confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    setBusyId(id);
    try {
      const token = await getAccessTokenSilently();
      await marketApi.deletePost(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      window.location.reload();
    } catch (e: any) {
      alert(e.message ?? "Could not delete post");
    } finally {
      setBusyId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={shell + " flex items-center justify-center"}>
        <Button onClick={() => loginWithRedirect()}>
          Login to see your posts
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

  return (
    <div className={shell}>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My posts</h1>
            <p className="opacity-80">Manage your publications.</p>
          </div>

          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-80 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {error && (
          <div className={card}>
            <p>{error}</p>
          </div>
        )}

        {!error && filtered.length === 0 ? (
          <div className={card}>
            <p>You don't have posts yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p) => {
              const imgSrc = toImgSrc(p.image);

              return (
                <div key={p.id} className={card}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={p.title}
                          className="h-24 w-24 rounded-xl object-cover border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-xl border flex items-center justify-center">
                          <span className="text-xs">No image</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-lg">{p.title}</p>
                          <Badge className={statusBadgeClass(p.status)}>{p.status}</Badge>
                        </div>

                        <p className="text-sm opacity-80">
                          {p.category} • ${p.price} • <span className="opacity-90">by {p.sellerUserName}</span>
                        </p>

                        {p.description && (
                          <p className="leading-relaxed opacity-90">
                            {p.description.slice(0, 180)}
                            {p.description.length > 180 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        onClick={() => markSold(p.id)}
                        disabled={busyId === p.id || p.status !== "ACTIVE"}
                        className="focus-visible:ring-0 focus-visible:ring-offset-0"
                      >
                        {busyId === p.id ? "Saving..." : "Mark as sold"}
                      </Button>

                      <Button
                        variant="destructive"
                        className="focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={() => remove(p.id)}
                        disabled={busyId === p.id}
                      >
                        {busyId === p.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
