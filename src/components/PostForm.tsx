import { useMemo, useState } from "react";

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
import { useAuth0 } from "@auth0/auth0-react";
import type { Component } from "@/pages/builder/types/Component";

interface Props {
  components: Component[]
}

function sanitizePriceInput(raw: string) {
  let v = raw.replace(/[^\d.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  const [intPart, decPart] = v.split(".");
  if (decPart !== undefined) v = intPart + "." + decPart.slice(0, 2);
  return v;
}

export default function PostForm({ components }: Props) {
  const { getAccessTokenSilently } = useAuth0(); // <-- top level
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Component | null>(components[0]);
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const field =
    "border" +
    "outline-none ring-0 " +
    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none";

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

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

    if (!category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    try {
      const token = await getAccessTokenSilently(); // use here safely

      await createPost(
        token,
        {
          title: title.trim(),
          component: category.display_name,
          price: numericPrice,
          description: description.trim(),
        },
        imageFile,
      );

      alert("Post created!");
      setTitle("");
      setCategory(null);
      setPrice("");
      setDescription("");
      setImageFile(null);
    } catch (err: any) {
      setError(err.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-h-full w-full max-w-md rounded-2xl border p-5 overflow-scroll">
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
          <Select
            value={category?.id ?? ""}
            onValueChange={(v) => {
              const found = components.find((c) => c.id === v);
              setCategory(found ?? null);
            }}
          >
            <SelectTrigger className={`${field} h-9`}>
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>

            <SelectContent className="border">
              {components.map((component) => (
                <SelectItem
                  key={component.id}
                  value={component.id} // match this with onValueChange
                >
                  {component.display_name}
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
                  className="h-8"
                  onClick={() => setImageFile(null)}
                >
                  Remove image
                </Button>
              </div>
            </div>
          )}
        </div>

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

        {error && <p className="text-xs">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {loading ? "Creating..." : "Create Post"}
        </Button>
      </form>
    </Card>
  );
}
