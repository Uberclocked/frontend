import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProductCard } from "../../../ProductCard";
import type { Props } from "./ProductCarousel.types";

export default function ProductCarousel({ products }: Props) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [products]);

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
      <ProductCard product={product} />
    </div>
  );
}
