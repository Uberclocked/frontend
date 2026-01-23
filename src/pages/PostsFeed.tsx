import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import { postService } from "../services/postService";
import type { PostDto } from "../types/PostDto";

export default function PostsFeed() {
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        async function load() {
            try {
                const data = await postService.getAll();
                setPosts(data);
            } catch (e) {
                setError("Error loading marketplace");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function markInterest(id: string) {
        if (!isAuthenticated) {
            alert("You must login first");
            return;
        }

        const token = await getAccessTokenSilently();
        await postService.markInterest(id, token);
        alert("Interest marked!");
    }

    async function buyInfo(id: string) {
        if (!isAuthenticated) {
            alert("You must login first");
            return;
        }

        const token = await getAccessTokenSilently();
        const seller = await postService.buySellerInfo(id, token);

        alert(
            `Seller contact:\nUserName: ${seller.userName}\nEmail: ${seller.email}\nPhone: ${seller.cellPhone ?? "Not provided"}`
        );
    }

    if (loading) return <p>Loading marketplace...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: 32, maxWidth: 900, margin: "auto" }}>
            <h1>Marketplace</h1>

            {posts.length === 0 && <p>No posts available</p>}

            {posts.map(post => (
                <div
                    key={post.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 16,
                        marginBottom: 12,
                        borderRadius: 6,
                    }}
                >
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <strong>${post.price}</strong>

                    {!post.sold ? (
                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                            <button onClick={() => markInterest(post.id)}>
                                I'm interested
                            </button>

                            <button onClick={() => buyInfo(post.id)}>
                                Buy contact
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: "green", marginTop: 8 }}>
                            SOLD
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
