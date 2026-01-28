import ProductCarousel from "@/components/ProductCarousel.tsx";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#36454F] px-8 py-12">

            <h1 className="text-[#F5F5DC] text-3xl font-semibold mb-12 text-center">
                UberClocked Marketplace
            </h1>

            <ProductCarousel />

        </div>
    );
}
