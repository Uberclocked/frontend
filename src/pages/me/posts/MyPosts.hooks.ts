import { markAsSold, deletePost, getMyPosts } from "@/services/Market";
import type { PostResponseDto, UUID } from "@/types/Market";
import { useState, useMemo, useEffect } from "react";

export function useMyPosts(getToken: () => Promise<string>) {
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<UUID | null>(null);
  const [posts, setPosts] = useState([] as PostResponseDto[])

  useEffect(() => {
    async function loadPosts() {
      setPosts(await getMyPosts(await getToken()));
    }
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(p => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(s));
  }, [posts, q]);

  async function markSold(id: UUID) {
    setBusyId(id);
    try {
      await markAsSold(await getToken(), id);
      window.location.reload(); // opcional: mejor sería actualizar localmente
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
      await deletePost(await getToken(), id);
      window.location.reload(); // opcional
    } catch (e: any) {
      alert(e.message ?? "Could not delete post");
    } finally {
      setBusyId(null);
    }
  }

  return { filteredPosts, q, setQ, busyId, markSold, remove };
}
