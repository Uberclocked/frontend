import { getMyCart, removeCartItem, updateCartItem } from "@/services/Cart";
import { generatePreference } from "@/services/mp";
import type { Cart } from "@/types/Entities";
import { useEffect, useState } from "react";

const BASE = "http://localhost:8080";

export function useCart(getToken: () => Promise<string>) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  async function applyCoupon(code: string) {
    const token = await getToken();
    const res = await fetch(`${BASE}/carts/coupon/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to apply coupon");
    }

    const updated: Cart = await res.json();
    setCart(updated);
  }

  async function removeCoupon() {
    const token = await getToken();
    const res = await fetch(`${BASE}/carts/coupon/remove`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to remove coupon");
    }

    const updated: Cart = await res.json();
    setCart(updated);
  }

  async function loadCart() {
    setIsLoading(true);
    try {
      const token = await getToken();
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
      setIsLoading(false);
    }
  }


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
      const token = await getToken();

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
      const token = await getToken();
      await removeCartItem(token, itemId);
      await loadCart();
    } catch (e) {
      console.error(e);
      await loadCart();
    } finally {
      setUpdating((m) => ({ ...m, [itemId]: false }));
    }
  }

  return {
    cart,
    updating,
    isLoading,
    setIsLoading,
    loadCart,
    changeQuantityAbs,
    removeItem,
    applyCoupon,
    removeCoupon,
  };
}

export default function usePreference(getToken: () => Promise<string>, cart: Cart | null) {
  const [preferenceId, setPreferenceId] = useState("");

  useEffect(() => {
    if (!cart) return;
    async function createPreference() {
      const token = await getToken();
      const pid = (await generatePreference(token)).id;
      setPreferenceId(pid);
    }
    createPreference();
  }, [cart, getToken]);

  return preferenceId;
}


