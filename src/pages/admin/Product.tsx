import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import CreateProductDialog from "@/components/CreateProductDialog.tsx";
import EditProductDialog from "@/components/EditProductDialog.tsx";
import { fetchWithAuth } from "@/services/api.ts";
import type { Product } from "@/types/Entities.ts";

export default function Products() {
  const { getAccessTokenSilently } = useAuth0();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    const token = await getAccessTokenSilently();
    const data = await fetchWithAuth<Product[]>(
      "http://localhost:8080/products",
      token
    );
    setProducts(data);
    setLoading(false);
  }

  async function deleteProduct(sku: string) {
    if (!confirm(`Delete product '${sku}'?`)) return;

    const token = await getAccessTokenSilently();
    await fetchWithAuth(
      `http://localhost:8080/products/${sku}`,
      token,
      { method: "DELETE" }
    );
    loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-4">
        <h1 className="text-xl font-bold">Products</h1>
        <CreateProductDialog onCreated={loadProducts} />
      </div>

      <div className="max-w-6xl mx-auto rounded-lg p-2 border">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Component</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.skuPrefix}>
                  <td className="text-center">{p.skuPrefix}</td>
                  <td className="text-center">{p.name}</td>
                  <td className="text-center">{p.component.displayName}</td>
                  <td className="text-center">${p.price}</td>
                  <td className="text-center">{p.stock}</td>
                  <td className="flex justify-center gap-4 py-1">
                    <EditProductDialog product={p} onUpdated={loadProducts} />
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-[14px] px-3 py-1 rounded-lg transition"
                      onClick={() => deleteProduct(p.skuPrefix)}
                      >
                      Delete
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
