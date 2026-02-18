import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApplicablePromotions } from "./useApplicablePromotions";

const toDateOnly = (iso?: string | null) => (iso ? iso.slice(0, 10) : "—");

export default function CouponsPage() {
    const { items, loading, err, reload } = useApplicablePromotions();
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const activeOnly = items.filter((p) => p.active === true);

        const qq = q.trim().toLowerCase();
        if (!qq) return activeOnly;

        return activeOnly.filter((p) => {
            const code = (p.code ?? "").toLowerCase();
            const title = (p.title ?? "").toLowerCase();
            const desc = (p.description ?? "").toLowerCase();
            return code.includes(qq) || title.includes(qq) || desc.includes(qq);
        });
    }, [items, q]);

    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">My Coupons</h1>

                    <Button variant="secondary" className="rounded-xl" onClick={reload}>
                        Refresh
                    </Button>
                </div>

                <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <Input
                        className="md:max-w-md"
                        placeholder="Search by code, title, or description..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <div className="text-sm opacity-80">
                        Total: <span className="font-semibold">{filtered.length}</span>
                    </div>
                </div>

                {err && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {err}
                    </div>
                )}

                <div className="mt-4 overflow-hidden rounded-2xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3">Code</th>
                            <th className="p-3">Discount</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Validity</th>
                            <th className="p-3">Active</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td className="p-4" colSpan={5}>
                                    Loading...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td className="p-4" colSpan={5}>
                                    No coupons found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="p-3 font-semibold">{p.code}</td>
                                    <td className="p-3">{p.discount}%</td>
                                    <td className="p-3">{p.title ?? "—"}</td>
                                    <td className="p-3">
                                        {toDateOnly(p.startDate)} → {toDateOnly(p.endDate)}
                                    </td>
                                    <td className="p-3">{p.active ? "Yes" : "No"}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-xs opacity-70">
                    * These are the “applicable” coupons based on your user and your active cart.
                </div>
            </div>
        </div>
    );
}