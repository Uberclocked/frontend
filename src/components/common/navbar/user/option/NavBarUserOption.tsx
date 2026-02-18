import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Ticket, User } from "lucide-react";
import useNavBarUserOptionsLogic from "./NavBarUserOptions.hook";

function NavBarUserOptions() {
    const { user, logout, navigate } = useNavBarUserOptionsLogic();

    const itemStyle =
        "flex items-center gap-2 border-b last:border-b-0";

    return (
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

            <DropdownMenuContent
                align="end"
                className="w-48 bg-background text-foreground border shadow-md backdrop-blur-none p-0"
            >
                <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className={itemStyle}
                >
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => navigate("/posts/me")}
                    className={itemStyle}
                >
                    My posts
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => navigate("/reviews/me")}
                    className={itemStyle}
                >
                    My reviews
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => navigate("/coupons")}
                    className={itemStyle}
                >
                    My coupons
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() =>
                        logout({
                            logoutParams: { returnTo: window.location.origin },
                        })
                    }
                    className={itemStyle}
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NavBarUserOptions;