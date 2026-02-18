import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import {Link, useNavigate, useParams} from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { getInterested } from "@/services/Market.ts";
import {createInterestedInfoPreference} from "@/services/mp.ts";
import type { PostInterestDto, UUID } from "@/types/Market.ts";

export default function PostInterestedPage() {
    const { id } = useParams<{ id: string }>();
    const postId = id as UUID;

    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<PostInterestDto[]>([]);
    const [q, setQ] = useState("");

    const navigate = useNavigate();
    const [busyUserId, setBusyUserId] = useState<string | null>(null);

    async function onBuyInfo(userId: UUID) {
        try {
            setBusyUserId(userId);
            const token = await getAccessTokenSilently();

            const { id: preferenceId } = await createInterestedInfoPreference(token, postId, userId);
            navigate(`/checkout/${preferenceId}?mode=interest&postId=${postId}&userId=${userId}`);
        } catch (e: any) {
            alert(e.message ?? "Could not start checkout");
        } finally {
            setBusyUserId(null);
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);
                const token = await getAccessTokenSilently();
                const data = await getInterested(token, postId);
                setItems(data);
            } catch (e: any) {
                alert(e.message ?? "Could not load interested users");
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated, getAccessTokenSilently, postId]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;

        return items.filter((it) =>
            `${it.userName} ${it.userId}`
                .toLowerCase()
                .includes(s)
        );
    }, [items, q]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Button
                    onClick={() =>
                        loginWithRedirect({
                            authorizationParams: { redirect_uri: window.location.origin + "/auth-callback" },
                            appState: { returnTo: `/posts/${postId}/interested` },
                        })
                    }
                >
                    Login to view interested users
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white">

                        <Link to="/posts/me">Back</Link>
                    </Button>

                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search interested..."
                        className="w-full max-w-sm outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <h1 className="text-2xl font-bold">Interested users</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : filtered.length === 0 ? (
                    <Card className="p-6 rounded-2xl">
                        <p>No one interested yet.</p>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {filtered.map((it) => (
                            <Card
                                key={it.id}
                                className="p-4 rounded-2xl flex items-center justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{it.userName}</p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {it.infoPurchased ? (
                                        <span className="font-semibold">Info purchased</span>
                                    ) : (
                                        <>
                                            <span className="opacity-70">Not purchased</span>
                                            <Button
                                                className="h-8"
                                                disabled={busyUserId === it.userId}
                                                onClick={() => onBuyInfo(it.userId)}
                                            >
                                                {busyUserId === it.userId ? "Loading..." : "Buy info"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}