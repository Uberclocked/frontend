import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import useNavBarUserOptionsLogic from "./NavBarUserOptions.hook";

function NavBarUserOptions() {
  const { user, logout, navigate } = useNavBarUserOptionsLogic();
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
  )
}

export default NavBarUserOptions;
