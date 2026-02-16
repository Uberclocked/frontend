import { useAuth0 } from "@auth0/auth0-react";
import { useMyPosts } from "./MyPosts.hooks";
import MyPostCard from "@/components/common/post/my/card/MyPostCard";
import MyPostsHeader from "@/components/common/post/my/header/MyPostsHeader";

const shell = "min-w-screen p-6";

export default function MyPosts() {
  const { getAccessTokenSilently } = useAuth0();
  const { filteredPosts, q, setQ, busyId, markSold, remove } = useMyPosts(getAccessTokenSilently);

  return (
    <div className={shell}>
      <div className="mx-auto max-w-5xl space-y-4">
        <MyPostsHeader q={q} setQ={setQ} />
        {filteredPosts.length === 0 ? (
          <p>You don't have posts yet.</p>
        ) : (
          <div className="grid gap-4">
            {filteredPosts.map((p) => (
              <MyPostCard post={p} busyId={busyId} markSold={markSold} remove={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
