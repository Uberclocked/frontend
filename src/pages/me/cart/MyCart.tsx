import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CartHeader from "@/components/common/cart/header/CartHeader";
import CartItem from "@/components/common/cart/item/CartItem";
import { Button } from "@/components/ui/button.tsx";

import usePreference, { useCart } from "./MyCart.hooks";

function CartCouponPanel({
                             open,
                             setOpen,
                             onApply,
                             onRemove,
                             appliedCode,
                             discountAmount,
                         }: {
    open: boolean;
    setOpen: (v: boolean) => void;
    onApply: (code: string) => Promise<void>;
    onRemove: () => Promise<void>;
    appliedCode?: string | null;
    discountAmount?: number | null;
}) {
    const [code, setCode] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!open && !appliedCode) return null;

    return (
        <div className="mt-3 rounded-2xl border p-4">
            {appliedCode ? (
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm">
                        Applied: <span className="font-semibold">{appliedCode}</span>
                        {typeof discountAmount === "number" && discountAmount > 0 && (
                            <span className="ml-2 opacity-80">(-{discountAmount.toFixed(2)})</span>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        className="rounded-2xl"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            setErr(null);
                            try {
                                await onRemove();
                                setOpen(false);
                                setCode("");
                            } catch (e: any) {
                                setErr("This coupon can’t be redeemed. Please check the code or try a different one.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Remove
                    </Button>
                </div>
            ) : (
                <div className="flex gap-3">
                    <input
                        className="border rounded-xl p-3 flex-1"
                        placeholder="Enter coupon code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <Button
                        className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-8 py-6 text-lg font-semibold "
                        disabled={loading || !code.trim()}
                        onClick={async () => {
                            setLoading(true);
                            setErr(null);
                            try {
                                await onApply(code.trim());
                                setCode("");
                                setOpen(false);
                            } catch (e: any) {
                            setErr("This coupon can’t be redeemed. Please check the code or try a different one.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Apply
                    </Button>
                </div>
            )}

            {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
        </div>
    );
}

export default function MyCartPage() {
    const { getAccessTokenSilently } = useAuth0();
    const { cart, updating, isLoading, loadCart, changeQuantityAbs, removeItem, applyCoupon, removeCoupon } =
        useCart(getAccessTokenSilently);

    const navigate = useNavigate();
    const [visibleCount, setVisibleCount] = useState(6);
    const preferenceId = usePreference(getAccessTokenSilently, cart);
    const [couponOpen, setCouponOpen] = useState(false);

    useEffect(() => {
        loadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const items = useMemo(() => cart?.items ?? [], [cart?.items]);

    const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

    const subtotal = useMemo(() => {
        return items.reduce((acc, it: any) => acc + (Number(it.totalPrice) || 0), 0);
    }, [items]);

    const discount = useMemo(() => {
        const raw = cart?.discountAmount;
        return typeof raw === "number" ? raw : Number(raw ?? 0) || 0;
    }, [cart?.discountAmount]);

    const totalToPay = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

    async function handleApplyCoupon(code: string) {
        await applyCoupon(code);
        await loadCart(); // <- clave para ver discountAmount actualizado
    }

    async function handleRemoveCoupon() {
        await removeCoupon();
        await loadCart(); // <- clave
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <p className="text-lg">Error loading cart</p>
            </div>
        );
    }

    return (
        <div className="min-w-screen p-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold mb-6 text-center">My Cart</h1>

                {items.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-lg text-center">Your cart is empty</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <CartHeader visibleCount={visibleCount} setVisibleCount={setVisibleCount} totalItems={items.length} />

                            {!cart.appliedPromotion?.code ? (
                                <Button
                                    variant="secondary"
                                    className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-8 py-6 text-lg font-semibold "
                                    onClick={() => setCouponOpen((v) => !v)}
                                >
                                    {couponOpen ? "Cancel" : "Add coupon"}
                                </Button>
                            ) : (
                                <Button variant="secondary" className="rounded-2xl" onClick={() => setCouponOpen(true)}>
                                    View coupon
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {visibleItems.map((item: any) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    updating={updating}
                                    changeQuantityAbs={changeQuantityAbs}
                                    removeItem={removeItem}
                                    navigate={navigate}
                                />
                            ))}
                        </div>

                        <CartCouponPanel
                            open={couponOpen}
                            setOpen={setCouponOpen}
                            onApply={handleApplyCoupon}
                            onRemove={handleRemoveCoupon}
                            appliedCode={cart.appliedPromotion?.code ?? null}
                            discountAmount={cart.discountAmount ?? null}
                        />

                        {/* Totales */}
                        <div className="mt-6 rounded-2xl border p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="opacity-80">Subtotal</span>
                                <span className="font-semibold">{subtotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="mt-2 flex items-center justify-between text-sm">
                                    <span className="opacity-80">Discount</span>
                                    <span className="font-semibold">-{discount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="mt-3 border-t pt-3 flex items-center justify-between">
                                <span className="text-base font-semibold">Total to pay</span>
                                <span className="text-lg font-bold">{totalToPay.toFixed(2)}</span>
                            </div>

                        </div>

                        <div className="flex justify-center mt-8">
                            <Button
                                asChild
                                className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-8 py-6 text-lg font-semibold rounded-2xl"
                            >
                                <Link to={`/checkout/${preferenceId}`}>Go to checkout</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}