import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import {
    checkout,
    getMyCart,
    updateCartItem,
    removeCartItem
} from "@/services/Cart.ts";
import type { Cart } from "@/types/Entities.ts";

export default function CartPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadCart() {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const c = await getMyCart(token);
            setCart({
                ...c,
                items: c.items ?? [],
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCart();
    }, []);

    async function changeQuantity(itemId: string, qty: number) {
        const token = await getAccessTokenSilently();
        if (qty <= 0) {
            await removeCartItem(token, itemId);
        } else {
            await updateCartItem(token, itemId, qty);
        }
        loadCart();
    }

    async function removeItem(itemId: string) {
        const token = await getAccessTokenSilently();
        await removeCartItem(token, itemId);
        loadCart();
    }

    async function doCheckout() {
        const token = await getAccessTokenSilently();
        await checkout(token);
        alert("Purchase successful!");
        loadCart();
    }

    if (loading) {
        return <p className="text-gray-700">Loading...</p>;
    }

    if (!cart) {
        return <p className="text-gray-700">Error loading cart</p>;
    }

    return (
        <div className="min-h-screen p-6 bg-[#F5F5DC]">
            <h1 className="text-3xl font-bold mb-6 text-[#FF8000]">My Cart</h1>

            {cart.items.length === 0 ? (
                <p className="text-gray-700">Your cart is empty</p>
            ) : (
                <>
                    {cart.items.map(item => (
                        <div
                            key={item.id}
                            className="p-4 mb-4 rounded-lg bg-white border-2 border-[#FF8000]"
                        >
                            <h3 className="text-xl font-semibold text-[#36454F]">
                                {item.name}
                            </h3>

                            {item.product && (
                                <p className="text-[#36454F]">
                                    Product: {item.product.name}
                                </p>
                            )}

                            <div className="flex items-center mt-2">
                                <label className="mr-2 text-[#36454F]">Quantity:</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={item.quantity}
                                    onChange={e =>
                                        changeQuantity(item.id, Number(e.target.value))
                                    }
                                    className="w-16 p-1 border rounded-md"
                                />

                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="ml-4 px-2 py-1 rounded-md text-white bg-[#FF8000] hover:bg-orange-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>

                            <p className="mt-2 font-semibold text-[#36454F]">
                                Total item: ${item.totalPrice.toFixed(2)}
                            </p>
                        </div>
                    ))}

                    <button
                        onClick={doCheckout}
                        className="mt-4 px-6 py-3 rounded-lg text-white text-lg font-bold bg-[#FF8000] hover:bg-orange-600 transition-colors"
                    >
                        Checkout
                    </button>
                </>
            )}
        </div>
    );
}