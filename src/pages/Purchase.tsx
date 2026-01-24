import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import {getMyPurchases} from "../services/Purchase.ts";
import type {Purchase} from "../types/Entities.ts";

export default function PurchasesPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        getAccessTokenSilently().then(token =>
            getMyPurchases(token).then(setPurchases)
        );
    }, []);

    return (
        <div>
            <h1>Mis compras</h1>

            {purchases.map(p => (
                <div key={p.id} style={{ border: "1px solid gray", margin: 10 }}>
                    <p>Estado: {p.status}</p>
                    <p>Total: ${p.totalAmount}</p>

                    {p.items.map(i => (
                        <div key={i.id}>
                            {i.name} x{i.quantity}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}