import PostForm from "@/components/PostForm";
import type { Component } from "@/pages/builder/types/Component";
import { useLoaderData } from "react-router-dom";

export default function CreatePostPage() {
  const { components } = useLoaderData() as { components: Component[] }
  return (
    <div className="max-h-full min-w-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Create Post</h1>
      <PostForm components={components} />
    </div>
  );
}

