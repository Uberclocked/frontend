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
import {fetchWithAuth} from "@/services/api.ts";

const PAGE_SIZE = 8;
type ComponentDto = { skuPrefix: string; displayName: string };

export default function ProductsUser() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [attributeFilter, setAttributeFilter] = useState("");
  const [addingSku, setAddingSku] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentDto[]>([]);

  const [filters, setFilters] = useState<Record<string, string>>({
    componentSkuPrefix: "ALL",
    minPrice: "",
    maxPrice: "",
  });

  function sanitizePositiveNumber(raw: string) {
    let v = raw.replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    const [intPart, decPart] = v.split(".");
    if (decPart !== undefined) v = intPart + "." + decPart.slice(0, 2);
    return v;
  }

  function handleAttributeChange(value: string) {
    setAttributeFilter(value);
    setPage(0);

    setFilters((prev) => {
      const baseFilters = {
        componentSkuPrefix: prev.componentSkuPrefix,
        minPrice: prev.minPrice,
        maxPrice: prev.maxPrice,
      };

      if (!value.trim()) {
        return baseFilters;
      }

      const map: Record<string, string> = {};
      value.split(",").forEach((pair) => {
        const [key, val] = pair.split("=").map((s) => s.trim());
        if (key && val) map[key] = val;
      });

      return { ...baseFilters, ...map };
    });
  }


  useEffect(() => {
    if (!isAuthenticated) {
      setComponents([]);
      return;
    }

    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchWithAuth<ComponentDto[]>(
            "http://localhost:8080/components",
            token
        );
        setComponents(data);
      } catch (e) {
        console.error("components fetch failed:", e);
        setComponents([]);
      }
    })();
  }, [isAuthenticated, getAccessTokenSilently]);


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
    <div className="min-w-screen overflow-y-scroll">
      <div className="min-w-screen mx-auto w-full p-6 space-y-8">
        <div className="rounded-xl p-6 grid gap-3 md:grid-cols-5">
          <Select
              value={filters.componentSkuPrefix}
              onValueChange={(v) => updateFilter("componentSkuPrefix", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Component" />
            </SelectTrigger>
            <SelectContent className="border bg-background text-foreground shadow-md backdrop-blur-none">
              <SelectItem value="ALL">All</SelectItem>
              {components.map((c) => (
                  <SelectItem key={c.skuPrefix} value={c.skuPrefix}>
                    {c.displayName}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
              type="text"
              inputMode="decimal"
              placeholder="Min price"
              value={filters.minPrice}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => updateFilter("minPrice", sanitizePositiveNumber(e.target.value))}
          />

          <Input
              type="text"
              inputMode="decimal"
              placeholder="Max price"
              value={filters.maxPrice}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => updateFilter("maxPrice", sanitizePositiveNumber(e.target.value))}
          />

          {/* Attributes + Clear lado a lado */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <Input
                placeholder="Attributes (e.g. cores=8,socket=LGA1200)"
                value={attributeFilter}
                onChange={(e) => handleAttributeChange(e.target.value)}
            />

            <Button
                onClick={clearFilters}
                className="text-white hover:text-white whitespace-nowrap"
            >
              Clear filters
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
          {paginated.map((product) => (
              <div key={product.skuPrefix} className="flex h-full flex-col">
                <Link to={`/products/${product.skuPrefix}`} className="flex-1">
                  <ProductCard product={product} />
                </Link>

                <Button
                    className="mt-2 w-full text-white hover:text-white"
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
              className="text-white hover:text-white"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
              className="text-white hover:text-white"
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
