import ProductCarousel from "@/components/ProductCarousel";

export default function Home() {
  return (
    <div className="min-h-screen px-8 py-12">
      <h1 className="text-3xl font-semibold mb-12 text-center">
        UberClocked Marketplace
      </h1>
      <ProductCarousel />
    </div>
  );
}
