import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import {checkout, getMyCart, updateCartComponent, updateCartItem} from "../services/Cart.ts";
import type {Cart} from "../types/Entities.ts";

export default function CartPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [cart, setCart] = useState<Cart | null>(null);

    async function loadCart() {
        const token = await getAccessTokenSilently();
        const c = await getMyCart(token);
        setCart(c);
    }

    useEffect(() => {
        loadCart();
    }, []);

    async function changeQuantity(itemId: string, qty: number) {
        const token = await getAccessTokenSilently();
        await updateCartItem(token, itemId, qty);
        loadCart();
    }

    async function changeComponent(itemId: string, type: string, sku: string) {
        const token = await getAccessTokenSilently();
        await updateCartComponent(token, itemId, type, sku);
        loadCart();
    }

    async function doCheckout() {
        const token = await getAccessTokenSilently();
        await checkout(token);
        alert("Compra confirmada");
        loadCart();
    }

    if (!cart) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Mi carrito</h1>

            {cart.items.map(item => (
                <div key={item.id} style={{ border: "1px solid #ccc", padding: 10 }}>
                    <h3>{item.name}</h3>

                    {item.product && (
                        <p>Producto: {item.product.name}</p>
                    )}

                    {Object.entries(item.components).map(([type, sku]) => (
                        <div key={type}>
                            {type}: {sku}
                            <button onClick={() =>
                                changeComponent(item.id, type, prompt("Nuevo SKU")!)
                            }>
                                Cambiar
                            </button>
                        </div>
                    ))}

                    <p>Cantidad:</p>
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={e => changeQuantity(item.id, Number(e.target.value))}
                    />

                    <p>Total item: ${item.totalPrice}</p>
                </div>
            ))}

            <button onClick={doCheckout}>Finalizar compra</button>
        </div>
    );
}