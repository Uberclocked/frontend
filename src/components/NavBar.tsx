import { useAuth0 } from "@auth0/auth0-react";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import cart from "../stories/assets/cart.png"
import logo from "../stories/assets/uberClocked(Only_logo).png";

const navLinkClass =
    "relative transition text-[#F5F5DC] " +
    "after:absolute after:left-0 after:-bottom-1 " +
    "after:h-[2px] after:w-0 after:bg-[#FF8000] " +
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

    const isAdmin = roles.includes("Admin");

    const navigate = useNavigate();

    if (isLoading) return null;

    return (
        <nav className="w-full h-16 flex items-center justify-between px-8 bg-[#36454F]">
            <div className="flex items-center gap-6">
                <img
                    src={logo}
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                />
                <span className="text-[#F5F5DC] text-xl font-semibold">
                    UberClocked
                </span>
            </div>

            <div className="flex items-center gap-8 mr-12">
                <Link to="/" className={navLinkClass}>
                    Home
                </Link>
                <Link to="/posts" className={navLinkClass}>
                    Exchange Area
                </Link>
                <Link to="/market" className={navLinkClass}>
                    Market
                </Link>
                {isAuthenticated && isAdmin && (
                    <>
                        <Link to="/components" className={navLinkClass}>
                            Components
                        </Link>
                        <Link to="/products" className={navLinkClass}>
                            Products
                        </Link>
                    </>
                )}

                {isAuthenticated && (
                    <div className="flex items-center gap-6 ml-6">
                        <Link to="/purchases/me" className={navLinkClass}>
                            My purchases
                        </Link>
                        <Link to="/cart" className="flex items-center cursor-pointer ml-6">
                            <img
                                src={cart}
                                alt="cart"
                                className="h-8 w-8 object-contain"
                            />
                        </Link>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                {!isAuthenticated && (
                    <>
                        <Button
                            variant="ghost"
                            className="text-[#F5F5DC] hover:bg-transparent hover:text-[#FF8000]"
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
                                <span className="text-white text-base font-medium">
                                {user?.name}
                                </span>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigate("/profile")}>
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/posts/me")}>
                                My posts
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/reviews/me")}>
                                My reviews
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
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
        </nav>
    );
}