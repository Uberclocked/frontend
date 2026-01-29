import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import { getMyPurchases } from "@/services/Purchase";
import pcPlaceholder from "@/stories/assets/pc.jpg";
import type {PurchaseResponseDto} from "@/types/PurchaseDto.ts";


export default function MyPurchasesPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [data, setData] = useState<PurchaseResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const purchases = await getMyPurchases(token);
            setData(purchases);
        } catch (e) {
            console.error(e);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <p className="text-[#F5F5DC] text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-950">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold mb-6 text-[#FF8000] text-center">
                    My Purchases
                </h1>

                {data.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-[#F5F5DC] text-lg text-center">No purchases yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {data.map((p) => (
                            <div
                                key={p.id}
                                className="p-4 rounded-2xl bg-gray-900 border border-gray-800"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <p className="text-[#F5F5DC] font-semibold">
                                            Purchase #{p.id.slice(0, 8)}
                                        </p>
                                        <p className="text-[#F5F5DC] text-sm">
                                            Created: {new Date(p.createdAt).toLocaleString()}
                                        </p>
                                        {p.pickupDate && (
                                            <p className="text-[#F5F5DC] text-sm">
                                                Pickup: {new Date(p.pickupDate).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[#F5F5DC]">
                                            Status: <span className="font-semibold">{p.status}</span>
                                        </p>
                                        <p className="text-[#FF8000] font-bold text-lg">
                                            ${Number(p.totalAmount).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-800 pt-4">
                                    <p className="text-[#F5F5DC] mb-2">
                                        Items:{" "}
                                        <span className="text-[#F5F5DC] font-semibold">
                      {p.items?.length ?? 0}
                    </span>
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {(p.items ?? []).map((it) => {
                                            const isCustomPc = it.components && Object.keys(it.components).length > 0;
                                            const imageSrc = it.image
                                                ? `data:image/jpeg;base64,${it.image}`
                                                : isCustomPc
                                                    ? pcPlaceholder
                                                    : "/placeholder.png";

                                            return (
                                                <div
                                                    key={it.id}
                                                    className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex gap-3"
                                                >
                                                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-800 bg-gray-900 flex items-center justify-center">
                                                        <img
                                                            src={imageSrc}
                                                            alt={it.productName ?? it.name ?? "Product"}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex-1">
                                                        <p className="text-[#F5F5DC] font-semibold">{it.name}</p>

                                                        {it.productName && (
                                                            <p className="text-[#F5F5DC] text-sm">
                                                                Product:{" "}
                                                                <span className="text-[#F5F5DC]">{it.productName}</span>
                                                            </p>
                                                        )}

                                                        <p className="text-[#F5F5DC] text-sm">Qty: {it.quantity}</p>

                                                        <p className="text-[#F5F5DC] font-semibold">
                                                            ${Number(it.totalPrice).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}