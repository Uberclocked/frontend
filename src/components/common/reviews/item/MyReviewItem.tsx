import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/Entities";
import type { ReviewResponseDto } from "@/types/Review";

interface MyReviewItemProps {
  review: ReviewResponseDto;
  product?: Product | null;
  editingId: string | null;
  editStars: number;
  setEditStars: (n: number) => void;
  editMessage: string;
  setEditMessage: (msg: string) => void;
  startEdit: (r: ReviewResponseDto) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  remove: (id: string) => void;
}

export function MyReviewItem({
  review,
  product,
  editingId,
  editStars,
  setEditStars,
  editMessage,
  setEditMessage,
  startEdit,
  saveEdit,
  cancelEdit,
  remove
}: MyReviewItemProps) {
  const id = String(review.id);
  const isEditing = editingId === id;
  const imageSrc = product?.image ? `data:image/jpeg;base64,${product.image}` : "/placeholder.png";

  return (
    <div key={id} className="rounded-2xl border p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-28 shrink-0">
            <div className="rounded-2xl bg-white p-2">
              <img src={imageSrc} alt={product?.name ?? review.skuPrefix} className="h-20 w-full object-contain" />
            </div>
          </div>

          <div>
            <p className="font-semibold">{product?.name ?? "Product"}</p>
            <p className="text-sm">{new Date(review.createdAt).toLocaleString()}</p>

            {!isEditing ? (
              <>
                <div className="mt-2 font-bold">
                  {"★".repeat(review.qualification)}
                  <span className="font-normal">{"☆".repeat(5 - review.qualification)}</span>
                </div>

                {review.message && <p className="mt-3 leading-relaxed">“{review.message}”</p>}
              </>
            ) : (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm">Stars</label>
                  <select
                    value={editStars}
                    onChange={(e) => setEditStars(Number(e.target.value))}
                    className="rounded-xl border px-3 py-2"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <Input
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="mt-3"
                  placeholder="Update your review..."
                />
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0" onClick={() => startEdit(review)}>Modify</Button>
              <Button variant="destructive"
                      className="bg-red-500/90 hover:bg-red-600 shadow-sm text-white hover:text-white"
                      onClick={() => remove(id)}>Delete</Button>
            </>
          ) : (
            <>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0" onClick={() => saveEdit(id)}>Save</Button>
              <Button variant="destructive" onClick={cancelEdit}>Cancel</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
