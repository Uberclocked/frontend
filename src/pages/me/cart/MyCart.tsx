import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import usePreference, { useCart } from "./MyCart.hooks";
import CartItem from "@/components/common/cart/item/CartItem";
import CartHeader from "@/components/common/cart/header/CartHeader";
import {Button} from "@/components/ui/button.tsx";


export default function MyCartPage() {
  const { getAccessTokenSilently } = useAuth0();
  const { cart, updating, isLoading, loadCart, changeQuantityAbs, removeItem } = useCart(getAccessTokenSilently);
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(6);
  const preferenceId = usePreference(getAccessTokenSilently, cart);

  useEffect(() => {
    loadCart();
  }, []);


  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

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
        <h1 className="text-3xl font-bold mb-6 text-center">
          My Cart
        </h1>

        {items.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-lg text-center">Your cart is empty</p>
          </div>
        ) : (
          <>
            <CartHeader visibleCount={visibleCount} setVisibleCount={setVisibleCount} totalItems={items.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleItems.map((item: any) => {
                return (
                  <CartItem
                    key={item.id}
                    item={item}
                    updating={updating}
                    changeQuantityAbs={changeQuantityAbs}
                    removeItem={removeItem}
                    navigate={navigate}
                  />
                )
              })}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 px-8 py-6 text-lg font-semibold rounded-2xl"
              >
                <Link to={`/checkout/${preferenceId}`}>
                  Go to checkout
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div >
  );
}
