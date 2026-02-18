import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { getAllPurchases, updatePurchase } from "@/services/Purchase";
import pcPlaceholder from "@/stories/assets/pc.jpg";
import type {
  PurchaseResponseDto,
  PurchaseStatus,
  UpdatePurchaseDto,
} from "@/types/PurchaseDto";

const STATUSES: PurchaseStatus[] = ["PAID", "READY", "DELIVERED", "CANCELLED"];

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

  const [filters, setFilters] = useState<PurchaseStatus | "ALL">("ALL");
  const [lockedAfterUpdate, setLockedAfterUpdate] = useState<Record<string, boolean>>({});

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
    const base = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // default: hide CANCELLED
    if (filters === "ALL") return base.filter((p) => p.status !== "CANCELLED");

    // when selecting a status, show only that status (including CANCELLED)
    return base.filter((p) => p.status === filters);
  }, [data, filters]);

  async function savePurchase(p: PurchaseResponseDto) {
    if (saving[p.id] || lockedAfterUpdate[p.id]) return;

    const d = draft[p.id];
    if (!d) return;

    const dto: UpdatePurchaseDto = { status: d.status };

    const iso = dateValueToIso(d.pickupDateLocal);
    if (iso) dto.pickupDate = iso;

    setSaving((m) => ({ ...m, [p.id]: true }));
    setError(null);

    // lock until page refresh
    setLockedAfterUpdate((m) => ({ ...m, [p.id]: true }));

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
          <h1 className="text-3xl font-bold mb-6 text-center">All Purchases</h1>

          {/* Filter + count */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Filter:</label>

              <select
                  value={filters}
                  onChange={(e) => setFilters(e.target.value as PurchaseStatus | "ALL")}
                  className="rounded-xl border border-orange-300 bg-gray-100/75 px-3 py-2 text-sm focus:outline-none focus:ring-0"
              >
                <option value="ALL">All (no cancelled)</option>
                {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                ))}
              </select>
            </div>

            <p className="text-sm opacity-70">
              Showing <span className="font-semibold">{sorted.length}</span> purchases
            </p>
          </div>

          {error && (
              <div className="mb-4 rounded-xl border p-3">
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
                      <div key={p.id} className="p-4 rounded-2xl border bg-gray-100/75">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <p className="font-semibold">Purchase #{p.id.slice(0, 8)}</p>
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
                                <span className="font-semibold">{p.items?.length ?? 0}</span>
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(p.items ?? []).map((it) => {
                                  const isCustomPc =
                                      it.components && Object.keys(it.components).length > 0;

                                  const imageSrc = it.image
                                      ? `data:image/jpeg;base64,${it.image}`
                                      : isCustomPc
                                          ? pcPlaceholder
                                          : "/placeholder.png";

                                  return (
                                      <div key={it.id} className="p-3 rounded-xl border flex gap-3">
                                        <div className="h-16 w-16 rounded-lg border bg-white flex items-center justify-center p-1">
                                          <img
                                              src={imageSrc}
                                              alt={it.productName ?? it.name ?? "Product"}
                                              className="max-h-full max-w-full object-contain"
                                          />
                                        </div>

                                        <div className="flex-1">
                                          <p className="font-semibold">{it.name}</p>
                                          {it.productName && (
                                              <p className="text-sm">
                                                Product: <span>{it.productName}</span>
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

                          {/* Admin controls */}
                          <div className="w-full lg:w-[320px] rounded-2xl border bg-gray-100/75 p-4">
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
                                className="w-full rounded-xl border border-orange-300 bg-gray-100/75 px-3 py-2 focus:outline-none focus:ring-0"
                            >
                              {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                              ))}
                            </select>

                            <label className="block text-sm mt-4 mb-1">Pickup date</label>
                            <input
                                type="date"
                                value={d.pickupDateLocal}
                                onChange={(e) =>
                                    setDraft((m) => ({
                                      ...m,
                                      [p.id]: { ...d, pickupDateLocal: e.target.value },
                                    }))
                                }
                                className="w-full rounded-xl border border-orange-300 bg-gray-100/75 px-3 py-2 focus:outline-none focus:ring-0 accent-orange-500"
                            />

                            <button
                                onClick={() => savePurchase(p)}
                                disabled={isSaving || lockedAfterUpdate[p.id]}
                                className={[
                                  "mt-4 w-full px-4 py-3 rounded-2xl font-bold transition",
                                  "bg-orange-500 hover:bg-orange-600 text-white",
                                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                                  "disabled:opacity-50 disabled:hover:bg-orange-500",
                                ].join(" ")}
                            >
                              {lockedAfterUpdate[p.id] ? "Updated" : isSaving ? "Saving…" : "Update"}
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
