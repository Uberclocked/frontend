import ProductCarousel from "@/components/common/products/carousel/ProductCarousel";
import { useLoaderData } from "react-router-dom";
import type { Props } from "./Home.types";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useCountdown } from "@/components/common/wheel/useCountdown";
import { getWheelStatus, spinWheel } from "@/services/wheelApi";
import DiscountWheel from "@/components/common/wheel/DiscountWheel";

function useAuth() {
    const { getAccessTokenSilently } = useAuth0();
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

    return {
        getToken: async () =>
            getAccessTokenSilently({
                authorizationParams: {
                    ...(audience ? { audience } : {}),
                    scope: "openid profile email",
                },
            }),
    };
}

export default function Home() {
    const { products } = useLoaderData() as Props;
    const { getToken } = useAuth();

    const [canSpin, setCanSpin] = useState<boolean | null>(null); // null = loading
    const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
    const [nextSpinAt, setNextSpinAt] = useState<string | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);

    const countdown = useCountdown(secondsRemaining);

    async function refreshStatus() {
        setStatusError(null);
        setCanSpin(null); // loading
        try {
            const s = await getWheelStatus(getToken);
            setCanSpin(s.canSpin);
            setSecondsRemaining(s.secondsRemaining ?? null);
            setNextSpinAt(s.nextSpinAt ?? null);
        } catch (e: any) {
            console.error("wheel/status failed:", e);
            setStatusError(String(e?.message ?? e));
            setCanSpin(false);
            setSecondsRemaining(null);
            setNextSpinAt(null);
        }
    }

    useEffect(() => {
        refreshStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const disabled = canSpin !== true;

    return (
        <div className="min-w-screen px-8 py-12">
            <h1 className="text-3xl font-semibold mb-8 text-center">
                UberClocked Marketplace
            </h1>

            <ProductCarousel products={products} />

            <div className="mt-16 mb-12">
                <h2 className="text-xl font-semibold mb-3 text-center text-gray-900">
                    Daily Wheel
                </h2>
                <p className="text-center text-gray-600 mb-6">One Roll a Day.</p>

                <DiscountWheel
                    disabled={disabled}
                    onSpin={async () => {
                        const res = await spinWheel(getToken);

                        if (!res.canSpin) {
                            setCanSpin(false);
                            setNextSpinAt(res.nextSpinAt ?? null);
                            await refreshStatus();
                            throw new Error("Already spun. Try again tomorrow.");
                        }

                        await refreshStatus();

                        return {
                            label: res.prize?.label ?? "Prize",
                            discount: res.prize?.discount ?? 0,
                            code: res.promotion?.code,
                        };
                    }}
                />

                <div className="text-center mt-4 text-gray-600">
                    {canSpin === null ? (
                        <>Checking availability…</>
                    ) : statusError ? (
                        <>
                            <div className="text-red-600 font-semibold">Wheel unavailable</div>
                            <div className="text-sm text-red-600">{statusError}</div>
                            <button
                                className="mt-3 px-4 py-2 rounded bg-gray-800 text-white"
                                onClick={refreshStatus}
                            >
                                Retry
                            </button>
                        </>
                    ) : canSpin ? (
                        <>You can spin now</>
                    ) : countdown.formatted ? (
                        <>
                            Next Spin in{" "}
                            <span className="font-semibold">{countdown.formatted}</span>
                        </>
                    ) : nextSpinAt ? (
                        <>
                            Next Spin:{" "}
                            <span className="font-semibold">
                {new Date(nextSpinAt).toLocaleString()}
              </span>
                        </>
                    ) : (
                        <>Not available now. Try again tomorrow!</>
                    )}
                </div>
            </div>
        </div>
    );
}