import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/services/api";
import { marketApi } from "@/services/Market";
import type { PostResponseDto, UUID } from "@/types/Market";
import type { UserDataDto } from "@/types/UserDataDto";

const shell = "min-h-screen bg-gray-950 p-6";
const card = "rounded-2xl bg-gray-900 p-6 border border-gray-800";

function statusBadgeClass(status: string) {
    if (status === "ACTIVE") return "bg-gray-800 text-white text-base px-3 py-1";
    return "bg-gray-800 text-gray-400 text-sm px-3 py-1";
}


export default function PostsFeed() {
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    const [posts, setPosts] = useState<PostResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<UUID | null>(null);
    const [q, setQ] = useState("");

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

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return posts;
        return posts.filter((p) => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(s));
    }, [posts, q]);

    async function load() {
        setLoading(true);
        try {
            if (isAuthenticated) {
                const token = await getAccessTokenSilently();
                setPosts(await marketApi.getPosts(token));
            } else {
                setPosts(await marketApi.getPostsPublic());
            }
        } catch (e: any) {
            alert(e.message ?? "Error loading posts");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    async function onInterested(postId: UUID, isOwner: boolean) {
        if (isOwner) return;

        if (!isAuthenticated) {
            await loginWithRedirect({
                authorizationParams: { redirect_uri: window.location.origin + "/posts" },
            });
            return;
        }

        setBusyId(postId);
        try {
            const token = await getAccessTokenSilently();
            await marketApi.markInterest(token, postId);
        } catch (e: any) {
            alert(e.message ?? "Could not mark interest");
        } finally {
            setBusyId(null);
        }
    }

    if (loading) {
        return (
            <div className={shell + " flex items-center justify-center"}>
                <p className="text-[#F5F5DC]">Loading...</p>
            </div>
        );
    }

    return (
        <div className={shell}>
            <div className="mx-auto max-w-5xl space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#FF8000]">Exchange Area</h1>
                        <p className="text-[#F5F5DC] opacity-80">Active posts from the community.</p>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search..."
                            className="w-full sm:w-80 bg-gray-950 text-[#F5F5DC]
                         border-gray-800 outline-none ring-0
                         focus-visible:ring-0 focus-visible:ring-offset-0"
                        />

                        <Button
                            className="bg-[#FF8000] text-black hover:bg-[#e67300]
                         focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <div className={card}>
                        <p className="text-[#F5F5DC]">No posts found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((p) => {
                            const isOwner = !!myUserId && p.sellerId === myUserId;
                            const img = p.image ? `data:image/jpeg;base64,${p.image}` : "/placeholder.png";
                            return (
                                <div key={p.id} className={card}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={p.title}
                                                    className="h-24 w-24 rounded-xl object-cover border border-gray-800"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 rounded-xl border border-gray-800 bg-gray-950 flex items-center justify-center">
                                                    <span className="text-gray-500 text-xs">No image</span>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[#F5F5DC] font-semibold text-lg">{p.title}</p>
                                                    <Badge className={statusBadgeClass(p.status)}>{p.status}</Badge>
                                                </div>

                                                <p className="text-[#F5F5DC] text-sm opacity-80">
                                                    {p.category} • ${p.price} •{" "}
                                                    <span className="opacity-90">by {p.sellerUserName}</span>
                                                </p>

                                                <p className="text-[#F5F5DC] leading-relaxed opacity-90">
                                                    {p.description?.slice(0, 180)}
                                                    {p.description?.length > 180 ? "..." : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col gap-2">
                                            <Button
                                                asChild
                                                className="bg-[#FF8000] text-black hover:bg-[#e67300]
                                   focus-visible:ring-0 focus-visible:ring-offset-0"
                                            >
                                                <Link to={`/posts/${p.id}`}>Detail</Link>
                                            </Button>

                                            <Button
                                                onClick={() => {
                                                    if (!isAuthenticated) return loginWithRedirect();
                                                    onInterested(p.id, isOwner)}}

                                                disabled={busyId === p.id || p.status !== "ACTIVE" || isOwner}
                                                className="bg-[#FF8000] text-black hover:bg-[#e67300]
                                   disabled:opacity-50
                                   focus-visible:ring-0 focus-visible:ring-offset-0"
                                            >
                                                {isOwner ? "Your post" : busyId === p.id ? "Saving..." : "I'm interested"}
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