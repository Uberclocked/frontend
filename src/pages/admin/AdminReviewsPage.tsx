import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductBySkuPublic } from "@/services/Product";
import { deleteReview, getAllReviews } from "@/services/Review";
import type { Product } from "@/types/Entities";
import type { ReviewResponseDto } from "@/types/Review";

export default function AdminReviewsPage() {
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();

    const roles: string[] = user?.["https://uberclocked.com/roles"] ?? [];
    const isAdmin = roles.includes("ADMIN") || roles.includes("Admin");

    const [items, setItems] = useState<ReviewResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    const [skuFilter, setSkuFilter] = useState("");
    const [appliedFilter, setAppliedFilter] = useState<string>("");

    const [productsBySku, setProductsBySku] = useState<Record<string, Product | null>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function load(filter?: string) {
        setLoading(true);
        try {
            if (!isAuthenticated) return;
            const token = await getAccessTokenSilently();
            const data = await getAllReviews(token, filter);
            setItems(Array.isArray(data) ? data : []);
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
            return;
        }
        load("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isAdmin]);

    useEffect(() => {
        if (items.length === 0) return;

        const skus = Array.from(new Set(items.map((r) => r.skuPrefix))).filter(
            (sku) => !(sku in productsBySku)
        );

        if (skus.length === 0) return;

        let cancelled = false;

        (async () => {
            const results = await Promise.allSettled(skus.map((sku) => getProductBySkuPublic(sku)));
            if (cancelled) return;

            setProductsBySku((prev) => {
                const next = { ...prev };
                results.forEach((res, idx) => {
                    const sku = skus[idx];
                    next[sku] = res.status === "fulfilled" ? res.value : null;
                });
                return next;
            });
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const sortedItems = useMemo(() => {
        const safe = Array.isArray(items) ? items : [];
        return [...safe].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [items]);

    async function applyFilter() {
        const f = skuFilter.trim();
        setAppliedFilter(f);
        await load(f);
    }

    async function clearFilter() {
        setSkuFilter("");
        setAppliedFilter("");
        await load("");
    }

    async function quickFilter(skuPrefix: string) {
        setSkuFilter(skuPrefix);
        setAppliedFilter(skuPrefix);
        await load(skuPrefix);
    }

    async function remove(reviewId: string) {
        const ok = confirm("Are you sure you want to delete this review?");
        if (!ok) return;

        try {
            setDeletingId(reviewId);
            const token = await getAccessTokenSilently();
            await deleteReview(token, reviewId);

            await load(appliedFilter);
        } finally {
            setDeletingId(null);
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
                <Button
                    onClick={() => loginWithRedirect()}
                    className="bg-[#FF8000] text-black hover:bg-[#e67300]"
                >
                    Login
                </Button>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
                <p className="text-gray-200">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <div className="mx-auto max-w-6xl space-y-4">
                <h1 className="text-3xl font-bold text-[#FF8000]">All Product Reviews (Admin)</h1>

                <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="flex-1">
                        <Input
                            value={skuFilter}
                            onChange={(e) => setSkuFilter(e.target.value)}
                            className="bg-gray-950 text-gray-100 border-gray-800"
                            placeholder="Filter by product SKU prefix (e.g. ABC123)"
                        />
                        {appliedFilter ? (
                            <p className="mt-2 text-sm text-gray-400">
                                Filter applied: <span className="text-gray-200 font-semibold">{appliedFilter}</span>
                            </p>
                        ) : (
                            <p className="mt-2 text-sm text-gray-500">No filter applied</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="bg-[#FF8000] text-[#F5F5DC] hover:bg-[#e67300]"
                            onClick={applyFilter}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Filter"}
                        </Button>

                        <Button
                            className="bg-[#FF8000] text-[#F5F5DC] hover:bg-[#e67300]"
                            onClick={clearFilter}
                            disabled={loading}
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <p className="text-gray-200">Loading reviews...</p>
                    </div>
                ) : sortedItems.length === 0 ? (
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <p className="text-gray-300">No reviews found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedItems.map((r) => {
                            const product = productsBySku[r.skuPrefix] ?? null;
                            const imageSrc = product?.image ? `data:image/jpeg;base64,${product.image}` : "/placeholder.png";

                            return (
                                <div key={r.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-28 shrink-0">
                                                <div className="rounded-2xl bg-white p-2">
                                                    <img
                                                        src={imageSrc}
                                                        alt={product?.name ?? r.skuPrefix}
                                                        className="h-20 w-full object-contain"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => quickFilter(r.skuPrefix)}
                                                    className="mt-2 text-xs text-[#F5F5DC] underline hover:text-red-500"
                                                    title="Filter by this product"
                                                >
                                                    {r.skuPrefix}
                                                </button>
                                            </div>

                                            <div>
                                                <p className="text-[#F5F5DC] font-semibold">{product?.name ?? "Product"}</p>

                                                <p className="text-gray-400 text-sm">
                                                    {new Date(r.createdAt).toLocaleString()} • by{" "}
                                                    <span className="text-gray-200 font-medium">{r.userName}</span>
                                                </p>

                                                <div className="mt-2 text-[#FF8000] font-bold">
                                                    {"★".repeat(r.qualification)}
                                                    <span className="text-[#F5F5DC] font-normal"> {"☆".repeat(5 - r.qualification)}</span>
                                                </div>

                                                {r.message && (
                                                    <p className="mt-3 text-[#F5F5DC] leading-relaxed">“{r.message}”</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="destructive"
                                                className="text-[#F5F5DC]"
                                                onClick={() => remove(r.id)}
                                                disabled={deletingId === r.id}
                                            >
                                                {deletingId === r.id ? "Deleting..." : "Delete"}
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
