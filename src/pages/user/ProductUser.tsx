import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getFilteredProductsPublic } from "@/services/Product";
import type { Product } from "@/types/Entities";

const PAGE_SIZE = 9;

export default function ProductsUser() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(0);
    const [attributeFilter, setAttributeFilter] = useState("");

    const [filters, setFilters] = useState<Record<string, string>>({
        componentSkuPrefix: "ALL",
        minPrice: "",
        maxPrice: "",
    });

    function handleAttributeChange(value: string) {
        setAttributeFilter(value);
        const map: Record<string, string> = {};
        value.split(",").forEach(pair => {
            const [key, val] = pair.split("=").map(s => s.trim());
            if (key && val) map[key] = val;
        });
        setFilters(prev => ({ ...prev, ...map }));
    }

    useEffect(() => {
        (async () => {
            try {
                let data: Product[];

                if (isAuthenticated) {
                    // const token = await getAccessTokenSilently();
                    data = await getFilteredProductsPublic(filters);
                } else {
                    data = await getFilteredProductsPublic(filters);
                }

                setProducts(data.filter(p => p.active && p.stock > 0));
            } catch (err) {
                console.error(err);
            }
        })();
    }, [filters, isAuthenticated, getAccessTokenSilently]);


    const paginated = useMemo(() => {
        const start = page * PAGE_SIZE;
        return products.slice(start, start + PAGE_SIZE);
    }, [products, page]);

    function updateFilter(key: string, value: string) {
        setPage(0);
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    function clearFilters() {
        setPage(0);
        setFilters({
            componentSkuPrefix: "ALL",
            minPrice: "",
            maxPrice: "",
        });
        setAttributeFilter("");
    }

    return (
        <div className="min-h-screen bg-[#2b3740] text-[#F5F5DC]">
            <div className="max-w-7xl mx-auto p-6 space-y-8">

                <div className="bg-[#2b3740] rounded-xl p-6 grid gap-4 md:grid-cols-5 text-[#F5F5DC]">

                    <Select
                        value={filters.componentSkuPrefix}
                        onValueChange={v => updateFilter("componentSkuPrefix", v)}
                    >
                        <SelectTrigger className="text-[#F5F5DC] border-[#FF8000]">
                            <SelectValue placeholder="Component" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2b3740] text-[#F5F5DC]">
                            <SelectItem value="ALL" className="hover:bg-[#FF8000] hover:text-black">All</SelectItem>
                            <SelectItem value="CPU" className="hover:bg-[#FF8000] hover:text-black">CPU</SelectItem>
                            <SelectItem value="GPU" className="hover:bg-[#FF8000] hover:text-black">GPU</SelectItem>
                            <SelectItem value="RAM" className="hover:bg-[#FF8000] hover:text-black">RAM</SelectItem>
                            <SelectItem value="MB" className="hover:bg-[#FF8000] hover:text-black">Motherboard</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        type="number"
                        placeholder="Min price"
                        value={filters.minPrice}
                        onChange={e => updateFilter("minPrice", e.target.value)}
                        className="text-[#F5F5DC] placeholder:text-[#F5F5DC]/60 border-[#FF8000] focus:border-[#FF8000] focus:ring-[#FF8000]"
                    />

                    <Input
                        type="number"
                        placeholder="Max price"
                        value={filters.maxPrice}
                        onChange={e => updateFilter("maxPrice", e.target.value)}
                        className="text-[#F5F5DC] placeholder:text-[#F5F5DC]/60 border-[#FF8000] focus:border-[#FF8000] focus:ring-[#FF8000]"
                    />

                    <Input
                        placeholder="Attributes (e.g. cores=8,socket=LGA1200)"
                        value={attributeFilter}
                        onChange={e => handleAttributeChange(e.target.value)}
                        className="text-[#F5F5DC] placeholder:text-[#F5F5DC]/60 border-[#FF8000] focus:border-[#FF8000] focus:ring-[#FF8000]"
                    />

                    <Button
                        className="md:col-span-5 bg-[#FF8000] text-black hover:bg-[#e67300]"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.map(product => (
                        <ProductCard
                            key={product.skuPrefix}
                            product={product}
                        />
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        className="bg-[#FF8000] text-black hover:bg-[#e67300]"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>

                    <Button
                        className="bg-[#FF8000] text-black hover:bg-[#e67300]"
                        disabled={(page + 1) * PAGE_SIZE >= products.length}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
