import type { Product } from "@/types/Entities";
import type { ReviewResponseDto } from "@/types/Review";
import { MyReviewItem } from "../item/MyReviewItem";

interface MyReviewCardProps {
  reviews: ReviewResponseDto[];
  productsBySku: Record<string, Product | null>;
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

export function MyReviewCard(props: MyReviewCardProps) {
  return (
    <>
      {props.reviews.map((r) => (
        <MyReviewItem
          key={r.id}
          review={r}
          product={props.productsBySku[r.skuPrefix] ?? null}
          editingId={props.editingId}
          editStars={props.editStars}
          setEditStars={props.setEditStars}
          editMessage={props.editMessage}
          setEditMessage={props.setEditMessage}
          startEdit={props.startEdit}
          saveEdit={props.saveEdit}
          cancelEdit={props.cancelEdit}
          remove={props.remove}
        />
      ))}
    </>
  );
}
