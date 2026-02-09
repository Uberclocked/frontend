export async function fetchWithAuth<T>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!text) return undefined as T;

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  return text as unknown as T;
}

export async function getWithAuth<T>(
  url: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  return fetchWithAuth<T>(url, token, {
    ...init,
    method: "GET",
  });
}

export async function postWithAuth<TResponse, TBody = unknown>(
  url: string,
  token: string,
  body: TBody = {} as TBody,
  init: RequestInit = {}
): Promise<TResponse> {
  return fetchWithAuth<TResponse>(url, token, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
  });
}

