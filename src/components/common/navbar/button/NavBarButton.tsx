import { Link } from "react-router-dom";
import type { NavBarButtonProps } from "./NavBarButton.types";

function NavBarButton({ toUrl, text, children }: NavBarButtonProps) {
  const navLinkClass =
    "relative transition " +
    "after:absolute after:left-0 after:-bottom-1 " +
    "after:h-[2px] after:w-0 after:bg-primary " +
    "after:transition-all after:duration-300 " +
    "hover:after:w-full";

  return (
    <Link to={toUrl} className={navLinkClass}>
      {children ?? text}
    </Link>
  )
}

export default NavBarButton;
