const API = "http://localhost:8080";

async function authedFetch<T>(getToken: () => Promise<string>, path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API}${path}`, {
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
    return (await res.json()) as T;
}

export type WheelStatus = {
    canSpin: boolean;
    nextSpinAt: string | null;
    secondsRemaining: number | null;
};

export type WheelSpinResponse = {
    canSpin: boolean;
    nextSpinAt: string | null;
    prize?: { label: string; discount: number; targets: any[] };
    promotion?: { id: string; code: string; discount: number; userId: string; active: boolean; maxUses: number };
};

export function getWheelStatus(getToken: () => Promise<string>) {
    return authedFetch<WheelStatus>(getToken, "/wheel/status", { method: "GET" });
}

export function spinWheel(getToken: () => Promise<string>) {
    return authedFetch<WheelSpinResponse>(getToken, "/wheel/spin", { method: "POST" });
}