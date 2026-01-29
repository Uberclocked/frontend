import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addCartItem } from "../services/Cart";
import { getProducts } from "../services/Product";
import type { Product } from "../types/Entities";

export default function ProductCarousel() {
    const [products, setProducts] = useState<Product[]>([]);
    const [index, setIndex] = useState(0);
    const [adding, setAdding] = useState(false);

    const navigate = useNavigate();
    const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        getProducts()
            .then((data) => setProducts(data.filter((p) => p.active && p.stock > 0)))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % products.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [products]);

    if (products.length === 0) {
        return <p className="text-center text-[#F5F5DC]">Loading products...</p>;
    }

    const product = products[index];
    const imageSrc = product.image
        ? `data:image/jpeg;base64,${product.image}`
        : "/placeholder.png";

    async function handleAddToCart(e: React.MouseEvent) {
        e.stopPropagation();

        try {
            if (!isAuthenticated) {
                await loginWithRedirect({
                    appState: { returnTo: window.location.pathname },
                });
                return;
            }

            setAdding(true);
            const token = await getAccessTokenSilently();

            await addCartItem(token, {
                productSku: product.skuPrefix,
                quantity: 1,
                components: {},
            });

            alert("Added to cart!");
        } catch (err) {
            console.error(err);
            alert("Could not add to cart");
        } finally {
            setAdding(false);
        }
    }

    return (
        <div
            className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-lg bg-[#2b3740] cursor-pointer"
            onClick={() => navigate(`/products/${product.skuPrefix}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/products/${product.skuPrefix}`);
            }}
        >
            <div className="flex items-center justify-center p-10 gap-10 transition-all duration-700 ease-in-out">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="h-64 w-64 object-contain rounded-lg bg-white p-4"
                />

                <div className="text-[#F5F5DC] max-w-sm">
                    <p className="text-sm text-gray-300 mb-1">{product.component.displayName}</p>
                    <h2 className="text-2xl font-semibold mb-3">{product.name}</h2>
                    <p className="text-xl font-bold mb-4">${product.price}</p>
                    <p className="text-sm text-gray-300 mb-6">Stock: {product.stock}</p>

                    <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => navigate(`/products/${product.skuPrefix}`)}
                            className="px-5 py-2 bg-[#F5F5DC] text-[#36454F] rounded hover:bg-[#e6e6c9] font-semibold"
                        >
                            View product
                        </button>

                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="px-5 py-2 border border-[#F5F5DC] text-[#F5F5DC] rounded hover:bg-[#F5F5DC] hover:text-[#36454F] disabled:opacity-60"
                        >
                            {adding ? "Adding..." : "Add to cart"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
