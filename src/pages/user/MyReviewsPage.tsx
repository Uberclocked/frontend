import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductBySkuPublic } from "@/services/Product";
import { deleteReview, getMyReviews, updateReview } from "@/services/Review.ts";
import type { Product } from "@/types/Entities.ts";
import type { ModifyReviewDataDto, ReviewResponseDto } from "@/types/Review";

export default function MyReviewsPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [items, setItems] = useState<ReviewResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStars, setEditStars] = useState<number>(5);
  const [editMessage, setEditMessage] = useState<string>("");

  const [productsBySku, setProductsBySku] = useState<Record<string, Product | null>>({});

  async function load() {
    setLoading(true);
    try {
      if (!isAuthenticated) return;

      const token = await getAccessTokenSilently();
      const data = await getMyReviews(token);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (items.length === 0) return;

    const skus = Array.from(new Set(items.map((r) => r.skuPrefix))).filter(
      (sku) => !(sku in productsBySku)
    );

    if (skus.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled(skus.map((sku) => getProductBySkuPublic(sku)));

      if (cancelled) return;

      setProductsBySku((prev) => {
        const next = { ...prev };
        results.forEach((res, idx) => {
          const sku = skus[idx];
          next[sku] = res.status === "fulfilled" ? res.value : null;
        });
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const sortedItems = useMemo(() => {
    // Your backend already returns desc, but this keeps UI stable
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items]);

  async function startEdit(r: ReviewResponseDto) {
    setEditingId(String(r.id));
    setEditStars(r.qualification);
    setEditMessage(r.message ?? "");
  }

  async function saveEdit(id: string) {
    const dto: ModifyReviewDataDto = {
      qualification: Math.min(5, Math.max(1, editStars)),
      message: editMessage.trim(),
    };

    const token = await getAccessTokenSilently();
    await updateReview(token, id, dto);

    setEditingId(null);
    await load();
  }

  async function remove(id: string) {
    const ok = confirm("Are you sure you want to delete this review?");
    if (!ok) return;

    const token = await getAccessTokenSilently();
    await deleteReview(token, id);
    await load();
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Button onClick={() => loginWithRedirect()}>
          Login to view your reviews
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">My Reviews</h1>

        {sortedItems.length === 0 ? (
          <div className="rounded-2xl border p-6">
            <p>You have not posted any reviews yet.</p>
          </div>
        ) : (
          sortedItems.map((r) => {
            const id = String(r.id);
            const isEditing = editingId === id;

            const product = productsBySku[r.skuPrefix] ?? null;
            const imageSrc =
              product?.image ? `data:image/jpeg;base64,${product.image}` : "/placeholder.png";

            return (
              <div key={id} className="rounded-2xl border p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex gap-4">
                    {/* Product mini-card */}
                    <div className="w-28 shrink-0">
                      <div className="rounded-2xl bg-white p-2">
                        <img
                          src={imageSrc}
                          alt={product?.name ?? r.skuPrefix}
                          className="h-20 w-full object-contain"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold">
                        {product?.name ?? "Product"}
                      </p>

                      <p className="text-sm">{new Date(r.createdAt).toLocaleString()}</p>

                      {!isEditing ? (
                        <>
                          <div className="mt-2 font-bold">
                            {"★".repeat(r.qualification)}
                            <span className="font-normal"> {"☆".repeat(5 - r.qualification)}</span>
                          </div>

                          {r.message && (
                            <p className="mt-3 leading-relaxed">“{r.message}”</p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm">Stars</label>
                            <select
                              value={editStars}
                              onChange={(e) => setEditStars(Number(e.target.value))}
                              className="rounded-xl border px-3 py-2"
                            >
                              {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </div>

                          <Input
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="mt-3"
                            placeholder="Update your review..."
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <Button
                          onClick={() => startEdit(r)}
                        >
                          Modify
                        </Button>

                        <Button variant="destructive"
                          onClick={() => remove(id)}>
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => saveEdit(id)}
                        >
                          Save
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
