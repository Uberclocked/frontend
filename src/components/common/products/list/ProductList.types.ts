import type { Product } from "@/pages/builder/types/Product";

export interface Props {
  products: Product[],
  onSelect: (product: Product) => void,
}
