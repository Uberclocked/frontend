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
        <div className="p-6 min-h-screen bg-[#2b3740]">
            <div className="flex justify-between items-center max-w-6xl mx-auto mb-4">
                <h1 className="text-xl font-bold text-[#F5F5DC]">Products</h1>
                <CreateProductDialog onCreated={loadProducts} />
            </div>

            <div className="max-w-6xl mx-auto bg-[#36454F] rounded-lg p-2 border border-gray-700">
                {loading ? (
                    <p className="p-4 text-sm text-gray-400">Loading...</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                        <tr>
                            <th className="text-[#F5F5DC]">SKU</th>
                            <th className="text-[#F5F5DC]">Name</th>
                            <th className="text-[#F5F5DC]">Component</th>
                            <th className="text-[#F5F5DC]">Price</th>
                            <th className="text-[#F5F5DC]">Stock</th>
                            <th className="text-[#F5F5DC]">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(p => (
                            <tr key={p.skuPrefix} className="hover:bg-[#2b3740]">
                                <td className="text-center text-[#F5F5DC]">{p.skuPrefix}</td>
                                <td className="text-center text-[#F5F5DC]">{p.name}</td>
                                <td className="text-center text-[#F5F5DC]">{p.component.displayName}</td>
                                <td className="text-center text-[#F5F5DC]">${p.price}</td>
                                <td className="text-center text-[#F5F5DC]">{p.stock}</td>
                                <td className="flex justify-center gap-4 py-1">
                                    <EditProductDialog product={p} onUpdated={loadProducts} />
                                    <button
                                        className="text-red-500 font-semibold text-[15px]"
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