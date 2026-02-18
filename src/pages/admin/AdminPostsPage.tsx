import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostResponseDto, UUID } from "@/types/Market";
import { getAllPostsAdmin, deletePost } from "@/services/Market";

const shell = "min-h-screen p-6";
const card = "rounded-2xl border p-6";

function statusBadgeClass() {
  return "bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm";
}

function toImgSrc(image: string | null) {
  if (!image) return null;
  if (image.startsWith("data:")) return image;
  return `data:image/jpeg;base64,${image}`;
}

export default function AdminPostsPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();

  const roles: string[] = user?.["https://uberclocked.com/roles"] || [];
  const isAdmin = roles.includes("ADMIN") || roles.includes("Admin");

  const [posts, setPosts] = useState<PostResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<UUID | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "ACTIVE" | "SOLD" | "DELETED">("ALL");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return posts.filter((p) => {
      const matchesText =
        !s ||
        `${p.title} ${p.category} ${p.description} ${p.sellerUserName}`
          .toLowerCase()
          .includes(s);

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [posts, q, statusFilter]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently();
      const data = await getAllPostsAdmin(token);
      setPosts(data);
    } catch (e: any) {
      setError(e.message ?? "Error loading posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      setError("Forbidden: admin only");
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  async function remove(id: UUID) {
    const ok = confirm("Delete this post? (will set status to DELETED)");
    if (!ok) return;

    setBusyId(id);
    try {
      const token = await getAccessTokenSilently();
      await deletePost(token, id);
      window.location.reload(); // ✅ refresh literal
    } catch (e: any) {
      alert(e.message ?? "Could not delete post");
    } finally {
      setBusyId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={shell + " flex items-center justify-center"}>
        <Button
          onClick={() => loginWithRedirect()}
        >
          Login as admin
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
            <h1 className="text-3xl font-bold">Admin • All posts</h1>
            <p className="opacity-80">View and delete any publication.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (title, category, seller)..."
              className="w-full sm:w-80 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-40 border rounded-md px-3 py-2
                         focus:outline-none focus:ring-0"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SOLD">SOLD</option>
              <option value="DELETED">DELETED</option>
            </select>
          </div>
        </div>

        {error && (
          <div className={card}>
            <p>{error}</p>
          </div>
        )}

        {!error && filtered.length === 0 ? (
          <div className={card}>
            <p>No posts found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p) => {
              const imgSrc = toImgSrc(p.image);

              return (
                <div key={p.id} className={card}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 rounded-xl border bg-white flex items-center justify-center p-2">
                        {imgSrc ? (
                            <img
                                src={imgSrc}
                                alt={p.title}
                                loading="lazy"
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <span className="text-xs opacity-60">No image</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-lg">{p.title}</p>
                          <Badge className={statusBadgeClass(p.status)}>{p.status}</Badge>
                        </div>

                        <p className="text-sm opacity-80">
                          {p.category} • ${p.price} •{" "}
                          <span className="opacity-90">by {p.sellerUserName}</span>
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
                          variant="destructive"
                          className="bg-red-500/90 hover:bg-red-600 shadow-sm text-white hover:text-white"
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
