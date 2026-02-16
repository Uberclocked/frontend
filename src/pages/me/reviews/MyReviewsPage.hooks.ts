import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useCallback } from "react";
import { getMyReviews } from "@/services/Review.ts";
import type { ReviewResponseDto } from "@/types/Review";
import { getProductBySkuPublic } from "@/services/Product";
import type { Product } from "@/types/Entities";

export function useMyReviews() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const data = await getMyReviews(token);
      setReviews(data);
    } catch (e) {
      console.error(e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load, isAuthenticated]);

  return { reviews, loading, reload: load };
}

export function useMyProductsBySku(reviews: ReviewResponseDto[]) {
  const [productsBySku, setProductsBySku] = useState<Record<string, Product | null>>({});

  useEffect(() => {
    if (reviews.length === 0) return;

    const skus = Array.from(new Set(reviews.map(r => r.skuPrefix)))
      .filter(sku => !(sku in productsBySku));

    if (skus.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled(skus.map(sku => getProductBySkuPublic(sku)));

      if (cancelled) return;

      setProductsBySku(prev => {
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
  }, [reviews]);

  return productsBySku;
}
