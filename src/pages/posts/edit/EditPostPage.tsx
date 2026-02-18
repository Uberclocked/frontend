import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PostForm from "@/components/PostForm";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/api";
import { getPostById, updatePost } from "@/services/Market";
import type { PostResponseDto, UUID } from "@/types/Market";

type UserDataDto = {
    id: UUID;
    userName: string;
    email: string;
    country: string;
    cellPhone: string;
};

export default function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    const [post, setPost] = useState<PostResponseDto | null>(null);
    const [myUserId, setMyUserId] = useState<UUID | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setMyUserId(null);
            return;
        }

        (async () => {
            const token = await getAccessTokenSilently();
            const me = await fetchWithAuth<UserDataDto>("http://localhost:8080/me", token);
            setMyUserId(me.id);
        })();
    }, [isAuthenticated, getAccessTokenSilently]);

    // cargar post
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        if (!id) return;

        (async () => {
            setLoading(true);
            try {
                const token = await getAccessTokenSilently();
                const p = await getPostById(token, id);
                setPost(p);
            } catch (e: any) {
                alert(e.message ?? "Error loading post");
                setPost(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated, id, getAccessTokenSilently]);

    const isOwner = useMemo(() => {
        if (!post || !myUserId) return false;
        return post.sellerId === myUserId;
    }, [post, myUserId]);

    async function onSubmit(values: { title: string; description: string; price: number; category: string }) {
        if (!id) return;
        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            await updatePost(token, id, values);
            alert("Post updated!");
            navigate(`/posts/${id}`);
        } catch (e: any) {
            alert(e.message ?? "Could not update post");
        } finally {
            setSaving(false);
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Button onClick={() => loginWithRedirect()}>Login to edit post</Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <p>Post not found</p>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="rounded-2xl border p-6 max-w-xl w-full space-y-3">
                    <p className="font-semibold text-lg">Forbidden</p>
                    <p className="opacity-80">You can only edit your own posts.</p>
                    <Button asChild variant="outline">
                        <Link to={`/posts/${post.id}`}>Back to post</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 flex justify-center">
            <div className="w-full max-w-md space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Edit Post</h1>
                    <Button asChild variant="outline">
                        <Link to={`/posts/${post.id}`}>Cancel</Link>
                    </Button>
                </div>

                <PostForm
                    mode="edit"
                    initialValues={{
                        title: post.title ?? "",
                        description: post.description ?? "",
                        price: Number(post.price ?? 0),
                        category: post.category ?? "",
                    }}
                    onSubmit={async (values) => onSubmit(values)}
                    submitting={saving}
                />
            </div>
        </div>
    );
}
