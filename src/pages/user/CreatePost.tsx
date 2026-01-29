import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import PostForm from "@/components/PostForm";
import { Button } from "@/components/ui/button";

export default function CreatePostPage() {
    const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
    const [token, setToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);

    async function loadToken() {
        setTokenError(null);
        try {
            const t = await getAccessTokenSilently({
            });
            setToken(t);
        } catch (e: any) {
            setToken(null);
            setTokenError(e?.message ?? "Could not get token");
        }
    }

    useEffect(() => {
        if (!isAuthenticated) return;
        void loadToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
                <p className="text-[#F5F5DC]">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
                <Button
                    onClick={() =>
                        loginWithRedirect({
                            authorizationParams: { redirect_uri: window.location.origin + "/posts/create" },
                        })
                    }
                    className="bg-[#FF8000] text-black hover:bg-[#e67300] focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                    Login to create a post
                </Button>
            </div>
        );
    }

    if (tokenError) {
        return (
            <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
                <div className="w-full max-w-md space-y-3">
                    <p className="text-red-400 text-sm">{tokenError}</p>
                    <Button
                        onClick={loadToken}
                        className="bg-[#FF8000] text-black hover:bg-[#e67300] focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
                <p className="text-[#F5F5DC]">Preparing session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
            <div className="w-full max-w-md space-y-4">
                <h1 className="text-3xl font-bold text-[#FF8000]">Create Post</h1>
                <PostForm token={token} />
            </div>
        </div>
    );
}

