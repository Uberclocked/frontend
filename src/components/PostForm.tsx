import { useState } from "react";

import { postService } from "../services/postService";

interface Props {
    token: string;
    onSuccess?: () => void;
}

export default function PostForm({ token, onSuccess }: Props) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await postService.create(
                { ...form, price: Number(form.price) },
                token
            );
            alert("Post created!");
            setForm({ title: "", description: "", price: 0 });
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || "Error creating post");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}
        >
            <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
            />

            <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
            />

            <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                required
            />

            {error && <span style={{ color: "red" }}>{error}</span>}

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Post"}
            </button>
        </form>
    );
}
