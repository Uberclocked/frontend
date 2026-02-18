import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import ComponentsSidebar from "@/components/common/component/ComponentsSidebar";
import ProductList from "@/components/common/products/list/ProductList";
import ProductsSelectedPanel from "@/components/common/products/selected/panel/ProductSelectedPanel";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api.ts";
import { addCartItem, getMyCart } from "@/services/Cart";
import { getComponents, type ComponentDto } from "@/services/component";
import { getProductsByComponentPrefix, getProductBySkuPublic } from "@/services/Product";

import type { Product } from "./types/Product";

const CUSTOM_PC_SKU = "CUSTOM_PC";
const CASE_COMPONENT_SKU = "CASE";

const RAM_SLOTS = 4;
const SD_SLOTS = 4;

const MULTI_BASES = new Set<string>(["RAM", "SD"]);

function slotKey(base: string, index1: number) {
  return `${base}_${index1}`;
}

function getProductSku(p: any) {
  return p?.skuPrefix ?? p?.sku ?? p?.id ?? "";
}

export default function BuilderPage() {
  const { itemId } = useParams();
  const isEditMode = !!itemId;

  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [components, setComponents] = useState<ComponentDto[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedComponentSku, setSelectedComponentSku] = useState<string>("");

  const [selectedByComponent, setSelectedByComponent] = useState<Record<string, Product>>({});

  const [componentCounts, setComponentCounts] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);

  const returnTo = isEditMode ? `/build/${itemId}` : `/build`;
  const DRAFT_KEY = isEditMode ? `pc_draft_edit_${itemId}` : `pc_draft_new`;

  const selectedItems = useMemo(
      () => Object.entries(selectedByComponent).map(([key, product]) => ({ key, product })),
      [selectedByComponent]
  );

  const componentsPayload = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, product] of Object.entries(selectedByComponent)) {
      out[key] = getProductSku(product);
    }
    return out;
  }, [selectedByComponent]);

  useEffect(() => {
    try {
      const draft = {
        selectedComponentSku,
        components: componentsPayload,
      };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
    }
  }, [DRAFT_KEY, selectedComponentSku, componentsPayload]);

  useEffect(() => {
    if (Object.keys(selectedByComponent).length > 0) return;

    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const draftComponents: Record<string, string> = parsed?.components ?? {};
    const draftSelectedComponentSku: string = parsed?.selectedComponentSku ?? "";

    if (!draftComponents || Object.keys(draftComponents).length === 0) return;

    (async () => {
      const entries = await Promise.all(
          Object.entries(draftComponents).map(async ([key, sku]) => {
            try {
              const p = await getProductBySkuPublic(sku);
              return [key, p] as const;
            } catch {
              return [key, null] as const;
            }
          })
      );

      const next: Record<string, Product> = {};
      for (const [key, product] of entries) {
        if (product) next[key] = product;
      }

      if (Object.keys(next).length > 0) {
        setSelectedByComponent(next);
      }

      if (draftSelectedComponentSku) {
        setSelectedComponentSku((prev) => prev || draftSelectedComponentSku);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DRAFT_KEY]);

  useEffect(() => {
    if (!isAuthenticated) {
      setComponents([]);
      return;
    }

    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await getComponents(token);
        setComponents(data);
      } catch (e) {
        console.error("components fetch failed:", e);
        setComponents([]);
      }
    })();
  }, [isAuthenticated, getAccessTokenSilently]);

  // ========= Preload si es edit mode =========
  useEffect(() => {
    if (!isAuthenticated || !isEditMode) return;

    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const cart = await getMyCart(token);

        const item = (cart.items ?? []).find((it: any) => String(it.id) === String(itemId));
        if (!item) return;

        const comps: Record<string, string> = item.components ?? {};

        const entries = await Promise.all(
            Object.entries(comps).map(async ([componentKey, sku]) => {
              try {
                const p = await getProductBySkuPublic(sku);
                return [componentKey, p] as const;
              } catch {
                return [componentKey, null] as const;
              }
            })
        );

        const nextSelected: Record<string, Product> = {};
        for (const [componentKey, product] of entries) {
          if (product) nextSelected[componentKey] = product;
        }

        // ✅ preload gana por sobre draft (y después se guarda en sessionStorage)
        setSelectedByComponent(nextSelected);

        if (nextSelected[CASE_COMPONENT_SKU]) {
          setSelectedComponentSku(CASE_COMPONENT_SKU);
        }
      } catch (e) {
        console.error("failed to preload custom pc from cart item", e);
      }
    })();
  }, [isAuthenticated, isEditMode, itemId, getAccessTokenSilently]);

  // ========= Cargar productos según componente seleccionado =========
  useEffect(() => {
    if (!selectedComponentSku) {
      setProducts([]);
      return;
    }

    setProducts([]);
    (async () => {
      const data = await getProductsByComponentPrefix(selectedComponentSku);
      const filtered = data.filter((p: any) => (p.stock ?? 0) > 0);
      setProducts(filtered);
      setComponentCounts((prev) => ({ ...prev, [selectedComponentSku]: filtered.length }));
    })();
  }, [selectedComponentSku]);

  // ========= Agregar producto seleccionado =========
  async function addSelectedProduct(product: Product) {
    if (!selectedComponentSku) return;

    setSelectedByComponent((prev) => {
      const next = { ...prev };

      if (MULTI_BASES.has(selectedComponentSku)) {
        const maxSlots = selectedComponentSku === "RAM" ? RAM_SLOTS : SD_SLOTS;

        let placed = false;
        for (let i = 1; i <= maxSlots; i++) {
          const key = slotKey(selectedComponentSku, i);
          if (!next[key]) {
            next[key] = product; // permite duplicados por slots
            placed = true;
            break;
          }
        }

        if (!placed) {
          alert(`No hay más espacio para ${selectedComponentSku}. Máximo: ${maxSlots}`);
        }
        return next;
      }

      next[selectedComponentSku] = product;
      return next;
    });
  }

  async function handleSave() {
    if (!isAuthenticated) {
      await loginWithRedirect();
      return;
    }

    if (!selectedByComponent[CASE_COMPONENT_SKU]) {
      alert("Custom PC requires CASE");
      return;
    }

    setAdding(true);
    try {
      const token = await getAccessTokenSilently();

      if (isEditMode) {
        await replaceCartItemComponents(token, itemId!, componentsPayload);
        alert("PC updated!");
      } else {
        await addCartItem(token, {
          productSku: CUSTOM_PC_SKU,
          quantity: 1,
          components: componentsPayload,
        });

        // limpiar draft al guardar si querés:
        sessionStorage.removeItem(DRAFT_KEY);

        setSelectedByComponent({});
        setSelectedComponentSku("");
        setProducts([]);
        setComponentCounts({});
        alert("Custom PC added to cart!");
      }
    } catch (e) {
      console.error(e);
      alert("Could not save PC");
    } finally {
      setAdding(false);
    }
  }

  async function replaceCartItemComponents(token: string, itemId: string, components: Record<string, string>) {
    return fetchWithAuth(`http://localhost:8080/carts/me/items/${itemId}/components/bulk`, token, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ components }),
    });
  }

  const selectedComponentName = useMemo(() => {
    const found = components.find((c) => c.skuPrefix === selectedComponentSku);
    return found?.displayName ?? "";
  }, [components, selectedComponentSku]);

  const canAddCustomPc = !!selectedByComponent[CASE_COMPONENT_SKU];

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen p-6 flex items-center justify-center">
          <button className="rounded-xl border px-4 py-2" onClick={() => loginWithRedirect()}>
            Login to use Builder
          </button>
        </div>
    );
  }

  return (
      <div className="min-h-screen w-full p-6">
        <div className="mx-auto max-w-350 flex gap-6 items-start">
          <ComponentsSidebar
              components={components}
              selectedSku={selectedComponentSku}
              onSelect={setSelectedComponentSku}
              counts={componentCounts}
          />

          <div className="flex-1 space-y-3 min-w-0">
            <div className="rounded-2xl border p-4">
              <h2 className="text-lg font-semibold">
                {selectedComponentSku ? `Available products for: ${selectedComponentName}` : "Pick a component to see products"}
              </h2>
              <p className="text-sm opacity-70">
                {selectedComponentSku ? `Filtered by ${selectedComponentSku}` : "Click a component on the left."}
              </p>
              <p className="text-sm opacity-70">{products.length} products available</p>

              {(selectedComponentSku === "RAM" || selectedComponentSku === "SD") && (
                  <p className="text-sm opacity-70 mt-1">
                    {selectedComponentSku === "RAM" ? `Slots: ${RAM_SLOTS}` : `Slots: ${SD_SLOTS}`}
                  </p>
              )}
            </div>

            <ProductList products={products} onSelect={addSelectedProduct} />
          </div>

          <div className="w-105 shrink-0 space-y-3">
            <ProductsSelectedPanel
                selectedItems={selectedItems}
                onRemove={(componentKey) => {
                  setSelectedByComponent((prev) => {
                    const next = { ...prev };
                    delete next[componentKey];
                    return next;
                  });
                }}
                returnTo={returnTo}
                builderState={{
                  components: componentsPayload,
                  selectedComponentSku,
                  isEditMode,
                  itemId,
                }}
            />

            <div className="rounded-2xl border p-4">
              {!canAddCustomPc && (
                  <p className="text-sm opacity-80 mb-3">
                    You have to select a <span className="font-semibold">case</span> to add the PC.
                  </p>
              )}

              <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl"
                  onClick={handleSave}
                  disabled={adding || !canAddCustomPc}
              >
                {adding ? "Saving..." : isEditMode ? "Save changes" : "Add custom PC to cart"}
              </Button>

            </div>
          </div>
        </div>
      </div>
  );
}