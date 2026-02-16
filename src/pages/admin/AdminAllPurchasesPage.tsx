import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { getAllPurchases, updatePurchase } from "@/services/Purchase";
import pcPlaceholder from "@/stories/assets/pc.jpg";
import type {
  PurchaseResponseDto,
  PurchaseStatus,
  UpdatePurchaseDto,
} from "@/types/PurchaseDto";

const STATUSES: PurchaseStatus[] = ["CREATED", "PAID", "READY", "DELIVERED", "CANCELLED"];

function toDateValue(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dateValueToIso(date: string) {
  if (!date) return null;
  return new Date(`${date}T12:00:00.000Z`).toISOString();
}

export default function AdminAllPurchasesPage() {
  const { getAccessTokenSilently } = useAuth0();

  const [data, setData] = useState<PurchaseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<
    Record<string, { status: PurchaseStatus; pickupDateLocal: string }>
  >({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently();
      const purchases = await getAllPurchases(token);

      setData(purchases);

      setDraft((prev) => {
        const next = { ...prev };
        for (const p of purchases) {
          if (!next[p.id]) {
            next[p.id] = {
              status: p.status,
              pickupDateLocal: toDateValue(p.pickupDate),
            };
          }
        }
        return next;
      });
    } catch (e: any) {
      console.error(e);
      setError("Error loading purchases");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  async function savePurchase(p: PurchaseResponseDto) {
    if (saving[p.id]) return;

    const d = draft[p.id];
    if (!d) return;

    const dto: UpdatePurchaseDto = {
      status: d.status,
    };

    const iso = dateValueToIso(d.pickupDateLocal);
    if (iso) {
      dto.pickupDate = iso;
    }

    setSaving((m) => ({ ...m, [p.id]: true }));
    setError(null);

    try {
      const token = await getAccessTokenSilently();
      await updatePurchase(token, p.id, dto);
      await load();
    } catch (e: any) {
      console.error(e);
      setError("Error updating purchase");
    } finally {
      setSaving((m) => ({ ...m, [p.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          All Purchases
        </h1>

        {error && (
          <div className="mb-4 rounded-xl borderp-3">
            {error}
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-lg text-center">No purchases</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sorted.map((p) => {
              const d =
                draft[p.id] ?? {
                  status: p.status,
                  pickupDateLocal: toDateValue(p.pickupDate),
                };

              const isSaving = saving[p.id];

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            Purchase #{p.id.slice(0, 8)}
                          </p>
                          <p className="text-sm">
                            Created: {new Date(p.createdAt).toLocaleString()}
                          </p>
                          {p.updatedAt && (
                            <p className="text-sm">
                              Updated: {new Date(p.updatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p>
                            Status: <span className="font-semibold">{p.status}</span>
                          </p>
                          <p className="font-bold text-lg">
                            ${Number(p.totalAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <p className="mb-2">
                          Items:{" "}
                          <span className="font-semibold">
                            {p.items?.length ?? 0}
                          </span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(p.items ?? []).map((it) => {
                            const isCustomPc = it.components && Object.keys(it.components).length > 0;
                            const imageSrc = it.image
                              ? `data:image/jpeg;base64,${it.image}`
                              : isCustomPc
                                ? pcPlaceholder
                                : "/placeholder.png";


                            return (
                              <div
                                key={it.id}
                                className="p-3 rounded-xl border flex gap-3"
                              >
                                <div className="h-16 w-16 rounded-lg overflow-hidden border flex items-center justify-center">
                                  <img
                                    src={imageSrc}
                                    alt={it.productName ?? it.name ?? "Product"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="flex-1">
                                  <p className="font-semibold">{it.name}</p>
                                  {it.productName && (
                                    <p className="text-sm">
                                      Product:{" "}
                                      <span>{it.productName}</span>
                                    </p>
                                  )}
                                  <p className="text-sm">Qty: {it.quantity}</p>
                                  <p className="font-semibold">
                                    ${Number(it.totalPrice).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-[320px] rounded-2xl border p-4">
                      <p className="font-semibold mb-3">Admin controls</p>

                      <label className="block text-sm mb-1">Status</label>
                      <select
                        value={d.status}
                        onChange={(e) =>
                          setDraft((m) => ({
                            ...m,
                            [p.id]: { ...d, status: e.target.value as PurchaseStatus },
                          }))
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <label className="block text-sm mt-4 mb-1">
                        Pickup date
                      </label>
                      <input
                        type="date"
                        value={d.pickupDateLocal}
                        onChange={(e) =>
                          setDraft((m) => ({
                            ...m,
                            [p.id]: { ...d, pickupDateLocal: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      />

                      <button
                        onClick={() => savePurchase(p)}
                        disabled={isSaving}
                        className="mt-4 w-full px-4 py-3 rounded-2xl font-bold disabled:opacity-50"
                      >
                        {isSaving ? "Saving…" : "Update"}
                      </button>

                      <button
                        onClick={load}
                        className="mt-2 w-full px-4 py-3 rounded-2xl font-semibold border"
                      >
                        Refresh
                      </button>
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
