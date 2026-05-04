import { Moon, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "./Button";
import { cn } from "../lib/utils";

export function AppShell() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-zinc-950 dark:text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Zap size={18} />
            </span>
            <span>DrivePDF</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/tools">Tools</NavItem>
            <NavItem to="/drive-sync">Drive</NavItem>
            <NavItem to="/pricing">Pricing</NavItem>
            <Button
              aria-label="Toggle dark mode"
              variant="ghost"
              size="sm"
              className="w-9 px-0"
              onClick={() => setDark((value) => !value)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-slate-100 text-slate-950 dark:bg-zinc-900 dark:text-white"
            : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
        )
      }
    >
      {children}
    </NavLink>
  );
}
