import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProductCard } from "../../../ProductCard";
import type { Props } from "./ProductCarousel.types";

import { getProductRating, getReviewsByProduct } from "@/services/Review";
import type { ProductRatingDto, ReviewResponseDto } from "@/types/Review";

export default function ProductCarousel({ products }: Props) {
  const [index, setIndex] = useState(0);
  const [rating, setRating] = useState<ProductRatingDto | null>(null);
  const [firstReview, setFirstReview] = useState<ReviewResponseDto | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [products]);

  useEffect(() => {
    if (products.length === 0) return;

    const p = products[index];
    if (!p?.skuPrefix) return;

    let cancelled = false;

    (async () => {
      try {
        const [rt, rv] = await Promise.all([
          getProductRating(p.skuPrefix),
          getReviewsByProduct(p.skuPrefix),
        ]);

        if (cancelled) return;
        setRating(rt ?? null);
        setFirstReview((rv?.[0] ?? null) as any);
      } catch {
        if (cancelled) return;
        setRating(null);
        setFirstReview(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [index, products]);

  if (products.length === 0) {
    return <p className="text-center">No products available</p>;
  }

  const product = products[index];

  return (
      <div
          className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-lg cursor-pointer"
          onClick={() => navigate(`/products/${product.skuPrefix}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate(`/products/${product.skuPrefix}`);
          }}
      >
        <ProductCard product={product} rating={rating} firstReview={firstReview} />
      </div>
  );
}