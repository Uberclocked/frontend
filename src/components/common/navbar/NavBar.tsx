import { Button } from "@/components/ui/button";

import cart from "../../../stories/assets/cart.png"
import logo from "../../../stories/assets/uberClocked(Only_logo).png";

import { useNavBarLogic } from "./NavBar.hook";
import NavBarButton from "./button/NavBarButton";
import NavBarUserOptions from "./user/option/NavBarUserOption";
import NavBarUserDropdown from "@/components/common/navbar/user/NavBarUserDropdown.tsx";

export default function NavBar() {
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    isAdmin,
  } = useNavBarLogic();

  if (isLoading) return null;

  return (
    <nav className="
      w-full
      flex items-center justify-between
      px-8
      bg-white/90
      shadow-md
      border-b
      relative
      z-50
">
        <div className="flex items-center gap-6 shrink-0">
            <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
            <span className="text-xl font-semibold">UberClocked</span>
        </div>

        <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-8 pr-10">
                {!isAdmin && (
                    <>
                        <NavBarButton toUrl="/" text="Home" />
                        <NavBarButton toUrl="/posts" text="Exchange Area" />
                        <NavBarButton toUrl="/market" text="Market" />
                    </>
                )}

                {isAuthenticated && (
                    <>
                        {!isAdmin && (
                            <>
                                <NavBarButton toUrl="/build" text="Build PC" />
                                <NavBarButton toUrl="/purchases" text="My purchases" />
                                <NavBarButton toUrl="/cart">
                                    <img src={cart} alt="cart" className="h-8 w-8 object-contain" />
                                </NavBarButton>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <NavBarButton toUrl="/admin/posts" text="Exchange Area (Admin)" />
                                <NavBarButton toUrl="/admin/components" text="Components" />
                                <NavBarButton toUrl="/admin/products" text="Products" />
                                <NavBarButton toUrl="/admin/promotions" text="Coupons" />
                                <NavBarButton toUrl="/admin/purchases" text="Purchases" />
                                <NavBarButton toUrl="/admin/reviews" text="Reviews" />
                                <NavBarButton toUrl="/admin/companies" text="Companies" />
                                <NavBarUserDropdown />
                            </>
                        )}
                    </>
                )}
            </div>

        </div>

        <div className="w-60 flex justify-end items-center shrink-0">
            {isAuthenticated ? (
                <NavBarUserOptions />
            ) : (
                <Button
                    variant="ghost"
                    className="hover:bg-transparent hover:text-primary"
                    onClick={() =>
                        loginWithRedirect({
                            authorizationParams: { redirect_uri: window.location.origin + "/auth-callback" },
                        })
                    }
                >
                    Login / Sign up
                </Button>
            )}
        </div>
    </nav>
  );
}