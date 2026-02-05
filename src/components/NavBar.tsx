import { useAuth0 } from "@auth0/auth0-react";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import cart from "../stories/assets/cart.png"
import logo from "../stories/assets/uberClocked(Only_logo).png";

const navLinkClass =
  "relative transition " +
  "after:absolute after:left-0 after:-bottom-1 " +
  "after:h-[2px] after:w-0 after:bg-primary " +
  "after:transition-all after:duration-300 " +
  "hover:after:w-full";

export default function NavBar() {

  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
    user,
  } = useAuth0();

  const roles =
    user?.["https://uberclocked.com/roles"] || [];

  const isAdmin = roles.includes("ADMIN") || roles.includes("Admin");

  const navigate = useNavigate();

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
      <div className="flex items-center gap-6">
        < img
          src={logo}
          alt="Logo"
          className="h-16 w-16 object-contain"
        />
        <span className="text-xl font-semibold">
          UberClocked
        </span>
      </div >

      <div className="flex items-center gap-8 mr-12">
        <Link to="/" className={navLinkClass}>
          Home
        </Link>
        {!isAdmin && (
          <>
            <Link to="/posts" className={navLinkClass}>
              Exchange Area
            </Link>
          </>
        )}

        <Link to="/market" className={navLinkClass}>
          Market
        </Link>
        {isAuthenticated && isAdmin && (
          <>
            <Link to="/admin/posts" className={navLinkClass}>
              Exchange Area (Admin)
            </Link>
            <Link to="/components" className={navLinkClass}>
              Components
            </Link>
            <Link to="/products" className={navLinkClass}>
              Products
            </Link>
            <Link to="/all-purchases" className={navLinkClass}>
              All purchases
            </Link>
            <Link to="/admin/reviews" className={navLinkClass}>
              Reviews
            </Link>
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <>
            <Link to="/pc-builder" className={navLinkClass}>
              Build PC
            </Link>
            <Link to="/my-purchases" className={navLinkClass}>
              My purchases
            </Link>
            <Link to="/cart" className="flex items-center cursor-pointer ml-6">
              <img
                src={cart}
                alt="cart"
                className="h-8 w-8 object-contain"
              />
            </Link>

          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {!isAuthenticated && (
          <>
            <Button
              variant="ghost"
              className="hover:bg-transparent hover:text-primary"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: {
                    redirect_uri:
                      window.location.origin + "/auth-callback",
                  },
                })
              }
            >
              Login / Sign up
            </Button>
          </>
        )}


        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {user?.name}
                </span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              {!isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate("/posts/me")}>
                    My posts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/reviews/me")}>
                    My reviews
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() =>
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  })
                }
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav >
  );
}
