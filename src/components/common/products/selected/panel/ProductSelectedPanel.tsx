import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { Product } from "@/types/Entities.ts";

import { calculateTotalCost } from "./ProductSelectedPanel.utils";

export type SelectedItem = { key: string; product: Product };

export type Props = {
    selectedItems: SelectedItem[];
    onRemove?: (componentKey: string) => void;

    returnTo?: string;
    builderState?: {
        components: Record<string, string>;
        selectedComponentSku?: string;
        isEditMode?: boolean;
        itemId?: string;
    };
};

function getProductIdForRoute(p: any) {
    return p?.id ?? p?.skuPrefix ?? p?.sku ?? "";
}

export default function ProductsSelectedPanel({ selectedItems, onRemove, returnTo, builderState }: Props) {
    const navigate = useNavigate();
    const products = selectedItems.map((x) => x.product);

    return (
        <div className="flex flex-col justify-between flex-2 rounded-xl h-full border p-4">
            <h1 className="font-semibold">Items List</h1>

            <div className="mt-3 overflow-y-auto flex-1 space-y-2">
                {selectedItems.length === 0 ? (
                    <p className="text-sm opacity-70">No components selected</p>
                ) : (
                    selectedItems.map(({ key, product }) => {
                        const routeId = getProductIdForRoute(product);

                        return (
                            <div
                                key={key}
                                role="button"
                                tabIndex={0}
                                className="flex items-center justify-between gap-3 rounded-xl border p-2 cursor-pointer hover:bg-muted/40"
                                onClick={() =>
                                    navigate(`/products/${routeId}`, {
                                        state: { returnTo, builderState },
                                    })
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        navigate(`/products/${routeId}`, { state: { returnTo, builderState } });
                                    }
                                }}
                            >
                                <div className="min-w-0">
                                    <p className="truncate">{product.name}</p>
                                    <p className="text-sm opacity-70">${Number(product.price ?? 0).toFixed(2)}</p>
                                </div>

                                {onRemove && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(key);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">Total price</p>
                <p className="font-semibold">${calculateTotalCost(products)}</p>
            </div>
        </div>
    );
}