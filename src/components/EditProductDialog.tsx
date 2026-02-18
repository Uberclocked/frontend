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
import type { Product } from "../types/Entities.ts";


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

export default function EditProductDialog({
  product,
  onUpdated,
}: {
  product: Product;
  onUpdated: () => void;
}) {
  const { getAccessTokenSilently } = useAuth0();

  const [components, setComponents] = useState<ComponentDto[]>([]);
  const [component, setComponent] = useState<ComponentDto | null>(null);

  const [sku] = useState(product.skuPrefix);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [attributes, setAttributes] = useState<Record<string, string>>(product.attributes ?? {});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getAccessTokenSilently();
      const data = await fetchWithAuth<ComponentDto[]>(
        "http://localhost:8080/components",
        token
      );
      setComponents(data);

      const c = data.find(c => c.skuPrefix === product.component.skuPrefix);
      if (c) setComponent(c);
    })();
  }, []);

  async function handleUpdate() {
    if (!component) return alert("Component required");

    for (const [k, f] of Object.entries(component.fields)) {
      if (f.required && !attributes[k]) return alert(`Field '${k}' is required`);
    }

    const token = await getAccessTokenSilently();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("componentSkuPrefix", component.skuPrefix);
    formData.append("attributes", JSON.stringify(attributes));

    if (file) formData.append("image", file);

    await fetch(`http://localhost:8080/products/${sku}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    onUpdated();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-[14px] px-3 py-1 rounded-lg transition">
          Modify
        </button>
      </DialogTrigger>

      <DialogContent className="border-none max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modify Product</DialogTitle>
        </DialogHeader>

        <Input
          value={sku}
          disabled
          className="border-none focus:ring-0"
        />
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          className="border-none focus:ring-0"
        />

        <Input
          type="number"
          value={price}
          onChange={e => setPrice(Number(e.target.value.replace(/[^0-9.]/g, "")))}
          className="border-none focus:ring-0"
          inputMode="decimal"
        />

        <Input
          type="number"
          value={stock}
          onChange={e => setStock(Number(e.target.value.replace(/[^0-9]/g, "")))}
          className="border-none focus:ring-0"
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
          <SelectTrigger className="border-none focus:ring-0">
            <SelectValue placeholder="Component" />
          </SelectTrigger>
          <SelectContent className="border bg-background text-foreground shadow-md backdrop-blur-none">
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
                  <label className="text-sm">
                    {fieldName}
                    {f.required && <span className="ml-1">*</span>}
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
                    className="border-none focus:ring-0"
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
        />

        <Button onClick={handleUpdate} className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
