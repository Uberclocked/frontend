import PostForm from "@/components/PostForm";


export default function CreatePostPage() {
    return (
        <div className="max-h-full min-w-screen p-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Create Post</h1>
            <PostForm />
        </div>
    );
}

