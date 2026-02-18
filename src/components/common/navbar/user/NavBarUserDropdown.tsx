import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function NavBarUserDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition"
            >
                User features ▾
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg p-2 z-50 space-y-1">
                    <Link to="/" className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Home
                    </Link>
                    <Link to="/posts" className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Exchange Area
                    </Link>
                    <Link to="/market" className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Market
                    </Link>
                    <Link to="/build" className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Build PC
                    </Link>
                    <Link to="/purchases" className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        My purchases
                    </Link>
                    <Link to="/cart" className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Cart
                    </Link>
                </div>
            )}
        </div>
    );
}

export default NavBarUserDropdown;
