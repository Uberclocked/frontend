import {useAuth0} from "@auth0/auth0-react";
import {useEffect, useState} from "react";

import {deletePurchase, getAllPurchases, updatePurchase} from "../services/Purchase.ts";
import type {Purchase} from "../types/Entities.ts";

export default function AdminPurchasesPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    async function load() {
        const token = await getAccessTokenSilently();
        const data = await getAllPurchases(token);
        setPurchases(data);
    }

    useEffect(() => {
        load();
    }, []);

    async function updateStatus(id: string, status: string) {
        const token = await getAccessTokenSilently();
        await updatePurchase(token, id, { status });
        load();
    }

    async function remove(id: string) {
        const token = await getAccessTokenSilently();
        await deletePurchase(token, id);
        load();
    }

    return (
        <div>
            <h1>Admin - Compras</h1>

            {purchases.map(p => (
                <div key={p.id} style={{ border: "1px solid black", margin: 10 }}>
                    <p>ID: {p.id}</p>
                    <p>Estado: {p.status}</p>
                    <p>Total: ${p.totalAmount}</p>

                    <button onClick={() => updateStatus(p.id, "READY")}>
                        Marcar listo
                    </button>

                    <button onClick={() => remove(p.id)}>
                        Eliminar
                    </button>
                </div>
            ))}
        </div>
    );
}