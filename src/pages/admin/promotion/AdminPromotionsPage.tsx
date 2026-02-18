import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    useAdminPromotions,
    type PromotionDto,
    type PromotionTargetBody,
} from "@/pages/admin/promotion/Promotion";

const toDateOnly = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

function isoToday() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function statusOf(
    p: { startDate?: string | null; endDate?: string | null },
    today = isoToday()
) {
    const s = toDateOnly(p.startDate ?? null);
    const e = toDateOnly(p.endDate ?? null);
    if (s && today < s) return "SCHEDULED";
    if (e && today > e) return "EXPIRED";
    return "ACTIVE";
}

const toStartOfDay = (d?: string) => (d ? `${d}T00:00:00` : undefined);
const toEndOfDay = (d?: string) => (d ? `${d}T23:59:59` : undefined);

/** Modal */
function Modal({
                   open,
                   title,
                   onClose,
                   children,
               }: {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <Button variant="secondary" className="rounded-xl" onClick={onClose}>
                        Close
                    </Button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}

/** Form */
type FormTarget = {
    id: number | string; // id temporal para render
    sku: string; // skuPrefix
};

type FormState = {
    code: string;
    discount: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    active: boolean;
    maxUses: string;
    userId: string;
    companyId: string;
    targets: FormTarget[]; // SOLO PRODUCT_SKU
};

const emptyTarget = (): FormTarget => ({
    id: -Date.now(),
    sku: "",
});

function PromotionForm({
                           initial,
                           submitLabel,
                           busy,
                           onSubmit,
                       }: {
    initial: FormState;
    submitLabel: string;
    busy: boolean;
    onSubmit: (v: {
        code: string;
        discount: number;
        title?: string;
        description?: string;
        startDate?: string;
        endDate?: string;
        active: boolean;
        maxUses: number | null;
        userId: string | null;
        companyId: string | null;
        targets: PromotionTargetBody[]; // backend body
    }) => Promise<void>;
}) {
    const [v, setV] = useState<FormState>(initial);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setV(initial);
        setErr(null);
    }, [initial]);

    function normalizeTargets(list: FormTarget[]): PromotionTargetBody[] {
        // ✅ SOLO PRODUCT_SKU INCLUDE
        return list
            .map((t) => (t.sku ?? "").trim())
            .filter(Boolean)
            .map((sku) => ({
                kind: "PRODUCT_SKU",
                mode: "INCLUDE",
                sku,
                componentType: null,
            })) as PromotionTargetBody[];
    }

    return (
        <form
            className="grid grid-cols-1 gap-3"
            onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                try {
                    const code = v.code.trim().toUpperCase();
                    if (!code) throw new Error("Code is required");

                    const discountNum = Number(v.discount);
                    if (!Number.isFinite(discountNum) || discountNum < 1 || discountNum > 100) {
                        throw new Error("Discount must be between 1 and 100");
                    }

                    if (v.startDate && v.endDate && v.endDate < v.startDate) {
                        throw new Error("End date must be after start date");
                    }

                    let maxUsesNum: number | null = null;
                    const maxUsesRaw = v.maxUses.trim();
                    if (maxUsesRaw) {
                        const n = Number(maxUsesRaw);
                        if (!Number.isFinite(n) || n < 1) throw new Error("maxUses must be >= 1");
                        maxUsesNum = Math.floor(n);
                    }

                    const targetsNormalized = normalizeTargets(v.targets);

                    await onSubmit({
                        code,
                        discount: discountNum,
                        title: v.title.trim() || undefined,
                        description: v.description.trim() || undefined,
                        startDate: v.startDate || undefined,
                        endDate: v.endDate || undefined,
                        active: v.active,
                        maxUses: maxUsesNum,
                        userId: v.userId.trim() ? v.userId.trim() : null,
                        companyId: v.companyId.trim() ? v.companyId.trim() : null,
                        targets: targetsNormalized,
                    });
                } catch (e: any) {
                    setErr(String(e?.message ?? e));
                }
            }}
        >
            {/* Code + Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                    Code
                    <input
                        className="mt-1 w-full rounded-xl border p-3"
                        value={v.code}
                        onChange={(e) => setV((x) => ({ ...x, code: e.target.value }))}
                        placeholder="E.g. SUMMER10"
                    />
                </label>

                <label className="text-sm">
                    Discount (%)
                    <Input
                        className="mt-1"
                        placeholder="1 - 100"
                        type="text"
                        inputMode="numeric"
                        value={v.discount}
                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-", ",", "."].includes(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
                            if (val === "") return setV((x) => ({ ...x, discount: "" }));
                            let num = Number(val);
                            if (num > 100) num = 100;
                            if (num < 1) num = 1;
                            setV((x) => ({ ...x, discount: String(num) }));
                        }}
                    />
                </label>
            </div>

            {/* Title / Description */}
            <label className="text-sm">
                Title (optional)
                <input
                    className="mt-1 w-full rounded-xl border p-3"
                    value={v.title}
                    onChange={(e) => setV((x) => ({ ...x, title: e.target.value }))}
                    placeholder="Summer promo"
                />
            </label>

            <label className="text-sm">
                Description (optional)
                <textarea
                    className="mt-1 w-full rounded-xl border p-3"
                    value={v.description}
                    onChange={(e) => setV((x) => ({ ...x, description: e.target.value }))}
                    placeholder="Applies to..."
                    rows={3}
                />
            </label>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                    Start date (optional)
                    <input
                        className="mt-1 w-full rounded-xl border p-3"
                        type="date"
                        value={v.startDate}
                        onChange={(e) => setV((x) => ({ ...x, startDate: e.target.value || "" }))}
                    />
                </label>

                <label className="text-sm">
                    End date (optional)
                    <input
                        className="mt-1 w-full rounded-xl border p-3"
                        type="date"
                        value={v.endDate}
                        onChange={(e) => setV((x) => ({ ...x, endDate: e.target.value || "" }))}
                    />
                </label>
            </div>

            {/* Active + MaxUses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm flex items-center gap-3 mt-2">
                    <input
                        type="checkbox"
                        checked={v.active}
                        onChange={(e) => setV((x) => ({ ...x, active: e.target.checked }))}
                    />
                    Active
                </label>

                <label className="text-sm">
                    Max uses (optional)
                    <Input
                        className="mt-1"
                        placeholder="e.g. 10"
                        type="text"
                        inputMode="numeric"
                        value={v.maxUses}
                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-", ",", "."].includes(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            setV((x) => ({ ...x, maxUses: raw }));
                        }}
                    />
                    <div className="text-xs opacity-70 mt-1">Empty = unlimited uses</div>
                </label>
            </div>

            {/* userId / companyId */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                    userId (optional)
                    <input
                        className="mt-1 w-full rounded-xl border p-3"
                        value={v.userId}
                        onChange={(e) => setV((x) => ({ ...x, userId: e.target.value }))}
                        placeholder="UUID / string"
                    />
                </label>

                <label className="text-sm">
                    companyId (optional)
                    <input
                        className="mt-1 w-full rounded-xl border p-3"
                        value={v.companyId}
                        onChange={(e) => setV((x) => ({ ...x, companyId: e.target.value }))}
                        placeholder="UUID / string"
                    />
                </label>
            </div>

            {/* Targets (Product SKU only) */}
            <div className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="font-semibold">Targets (Product SKU only)</div>
                        <div className="text-xs opacity-70">
                            If empty → applies to all. Escribí el <b>skuPrefix</b> del producto.
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="secondary"
                        className="rounded-xl"
                        onClick={() => setV((x) => ({ ...x, targets: [...x.targets, emptyTarget()] }))}
                    >
                        Add target
                    </Button>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                    {v.targets.length === 0 ? (
                        <div className="text-sm opacity-70">No targets</div>
                    ) : (
                        v.targets.map((t, idx) => (
                            <div key={String(t.id)} className="grid grid-cols-1 gap-2">
                                <label className="text-sm">
                                    Product SKU Prefix
                                    <input
                                        className="mt-1 w-full rounded-xl border p-3"
                                        value={t.sku}
                                        onChange={(e) => {
                                            const sku = e.target.value;
                                            setV((x) => {
                                                const next = [...x.targets];
                                                next[idx] = { ...next[idx], sku };
                                                return { ...x, targets: next };
                                            });
                                        }}
                                        placeholder="e.g. RTX4060, CPU123..."
                                    />
                                </label>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {err && <div className="text-sm text-red-600">{err}</div>}

            <div className="flex justify-end gap-2 pt-2">
                <Button
                    className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white hover:text-white px-6 py-6 text-base font-semibold"
                    disabled={busy}
                    type="submit"
                >
                    {busy ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

/** Page */
export default function AdminPromotionsPage() {
    const { getAccessTokenSilently } = useAuth0();
    const { items, loading, err, create, update, remove } =
        useAdminPromotions(getAccessTokenSilently);

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<PromotionDto | null>(null);
    const [busy, setBusy] = useState(false);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return items;
        return items.filter(
            (p) =>
                p.code.toLowerCase().includes(qq) ||
                (p.title ?? "").toLowerCase().includes(qq) ||
                (p.description ?? "").toLowerCase().includes(qq)
        );
    }, [items, q]);

    const initialForm: FormState = selected
        ? {
            code: selected.code,
            discount: String(selected.discount),
            title: selected.title ?? "",
            description: selected.description ?? "",
            startDate: toDateOnly(selected.startDate),
            endDate: toDateOnly(selected.endDate),
            active: selected.active ?? true,
            maxUses: selected.maxUses != null ? String(selected.maxUses) : "",
            userId: selected.userId ?? "",
            companyId: selected.companyId ?? "",
            targets: (selected.targets ?? []).map((t: any) => ({
                id: t.id ?? -Math.abs(Date.now()),
                sku: t.sku ?? "",
            })),
        }
        : {
            code: "",
            discount: "1",
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            active: true,
            maxUses: "",
            userId: "",
            companyId: "",
            targets: [],
        };

    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-3xl font-bold">Admin · Coupons</h1>

                    <Button
                        className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white hover:text-white px-6 py-6 text-base font-semibold"
                        onClick={() => {
                            setSelected(null);
                            setOpen(true);
                        }}
                    >
                        New coupon
                    </Button>
                </div>

                <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <input
                        className="w-full md:max-w-md rounded-2xl border p-3"
                        placeholder="Search by code, title or description..."
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
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td className="p-4" colSpan={6}>
                                    Loading...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td className="p-4" colSpan={6}>
                                    No coupons found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => {
                                const st = statusOf(p);
                                return (
                                    <tr key={p.id} className="border-t">
                                        <td className="p-3 font-semibold">{p.code}</td>
                                        <td className="p-3">{p.discount}</td>
                                        <td className="p-3">{p.title ?? "-"}</td>
                                        <td className="p-3">
                                            {toDateOnly(p.startDate) || "—"} →{" "}
                                            {toDateOnly(p.endDate) || "—"}
                                        </td>
                                        <td className="p-3">
                        <span className="inline-flex rounded-xl border px-2 py-1">
                          {st}
                        </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="rounded-xl"
                                                    onClick={() => {
                                                        setSelected(p);
                                                        setOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    variant="secondary"
                                                    className="rounded-xl"
                                                    onClick={async () => {
                                                        const ok = confirm(`Delete promotion ${p.code}?`);
                                                        if (!ok) return;
                                                        try {
                                                            await remove(p.id);
                                                        } catch (e: any) {
                                                            alert(String(e?.message ?? e));
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                <Modal
                    open={open}
                    title={selected ? `Edit ${selected.code}` : "Create coupon"}
                    onClose={() => {
                        setOpen(false);
                        setSelected(null);
                    }}
                >
                    <PromotionForm
                        busy={busy}
                        submitLabel={selected ? "Save changes" : "Create"}
                        initial={initialForm}
                        onSubmit={async (v) => {
                            setBusy(true);
                            try {
                                const payload = {
                                    code: v.code,
                                    discount: v.discount,
                                    title: v.title || undefined,
                                    description: v.description || undefined,
                                    startDate: toStartOfDay(v.startDate),
                                    endDate: toEndOfDay(v.endDate),
                                    active: v.active,
                                    maxUses: v.maxUses,
                                    userId: v.userId,
                                    companyId: v.companyId,
                                    targets: v.targets,
                                };

                                if (selected) await update(selected.id, payload);
                                else await create(payload);

                                setOpen(false);
                                setSelected(null);
                            } finally {
                                setBusy(false);
                            }
                        }}
                    />
                </Modal>
            </div>
        </div>
    );
}
