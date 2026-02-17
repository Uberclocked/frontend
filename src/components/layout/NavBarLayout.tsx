import { Outlet } from "react-router-dom";

import NavBar from "../common/navbar/NavBar";

function NavBarLayout() {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <header className="shrink-0 pointer-events-auto">
                <NavBar />
            </header>

            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            <footer className="shrink-0 text-sm text-muted-foreground px-4 py-2 border-t bg-background">
                © {new Date().getFullYear()} ÜberClocked
            </footer>
        </div>
    );
}

export default NavBarLayout;
