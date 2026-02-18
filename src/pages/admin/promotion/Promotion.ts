import { useCallback, useEffect, useMemo, useState } from "react";

import type {Promotion} from "@/types/Entities.ts";

export type TargetKind = "PRODUCT_SKU" | "COMPONENT_TYPE" | "COMPONENT_SKU";
export type TargetMode = "INCLUDE" | "EXCLUDE";


export type PromotionTargetBody = {
    id?: number | null;
    kind: TargetKind;
    mode: TargetMode;
    sku?: string | null;
    componentType?: string | null;
};

export type PromotionDtoShape = Promotion & {
    active?: boolean;
    maxUses?: number | null;
    usedCount?: number;
    targets?: Array<
        PromotionTargetBody & { id?: number | string | null }
    >;
};


export type CreatePromotionBody = {
    code: string;
    discount: number;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    active?: boolean;
    maxUses?: number | null;
    userId?: string | null;
    companyId?: string | null;
    targets?: PromotionTargetBody[];
};

export type PromotionDto = {
    id: string;
    code: string;
    title: string | null;
    description: string | null;
    discount: number;
    startDate: string | null;
    endDate: string | null;
    active: boolean | null;
    maxUses: number | null;
    usedCount: number | null;
    userId: string | null;
    companyId: string | null;
    targets: PromotionTargetBody[];
};

type UpdatePromotionBody = Partial<CreatePromotionBody>;

function apiBase() {
    return  "http://localhost:8080";
}

async function authedFetch(getToken: () => Promise<string>, input: RequestInfo, init?: RequestInit) {
    const token = await getToken();
    const res = await fetch(`${apiBase()}${input}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init?.headers ?? {}),
        },
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
    }
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return res.json();
    return null;
}

export function useAdminPromotions(getToken: () => Promise<string>) {
    const [items, setItems] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = await authedFetch(getToken, "/promotions", { method: "GET" });
            setItems(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        load();
    }, [load]);

    const create = useCallback(async (body: CreatePromotionBody) => {
        const created = await authedFetch(getToken, "/promotions", {
            method: "POST",
            body: JSON.stringify(body),
        });
        await load();
        return created as Promotion;
    }, [getToken, load]);

    const update = useCallback(async (id: string, body: UpdatePromotionBody) => {
        const updated = await authedFetch(getToken, `/promotions/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
        });
        await load();
        return updated as Promotion;
    }, [getToken, load]);

    const remove = useCallback(async (id: string) => {
        await authedFetch(getToken, `/promotions/${id}`, { method: "DELETE" });
        setItems(prev => prev.filter(p => p.id !== id));
    }, [getToken]);

    const byCode = useMemo(() => {
        const map = new Map<string, Promotion>();
        for (const p of items) map.set(p.code.toLowerCase(), p);
        return map;
    }, [items]);

    return { items, loading, err, load, create, update, remove, byCode };
}
