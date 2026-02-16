import ProductCarousel from "@/components/common/products/carousel/ProductCarousel";
import { useLoaderData } from "react-router-dom";
import type { Props } from "./Home.types";

export default function Home() {
  const { products } = useLoaderData() as Props;

  return (
    <div className="min-w-screen px-8 py-12">
      <h1 className="text-3xl font-semibold mb-12 text-center">
        UberClocked Marketplace
      </h1>
      <ProductCarousel products={products} />
    </div>
  );
}
