import type { Product } from "@/pages/builder/types/Product";

export function calculateTotalCost(selectedProducts: Product[]) {
  return selectedProducts.reduce((acum, product) => acum += product.price, 0)
};
