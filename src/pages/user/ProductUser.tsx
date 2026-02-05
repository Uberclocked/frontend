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
import { addCartItem } from "@/services/Cart";
import { getFilteredProductsPublic } from "@/services/Product";
import type { Product } from "@/types/Entities";
import { Link } from "react-router-dom";

const PAGE_SIZE = 9;

export default function ProductsUser() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [attributeFilter, setAttributeFilter] = useState("");
  const [addingSku, setAddingSku] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({
    componentSkuPrefix: "ALL",
    minPrice: "",
    maxPrice: "",
  });

  function handleAttributeChange(value: string) {
    setAttributeFilter(value);
    const map: Record<string, string> = {};
    value.split(",").forEach((pair) => {
      const [key, val] = pair.split("=").map((s) => s.trim());
      if (key && val) map[key] = val;
    });
    setFilters((prev) => ({ ...prev, ...map }));
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await getFilteredProductsPublic(filters);
        setProducts(data.filter((p: any) => p.active && p.stock > 0));
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
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setPage(0);
    setFilters({ componentSkuPrefix: "ALL", minPrice: "", maxPrice: "" });
    setAttributeFilter("");
  }

  async function handleAddToCart(product: Product) {
    try {
      if (!isAuthenticated) {
        await loginWithRedirect();
        return;
      }

      setAddingSku(product.skuPrefix);
      const token = await getAccessTokenSilently();

      await addCartItem(token, {
        productSku: product.skuPrefix,
        quantity: 1,
        components: {},
      });

      alert("Added to cart!");
    } catch (e) {
      console.error(e);
      alert("Could not add to cart");
    } finally {
      setAddingSku(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto w-full p-6 space-y-8">
        <div className="rounded-xl p-6 grid gap-4 md:grid-cols-5">
          <Select
            value={filters.componentSkuPrefix}
            onValueChange={(v) => updateFilter("componentSkuPrefix", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Component" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="CPU">CPU</SelectItem>
              <SelectItem value="GPU">GPU</SelectItem>
              <SelectItem value="RAM">RAM</SelectItem>
              <SelectItem value="MOTHERBOARD">MOTHERBOARD</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
          />

          <Input
            placeholder="Attributes (e.g. cores=8,socket=LGA1200)"
            value={attributeFilter}
            onChange={(e) => handleAttributeChange(e.target.value)}
          />

          <Button
            className="md:col-span-5"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {paginated.map((product) => (
            <div key={product.skuPrefix} className="flex h-full flex-col">
              <Link to={`/products/${product.skuPrefix}`} className="flex-1">
                <ProductCard product={product} />
              </Link>

              <Button
                className="mt-3 w-full"
                disabled={addingSku === product.skuPrefix}
                onClick={() => handleAddToCart(product)}
              >
                {addingSku === product.skuPrefix ? "Adding..." : "Add to cart"}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 pt-6">
          <Button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            disabled={(page + 1) * PAGE_SIZE >= products.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
