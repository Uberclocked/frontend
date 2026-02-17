import { useMemo} from "react";

import { Card } from "@/components/ui/card";
import type { ComponentDto } from "@/services/component";

type Props = {
    components: ComponentDto[];
    selectedSku: string;
    onSelect: (skuPrefix: string) => void;
    counts: Record<string, number>;
};

export default function ComponentsSidebar({ components, selectedSku, onSelect, counts }: Props) {
    const items = useMemo(() => components, [components]);

    return (
        <Card className="w-105 shrink-0 rounded-2xl border p-5 self-start h-fit">
            <h2 className="text-xl font-semibold">Components</h2>

            <div className="mt-4 grid grid-cols-2 gap-4">
                {items.map((c) => {
                    const isSelected = selectedSku === c.skuPrefix;

                    return (
                        <div key={c.skuPrefix} className="col-span-1">
                            <button
                                type="button"
                                onClick={() => onSelect(c.skuPrefix)}
                                className={[
                                    "w-full rounded-2xl border p-4 text-left transition",
                                    "min-h-23",
                                    isSelected ? "border-primary" : "hover:bg-muted",
                                ].join(" ")}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="font-semibold truncate">{c.displayName}</div>
                                        <div className="mt-1 text-xs opacity-60 truncate">{c.skuPrefix}</div>
                                        {counts?.[c.skuPrefix] != null && (
                                            <div className="mt-1 text-xs opacity-70">{counts[c.skuPrefix]} products</div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}