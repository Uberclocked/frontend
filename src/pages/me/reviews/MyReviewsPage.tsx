import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteReview, updateReview } from "@/services/Review.ts";
import type { ReviewResponseDto } from "@/types/Review";
import { MyReviewCard } from "@/components/common/reviews/card/MyReviewCards";
import { useMyReviews, useMyProductsBySku } from "./MyReviewsPage.hooks";

export default function MyReviewsPage() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { getAccessTokenSilently } = useAuth0();
  const { reviews, loading, reload } = useMyReviews();
  const productsBySku = useMyProductsBySku(reviews);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStars, setEditStars] = useState<number>(5);
  const [editMessage, setEditMessage] = useState<string>("");

  const startEdit = (r: ReviewResponseDto) => {
    setEditingId(String(r.id));
    setEditStars(r.qualification);
    setEditMessage(r.message ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    const token = await getAccessTokenSilently();
    await updateReview(token, id, { qualification: editStars, message: editMessage });
    setEditingId(null);
    await reload();
  };

  const remove = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this review?");
    if (!ok) return;

    const token = await getAccessTokenSilently();
    await deleteReview(token, id);
    await reload();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => loginWithRedirect()}>Login to view your reviews</Button>
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

  if (reviews.length === 0) {
    return (
      <div className="min-w-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border p-6">
            <p>You have not posted any reviews yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-screen p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <MyReviewCard
          reviews={reviews}
          productsBySku={productsBySku}
          editingId={editingId}
          editStars={editStars}
          setEditStars={setEditStars}
          editMessage={editMessage}
          setEditMessage={setEditMessage}
          startEdit={startEdit}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          remove={remove}
        />
      </div>
    </div>
  );
}
