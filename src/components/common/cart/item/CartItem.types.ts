import type { CartItem } from "@/types/Entities";
import type { NavigateFunction } from "react-router-dom";

export interface Props {
  item: CartItem,
  updating: Record<string, boolean>,
  changeQuantityAbs: (itemId: string, nextQty: number) => Promise<void>,
  removeItem: (itemId: string) => Promise<void>,
  navigate: NavigateFunction,
}
