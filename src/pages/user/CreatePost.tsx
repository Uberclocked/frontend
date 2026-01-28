import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import PostForm from "../../components/PostForm.tsx";

export default function CreatePostPage() {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        getAccessTokenSilently().then(setToken);
    }, [isAuthenticated, getAccessTokenSilently]);

    if (!token) return <p>Loading auth...</p>;

    return (
        <div style={{ padding: 32 }}>
            <h1>Create Post</h1>
            <PostForm token={token} />
        </div>
    );
}
