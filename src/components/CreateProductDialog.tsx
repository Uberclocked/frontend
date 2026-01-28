import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { fetchWithAuth } from "../services/api";

type FieldType = "STRING" | "INTEGER" | "DECIMAL" | "BOOLEAN" | "DATE";

interface ComponentDto {
    skuPrefix: string;
    displayName: string;
    fields: Record<
        string,
        {
            type: FieldType;
            required: boolean;
            defaultValue: string | null;
        }
    >;
}

export default function CreateProductDialog({ onCreated }: { onCreated: () => void }) {
    const { getAccessTokenSilently } = useAuth0();

    const [components, setComponents] = useState<ComponentDto[]>([]);
    const [component, setComponent] = useState<ComponentDto | null>(null);
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);

    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);

    useEffect(() => {
        (async () => {
            const token = await getAccessTokenSilently();
            const data = await fetchWithAuth<ComponentDto[]>(
                "http://localhost:8080/components",
                token
            );
            setComponents(data);
        })();
    }, []);

    async function handleCreate() {
        if (!component) return alert("Component required");

        for (const [k, f] of Object.entries(component.fields)) {
            if (f.required && !attributes[k]) {
                return alert(`Field '${k}' is required`);
            }
        }

        const token = await getAccessTokenSilently();
        const formData = new FormData();
        formData.append("sku", sku);
        formData.append("name", name);
        formData.append("price", price.toString());
        formData.append("stock", stock.toString());
        formData.append("componentSkuPrefix", component.skuPrefix);
        formData.append("attributes", JSON.stringify(attributes));

        if (file) {
            formData.append("image", file);
        }

        await fetch("http://localhost:8080/products", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        onCreated();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-[#FF8000]">New Product</Button>
            </DialogTrigger>

            <DialogContent className="bg-[#36454F] text-[#F5F5DC] border-none max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create Product</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="SKU"
                    onChange={e => setSku(e.target.value)}
                    className="bg-[#2b3740] text-[#F5F5DC] border-none focus:ring-0"                />
                <Input
                    placeholder="Name"
                    onChange={e => setName(e.target.value)}
                    className="bg-[#2b3740] text-[#F5F5DC] border-none focus:ring-0"                />
                <Input
                    type="number"
                    value={price}
                    onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        setPrice(Number(val));
                    }}
                    className="bg-[#2b3740] text-[#F5F5DC] border-none focus:ring-0"
                    inputMode="decimal"
                />
                <Input
                    type="number"
                    value={stock}
                    onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setStock(Number(val));
                    }}
                    className="bg-[#2b3740] text-[#F5F5DC] border-none focus:ring-0"
                    inputMode="numeric"
                />

                <Select
                    value={component?.skuPrefix}
                    onValueChange={v => {
                        const c = components.find(c => c.skuPrefix === v)!;
                        setComponent(c);
                        setAttributes({});
                    }}
                >
                    <SelectTrigger className="bg-[#2b3740] text-[#F5F5DC] border-none focus:ring-0">
                        <SelectValue placeholder="Select Component" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2b3740] text-[#F5F5DC]">
                        {components.map(c => (
                            <SelectItem key={c.skuPrefix} value={c.skuPrefix}>
                                {c.displayName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {component && (
                    <div className="mt-4 space-y-3">
                        {Object.entries(component.fields).map(([fieldName, f]) => {
                            const value =
                                attributes[fieldName] ??
                                f.defaultValue ??
                                "";

                            return (
                                <div key={fieldName} className="flex flex-col gap-1">
                                    <label className="text-sm text-[#F5F5DC]">
                                        {fieldName}
                                        {f.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>

                                    <Input
                                        type={
                                            f.type === "INTEGER" || f.type === "DECIMAL"
                                                ? "number"
                                                : f.type === "DATE"
                                                    ? "date"
                                                    : "text"
                                        }
                                        value={value}
                                        onChange={e =>
                                            setAttributes(a => ({
                                                ...a,
                                                [fieldName]: e.target.value,
                                            }))
                                        }
                                        className="bg-[#2b3740] text-[#F5F5DC] border-none focus:ring-0"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                <Input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                        if (e.target.files?.[0]) setFile(e.target.files[0]);
                    }}
                    className="border-none focus:ring-0"
                />

                <Button onClick={handleCreate} className="bg-[#FF8000] w-full mt-4">
                    Create
                </Button>
            </DialogContent>
        </Dialog>
    );
}