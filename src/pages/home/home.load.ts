import { getProducts } from "@/services/Product";

export async function homeLoader() {
  const products = await getProducts();
  return {
    products: products.filter(product => product.active && product.stock > 0)
  }
}
