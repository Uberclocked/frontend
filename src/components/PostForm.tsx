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
import { marketApi } from "@/services/Market";

interface Props {
    token: string;
    onSuccess?: () => void;
}

type SlotKey =
    | "CPU"
    | "MOTHERBOARD"
    | "COOLER"
    | "RAM"
    | "GPU"
    | "SD"
    | "PSU"
    | "CASE";

type Slot = { key: SlotKey; label: string; componentSkuPrefix: string };

const SLOTS: Slot[] = [
    { key: "CPU", label: "CPU", componentSkuPrefix: "CPU" },
    { key: "MOTHERBOARD", label: "Motherboard", componentSkuPrefix: "MOTHERBOARD" },
    { key: "COOLER", label: "Cooler", componentSkuPrefix: "COOL" },
    { key: "RAM", label: "RAM", componentSkuPrefix: "RAM" },
    { key: "GPU", label: "GPU", componentSkuPrefix: "GPU" },
    { key: "SD", label: "Storage", componentSkuPrefix: "SD" },
    { key: "PSU", label: "Power Supply", componentSkuPrefix: "PSU" },
    { key: "CASE", label: "Case", componentSkuPrefix: "CASE" },
];

function sanitizePriceInput(raw: string) {
    let v = raw.replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    const [intPart, decPart] = v.split(".");
    if (decPart !== undefined) v = intPart + "." + decPart.slice(0, 2);
    return v;
}

export default function PostForm({ token, onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<SlotKey | "">("");
    const [price, setPrice] = useState<string>("");
    const [description, setDescription] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const field =
        "bg-gray-950 text-[#F5F5DC] border border-gray-800 " +
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
            await marketApi.createPost(token, {
                title: title.trim(),
                category,
                price: numericPrice,
                description: description.trim(),
            }, imageFile);

            alert("Post created!");
            setTitle("");
            setCategory("");
            setPrice("");
            setDescription("");
            setImageFile(null);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || "Error creating post");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="grid gap-1.5">
                    <Label className="text-[#F5F5DC] text-sm">Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`${field} h-9`}
                        placeholder="Title"
                        required
                    />
                </div>

                <div className="grid gap-1.5">
                    <Label className="text-[#F5F5DC] text-sm">Category</Label>

                    <Select value={category} onValueChange={(v) => setCategory(v as SlotKey)}>
                        <SelectTrigger className={`${field} h-9`}>
                            <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>

                        <SelectContent className="bg-gray-950 border border-gray-800 text-[#F5F5DC]">
                            {SLOTS.map((s) => (
                                <SelectItem
                                    key={s.key}
                                    value={s.key}
                                    className="focus:bg-gray-900 focus:text-[#F5F5DC]"
                                >
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-1.5">
                    <Label className="text-[#F5F5DC] text-sm">Price</Label>
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
                    <Label className="text-[#F5F5DC] text-sm">Image (optional)</Label>

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
                        <div className="mt-2 rounded-2xl border border-gray-800 bg-gray-950 p-3">
                            <img
                                src={previewUrl}
                                alt="preview"
                                className="h-40 w-full object-contain rounded-xl"
                            />
                            <div className="mt-2 flex justify-end">
                                <Button
                                    type="button"
                                    className="bg-[#FF8000] text-black hover:bg-[#e67300] h-8"
                                    onClick={() => setImageFile(null)}
                                >
                                    Remove image
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-1.5">
                    <Label className="text-[#F5F5DC] text-sm">Description</Label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`${field} min-h-30`}
                        placeholder="Description"
                        rows={5}
                        required
                    />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <Button
                    type="submit"
                    disabled={loading}
                    className="h-9 bg-[#FF8000] text-black hover:bg-[#e67300] focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                    {loading ? "Creating..." : "Create Post"}
                </Button>
            </form>
        </Card>
    );
}