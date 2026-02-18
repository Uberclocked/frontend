import ProtectedRoute from "@/components/ProtectedRoute";
import CreatePostPage from "@/pages/posts/create/CreatePost";
import PostsFeed from "@/pages/posts/PostsFeed";
import PostsFeedErrorPage from "@/pages/posts/PostsFeed.error";
import { postsFeedLoader } from "@/pages/posts/PostsFeed.load";
import PostDetailPage from "@/pages/posts/:id/PostDetailPage";
import type { RouteObject } from "react-router-dom";
import MyPosts from "@/pages/me/posts/MyPosts";
import { CreatePostPageLoader } from "@/pages/posts/create/CreatePost.loader";
import EditPostPage from "@/pages/posts/edit/EditPostPage.tsx";

export const postsRoutes: RouteObject = {
  path: "posts",
  children: [
    { index: true, loader: postsFeedLoader, element: <PostsFeed />, errorElement: <PostsFeedErrorPage /> },
    { path: ":id", element: <PostDetailPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        { path: "create", loader: CreatePostPageLoader, element: <CreatePostPage /> },
        { path: "me", element: <MyPosts /> },
        { path: ":id/edit", element: <EditPostPage /> },
      ],
    },
  ],
}
