import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {getMyCart, addCustomPcToCart, updateCartItemComponent } from "@/services/Cart";
import { getProductsByComponentPrefix } from "@/services/Product";
import type { Product } from "@/types/Entities";

type SlotKey = "CPU" | "MOTHERBOARD" | "RAM" | "GPU" | "SD" | "PSU" | "CASE" | "COOLER";

type Slot = { key: SlotKey; label: string; componentSkuPrefix: string };

const SLOTS: Slot[] = [
    { key: "CPU", label: "CPU", componentSkuPrefix: "CPU" },
    { key: "MOTHERBOARD", label: "Motherboard", componentSkuPrefix: "MOTHERBOARD" },
    { key: "COOLER", label: "Cooler", componentSkuPrefix: "COOL" },
    { key: "RAM", label: "RAM", componentSkuPrefix: "RAM" },
    { key: "GPU", label: "GPU", componentSkuPrefix: "GPU" },
    { key: "SD", label: "Storage", componentSkuPrefix: "SD" },
    { key: "PSU", label: "Power Supply", componentSkuPrefix: "PSU" },
    { key: "CASE", label: "Case", componentSkuPrefix: "CASE" },
];

export default function PcBuilderPage() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();

    const isEditMode = !!itemId;
    useEffect(() => {
        if (!isEditMode) return;

        (async () => {
            try {
                const token = await getAccessTokenSilently();
                const cart = await getMyCart(token);

                const item = (cart.items ?? []).find((it: any) => String(it.id) === String(itemId));
                if (!item) return;
                setComponents(item.components ?? {});
            } catch (e) {
                console.error("Failed to load cart item components", e);
            }
        })();
    }, [isEditMode, itemId, getAccessTokenSilently]);

    const [components, setComponents] = useState<Record<string, string>>({});
    const [productBySku, setProductBySku] = useState<Record<string, Product | null>>({});

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<Slot | null>(null);

    const [loadingProducts, setLoadingProducts] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [q, setQ] = useState("");

    async function openSlot(slot: Slot) {
        setActive(slot);
        setOpen(true);
        setQ("");
        setProducts([]);
        setLoadingProducts(true);
        try {
            const list = await getProductsByComponentPrefix(slot.componentSkuPrefix);
            setProducts(list);
        } finally {
            setLoadingProducts(false);
        }
    }

    // cache currently loaded products (helps show names after selection)
    useEffect(() => {
        if (products.length === 0) return;
        setProductBySku((prev) => {
            const next = { ...prev };
            for (const p of products) next[p.skuPrefix] = p;
            return next;
        });
    }, [products]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return products;
        return products.filter((p) => {
            const sku = (p.skuPrefix ?? "").toLowerCase();
            const name = (p.name ?? "").toLowerCase();
            return sku.includes(qq) || name.includes(qq);
        });
    }, [products, q]);

    async function pick(p: Product) {
        if (!active) return;

        setComponents((prev) => ({ ...prev, [active.key]: p.skuPrefix }));
        setOpen(false);

        // Edit mode: update backend immediately
        if (isEditMode) {
            const token = await getAccessTokenSilently();
            await updateCartItemComponent(token, itemId!, active.key, p.skuPrefix);
        }
    }

    const estimatedTotal = useMemo(() => {
        let total = 0;
        for (const sku of Object.values(components)) {
            const p = productBySku[sku];
            if (p) total += Number(p.price ?? 0);
        }
        return total;
    }, [components, productBySku]);

    async function addToCart() {
        // Require at least some components (adjust rules if needed)
        const required: SlotKey[] = ["CPU", "MOTHERBOARD", "RAM"];
        const missing = required.filter((k) => !components[k]);

        if (missing.length) {
            alert(`Missing required components: ${missing.join(", ")}`);
            return;
        }

        const token = await getAccessTokenSilently();
        await addCustomPcToCart(token, components, 1);
        alert("Custom PC added to cart!");
        navigate("/cart");
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#FF8000]">
                            {isEditMode ? "Modify Your PC" : "Build Your PC"}
                        </h1>
                        <p className="mt-1 text-gray-400">
                            Click a slot to select a component (filtered by component type).
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3">
                        <p className="text-sm text-gray-400">Estimated total (cached)</p>
                        <p className="text-xl font-semibold text-gray-100">${estimatedTotal.toFixed(2)}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-900 p-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {SLOTS.map((slot) => {
                            const sku = components[slot.key];
                            const p = sku ? productBySku[sku] : null;

                            return (
                                <button
                                    key={slot.key}
                                    onClick={() => openSlot(slot)}
                                    className="group rounded-3xl border border-gray-800 bg-gray-950 p-6 hover:bg-gray-900 transition flex flex-col items-center justify-center text-center"
                                >
                                    <p className="text-gray-200 font-semibold">{slot.label}</p>

                                    {sku ? (
                                        <>
                                            <p className="mt-2 text-xs text-cyan-300">{sku}</p>
                                            <p className="mt-1 text-xs text-gray-400 line-clamp-2">{p?.name ?? "Selected"}</p>
                                        </>
                                    ) : (
                                        <p className="mt-2 text-xs text-gray-500">Type: {slot.componentSkuPrefix}</p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {!isEditMode && (
                    <div className="mt-6 flex justify-end">
                        <Button className="bg-[#FF8000] text-black hover:bg-[#e67300]" onClick={addToCart}>
                            Add PC to Cart
                        </Button>
                    </div>
                )}

                {isEditMode && (
                    <div className="mt-6 flex justify-end">
                        <Button className="bg-cyan-500 text-black hover:bg-cyan-400" onClick={() => navigate("/cart")}>
                            Back to Cart
                        </Button>
                    </div>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-3xl bg-gray-950 border border-gray-800 text-gray-100">
                        <DialogHeader>
                            <DialogTitle className="text-[#FF8000]">
                                {active ? `Select ${active.label}` : "Select component"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="bg-gray-900 border-gray-800 text-gray-100"
                                placeholder="Search by name or SKU..."
                            />
                            <div className="text-sm text-gray-400">
                                Type: <span className="text-gray-200 font-semibold">{active?.componentSkuPrefix ?? "-"}</span>
                            </div>
                        </div>

                        {loadingProducts ? (
                            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                                <p className="text-gray-200">Loading products...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                                <p className="text-gray-300">No products found.</p>
                            </div>
                        ) : (
                            <div className="max-h-[60vh] overflow-auto space-y-3 pr-1">
                                {filtered.map((p) => {
                                    const img = p.image ? `data:image/jpeg;base64,${p.image}` : "/placeholder.png";
                                    return (
                                        <div
                                            key={p.skuPrefix}
                                            className="rounded-2xl border border-gray-800 bg-gray-900 p-4 flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-2xl bg-white p-2">
                                                    <img src={img} alt={p.name} className="h-16 w-16 object-contain" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-100 font-semibold">{p.name}</p>
                                                    <p className="text-sm text-cyan-300">{p.skuPrefix}</p>
                                                    <p className="text-sm text-gray-400">
                                                        Stock: <span className="text-gray-200 font-semibold">{p.stock}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <p className="text-gray-100 font-semibold">${Number(p.price).toFixed(2)}</p>
                                                <Button
                                                    className="bg-[#FF8000] text-black hover:bg-[#e67300]"
                                                    onClick={() => pick(p)}
                                                    disabled={p.stock <= 0}
                                                >
                                                    {p.stock <= 0 ? "Out of stock" : (isEditMode ? "Apply" : "Select")}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button className="bg-cyan-500 text-black hover:bg-cyan-400" onClick={() => setOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}