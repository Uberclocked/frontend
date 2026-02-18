import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/services/Market";
import { fetchWithAuth } from "@/services/api.ts";

type ComponentDto = { skuPrefix: string; displayName: string };

export type PostFormValues = {
  title: string;
  description: string;
  price: number;
  category: string;
};

type Props = {
  mode?: "create" | "edit";
  initialValues?: Partial<PostFormValues>;
  submitting?: boolean;
  onSubmit?: (values: PostFormValues, imageFile: File | null) => Promise<void> | void;
};

function sanitizePriceInput(raw: string) {
  let v = raw.replace(/[^\d.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  const [intPart, decPart] = v.split(".");
  if (decPart !== undefined) v = intPart + "." + decPart.slice(0, 2);
  return v;
}

export default function PostForm({
                                   mode = "create",
                                   initialValues,
                                   onSubmit,
                                   submitting = false,
                                 }: Props) {
  const { getAccessTokenSilently } = useAuth0();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [components, setComponents] = useState<ComponentDto[]>([]);

  // en vez de guardar el objeto entero, guardamos el skuPrefix elegido
  const [categorySku, setCategorySku] = useState(initialValues?.category ?? "");

  const [price, setPrice] = useState<string>(
      typeof initialValues?.price === "number" ? String(initialValues.price) : ""
  );
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit") setImageFile(null);
  }, [mode]);

  // si cambian initialValues (cuando termina de cargar el post), sincronizamos el estado
  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setPrice(typeof initialValues?.price === "number" ? String(initialValues.price) : "");
    setCategorySku(initialValues?.category ?? "");
    // NO reseteo imageFile: el usuario decide si subir una nueva
  }, [initialValues?.title, initialValues?.description, initialValues?.price, initialValues?.category]);

  const field =
      "border " +
      "outline-none ring-0 " +
      "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none";

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  // cargar categorías
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchWithAuth<ComponentDto[]>("http://localhost:8080/components", token);
        setComponents(data);

        // si no hay categorySku (create), usar la primera
        // si hay (edit), respetarla (y si no existe, fallback a primera)
        if (!categorySku) {
          setCategorySku(data[0]?.skuPrefix ?? "");
        } else {
          const exists = data.some((c) => c.skuPrefix === categorySku);
          if (!exists) setCategorySku(data[0]?.skuPrefix ?? "");
        }
      } catch (e: any) {
        console.error(e);
        setComponents([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAccessTokenSilently]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const numericPrice = Number(price);

    if (price.trim() === "" || Number.isNaN(numericPrice) || numericPrice < 0) {
      setError("Price must be a positive number");
      setLoading(false);
      return;
    }

    if (!categorySku) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    const values: PostFormValues = {
      title: title.trim(),
      description: description.trim(),
      price: numericPrice,
      category: categorySku, // ✅ backend espera "category"
    };

    try {
      const token = await getAccessTokenSilently();

      if (onSubmit) {
        // ✅ modo edit usa onSubmit (PATCH)
        await onSubmit(values, imageFile);
      } else {
        // ✅ modo create por defecto
        await createPost(token, values, imageFile);
        alert("Post created!");

        // reset solo en create
        if (mode === "create") {
          setTitle("");
          setDescription("");
          setPrice("");
          setCategorySku(components[0]?.skuPrefix ?? "");
          setImageFile(null);
        }
      }
    } catch (err: any) {
      setError(err.message || (mode === "edit" ? "Error updating post" : "Error creating post"));
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || submitting;

  return (
      <Card className="max-h-full w-full max-w-md rounded-2xl border p-5 overflow-auto">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-sm">Title</Label>
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`${field} h-9`}
                placeholder="Title"
                required
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Category</Label>
            <Select value={categorySku} onValueChange={setCategorySku}>
              <SelectTrigger className={`${field} h-9`}>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>

              <SelectContent className="border bg-background text-foreground shadow-md backdrop-blur-none">
                {components.map((c) => (
                    <SelectItem key={c.skuPrefix} value={c.skuPrefix}>
                      {c.displayName}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-sm">Price</Label>
            <Input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(sanitizePriceInput(e.target.value))}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  e.preventDefault();
                  setPrice(sanitizePriceInput(text));
                }}
                className={`${field} h-9`}
                placeholder="0.00"
                required
            />
          </div>

          {mode === "create" && (
              <div className="grid gap-1.5">
                <Label className="text-sm">Image (optional)</Label>

                <Input
                    type="file"
                    accept="image/*"
                    className={`${field} h-9 pt-1`}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (!f) return setImageFile(null);

                      const maxBytes = 2 * 1024 * 1024;
                      if (f.size > maxBytes) {
                        setError("Image too large (max 2MB)");
                        e.currentTarget.value = "";
                        setImageFile(null);
                        return;
                      }

                      setImageFile(f);
                    }}
                />

                {previewUrl && (
                    <div className="mt-2 rounded-2xl border p-3">
                      <img
                          src={previewUrl}
                          alt="preview"
                          className="h-40 w-full object-contain rounded-xl"
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                            type="button"
                            className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                            onClick={() => setImageFile(null)}
                        >
                          Remove image
                        </Button>
                      </div>
                    </div>
                )}
              </div>
          )}

          <div className="grid gap-1.5">
            <Label className="text-sm">Description</Label>
            <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${field} min-h-30`}
                placeholder="Description"
                rows={5}
                required
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" disabled={busy} className="h-9 bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0">
            {busy ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save changes" : "Create Post"}
          </Button>
        </form>
      </Card>
  );
}

