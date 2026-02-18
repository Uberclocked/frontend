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

    const close = () => setOpen(false);

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
                    <Link to="/" onClick={close} className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Home
                    </Link>

                    <Link to="/posts" onClick={close} className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Exchange Area
                    </Link>

                    <Link to="/market" onClick={close} className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Market
                    </Link>

                    <Link to="/build" onClick={close} className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Build PC
                    </Link>

                    <Link to="/purchases" onClick={close} className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        My purchases
                    </Link>

                    <Link to="/cart" onClick={close} className="block px-3 py-2 rounded-lg hover:bg-muted/40">
                        Cart
                    </Link>

                </div>
            )}
        </div>
    );
}

export default NavBarUserDropdown;