export async function fetchWithAuth<T>(
    url: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        throw new Error(`API error ${res.status}`);
    }

    if (res.status === 204) {
        return null as T;
    }

    return res.json();
}
