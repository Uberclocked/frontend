import { useAuth0 } from "@auth0/auth0-react";
import { useMemo, useState } from "react";

import { useMyPurchases } from "./MyPurchases.hooks";
import MyPurchaseCard from "@/components/common/purchases/card/MyPurchaseCard";
import type { PurchaseStatus } from "@/types/PurchaseDto.ts";

export default function MyPurchasesPage() {
    const { getAccessTokenSilently } = useAuth0();
    const { purchases, loading } = useMyPurchases(getAccessTokenSilently);

    const STATUSES: PurchaseStatus[] = ["PAID", "READY", "DELIVERED", "CANCELLED"];
    const [filter, setFilter] = useState<PurchaseStatus | "ALL">("ALL");

    const filtered = useMemo(() => {
        const base = purchases ?? [];
        if (filter === "ALL") return base.filter((p) => p.status !== "CANCELLED");
        return base.filter((p) => p.status === filter);
    }, [purchases, filter]);

    if (loading) {
        return (
            <div className="min-w-screen flex items-center justify-center p-6">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-w-screen p-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold mb-6 text-center">My Purchases</h1>

                {/* Filter + count (same as admin style) */}
                <div className="mb-4 flex items-center justify-between gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as PurchaseStatus | "ALL")}
                        className="rounded-xl border border-orange-300 bg-gray-100/75 px-3 py-2 text-sm focus:outline-none focus:ring-0"
                    >
                        <option value="ALL">All (no cancelled)</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <p className="text-sm opacity-70">
                        Showing <span className="font-semibold">{filtered.length}</span>
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <p>No purchases</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filtered.map((p) => (
                            <MyPurchaseCard key={p.id} purchase={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
