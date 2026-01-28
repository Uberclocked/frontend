import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import type {PostDto} from "@/types/PostDto.ts";

import { postService } from "../../services/postService.ts";

export default function MyPosts() {
    const { getAccessTokenSilently } = useAuth0();
    const [posts, setPosts] = useState<PostDto[]>([]);

    useEffect(() => {
        async function load() {
            const token = await getAccessTokenSilently();
            const data = await postService.getMine(token);
            setPosts(data);
        }

        load();
    }, [getAccessTokenSilently]);

    async function markSold(id: string) {
        const token = await getAccessTokenSilently();
        await postService.markAsSold(id, token);
        alert("Marked as sold");
    }

    async function remove(id: string) {
        const token = await getAccessTokenSilently();
        await postService.delete(id, token);
        setPosts(posts.filter(p => p.id !== id));
    }

    return (
        <div style={{ padding: 32 }}>
            <h1>My Posts</h1>

            {posts.map(post => (
                <div key={post.id} style={{ border: "1px solid #ccc", padding: 12 }}>
                    <h3>{post.title}</h3>
                    <strong>${post.price}</strong>

                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button onClick={() => markSold(post.id)}>Mark as sold</button>
                        <button onClick={() => remove(post.id)}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
