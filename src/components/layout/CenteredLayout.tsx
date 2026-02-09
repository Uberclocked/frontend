import { Outlet } from "react-router-dom";

function CenteredLayout() {
  return (
    <div className="flex flex-col justify-evenly items-center
      min-w-screen min-h-screen max-h-screen">
      <main className="overflow-clip">
        <Outlet />
      </main>
      <footer className="text-sm text-muted-foreground px-4 py-2 border-t bg-background">
        © {new Date().getFullYear()} ÜberClocked
      </footer>
    </div>
  )
}

export default CenteredLayout;
