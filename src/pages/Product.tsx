import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import {addItemToCart} from "../services/Cart.ts";
import {getProducts} from "../services/Product.ts";
import type {Product} from "../types/Entities.ts";


export default function ProductsPage() {
    const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    async function addToCart(productSku: string) {
        if (!isAuthenticated) {
            await loginWithRedirect();
            return;
        }

        const token = await getAccessTokenSilently();

        await addItemToCart(token, {
            productSku,
            quantity: 1,
        });

        alert("Producto agregado al carrito");
    }

    return (
        <div>
            <h1>Productos</h1>
            {products.map(p => (
                <div key={p.skuPrefix}>
                    <img src={p.image} width={120} />
                    <h3>{p.name}</h3>
                    <p>${p.price}</p>
                    <button onClick={() => addToCart(p.skuPrefix)}>
                        Añadir al carrito
                    </button>
                </div>
            ))}
        </div>
    );
}