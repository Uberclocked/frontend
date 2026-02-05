import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyCart, updateCartItem, removeCartItem } from "@/services/Cart.ts";
import { createPurchase } from "@/services/Purchase.ts";
import pcPlaceholder from "@/stories/assets/pc.jpg";
import type { Cart } from "@/types/Entities.ts";


export default function CartPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(6);

  async function loadCart() {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const c = await getMyCart(token);

      setCart((prev) => {
        const prevItems = prev?.items ?? [];
        const prevIndex = new Map<string, number>(
          prevItems.map((it: any, idx: number) => [it.id, idx])
        );

        const nextItems = [...(c.items ?? [])];

        nextItems.sort((a: any, b: any) => {
          const ia = prevIndex.get(a.id);
          const ib = prevIndex.get(b.id);

          if (ia == null && ib == null) return 0;
          if (ia == null) return 1;
          if (ib == null) return -1;
          return ia - ib;
        });

        return { ...c, items: nextItems };
      });
    } catch (e) {
      console.error(e);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  function setLocalQty(itemId: string, qty: number) {
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: (prev.items ?? []).map((it: any) =>
          it.id === itemId ? { ...it, quantity: qty } : it
        ),
      };
    });
  }

  function removeLocalItem(itemId: string) {
    setCart((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: (prev.items ?? []).filter((it: any) => it.id !== itemId),
      };
    });
  }

  async function changeQuantityAbs(itemId: string, nextQty: number) {
    if (updating[itemId]) return;

    const safeQty = Math.max(0, nextQty);

    if (safeQty === 0) removeLocalItem(itemId);
    else setLocalQty(itemId, safeQty);

    setUpdating((m) => ({ ...m, [itemId]: true }));
    try {
      const token = await getAccessTokenSilently();

      if (safeQty === 0) {
        await removeCartItem(token, itemId);
      } else {
        await updateCartItem(token, itemId, safeQty);
      }
      await loadCart();
    } catch (e) {
      console.error(e);
      await loadCart();
    } finally {
      setUpdating((m) => ({ ...m, [itemId]: false }));
    }
  }

  async function removeItem(itemId: string) {
    if (updating[itemId]) return;

    removeLocalItem(itemId);

    setUpdating((m) => ({ ...m, [itemId]: true }));
    try {
      const token = await getAccessTokenSilently();
      await removeCartItem(token, itemId);
      await loadCart();
    } catch (e) {
      console.error(e);
      await loadCart();
    } finally {
      setUpdating((m) => ({ ...m, [itemId]: false }));
    }
  }

  async function doCheckout() {
    const token = await getAccessTokenSilently();
    await createPurchase(token);
    alert("Purchase successful!");
    loadCart();
  }

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-lg">Error loading cart</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          My Cart
        </h1>

        {items.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-lg text-center">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="font-semibold">
                  {Math.min(visibleCount, items.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{items.length}</span>{" "}
                items
              </p>

              <div className="flex items-center gap-3">
                <label className="text-gray-300i text-sm">Items to show:</label>
                <select
                  value={visibleCount}
                  onChange={(e) => setVisibleCount(Number(e.target.value))}
                  className="rounded-xl border px-3 py-2"
                >
                  {[4, 6, 8, 12, 999].map((n) => (
                    <option key={n} value={n}>
                      {n === 999 ? "All" : n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleItems.map((item: any) => {
                const isCustomPc = item.components && Object.keys(item.components).length > 0;

                const imageSrc = isCustomPc
                  ? pcPlaceholder
                  : item.image
                    ? `data:image/jpeg;base64,${item.image}`
                    : "/placeholder.png";

                const isUpdating = updating[item.id];

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-xl overflow-hidden border flex items-center justify-center">
                        <img
                          src={imageSrc}
                          alt={item.productName ?? item.name ?? "Product"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>

                        {item.productName && (
                          <p className="text-sm mt-1">
                            Product: <span>{item.productName}</span>
                          </p>
                        )}

                        {isCustomPc && (
                          <div className="mt-3 flex flex-col gap-2">
                            <div className="text-sm">
                              Custom PC ({Object.keys(item.components).length} components)
                            </div>

                            <button
                              onClick={() => navigate(`/pc-builder/${item.id}`)}
                              className="w-fit px-3 py-2 rounded-xl"
                            >
                              Modify PC
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <span className="text-sm">Quantity:</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => changeQuantityAbs(item.id, item.quantity - 1)}
                              className="h-9 w-9 rounded-xl border"
                              disabled={isUpdating || item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <div className="min-w-10 text-center font-semibold">
                              {item.quantity}
                            </div>

                            <button
                              onClick={() => changeQuantityAbs(item.id, item.quantity + 1)}
                              className="h-9 w-9 rounded-xl border disabled:opacity-40"
                              disabled={isUpdating}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto px-3 py-2 rounded-xl border transition-colors disabled:opacity-40"
                            disabled={isUpdating}
                          >
                            Remove
                          </button>

                          <div className="h-4">
                            <span
                              className={`text-xs ${isUpdating ? "opacity-100" : "opacity-0"
                                }`}
                            >
                              Updating…
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 font-semibold">
                          Total item:{" "}
                          <span>
                            ${Number(item.totalPrice).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button
                onClick={doCheckout}
                className="mt-8 px-6 py-3 rounded-2xl text-white text-lg font-bold"
              >
                Pay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
