import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";

export type ApplicablePromotionDto = {
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
    targets: any[];
};

const BASE = "http://localhost:8080";

async function authedFetch(getToken: () => Promise<string>, path: string) {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
    }

    return (await res.json()) as ApplicablePromotionDto[];
}

export function useApplicablePromotions() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    const [items, setItems] = useState<ApplicablePromotionDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setErr(null);
        try {
            const data = await authedFetch(getAccessTokenSilently, "/promotions/applicable");
            setItems(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setErr(String(e?.message ?? e));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently, isAuthenticated]);

    useEffect(() => {
        load();
    }, [load]);

    return { items, loading, err, reload: load };
}
