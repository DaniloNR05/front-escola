import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Início", path: "/" },
  { label: "Campeonatos", path: "/campeonatos" },
  { label: "Modalidades", path: "/modalidades" },
  { label: "Inscrição", path: "/inscricao" },
  { label: "Admin", path: "/admin" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105 group-active:scale-95">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground">Porteirinha Joga</span>
            <span className="text-[11px] text-muted-foreground">Prefeitura Municipal</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={user?.role === "admin" ? "/admin" : "/inscricao"}>
                <Button size="sm" variant="outline" className="ml-2">
                  {user?.role === "admin" ? "Painel" : "Minha Area"}
                </Button>
              </Link>
              <Button size="sm" className="ml-2" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" className="ml-2">
                Entrar
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t bg-card px-4 pb-4 pt-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to={user?.role === "admin" ? "/admin" : "/inscricao"} onClick={() => setMobileOpen(false)}>
                <Button size="sm" variant="outline" className="mt-2 w-full">
                  {user?.role === "admin" ? "Painel" : "Minha Area"}
                </Button>
              </Link>
              <Button size="sm" className="mt-2 w-full" onClick={() => {
                logout();
                setMobileOpen(false);
              }}>
                Sair
              </Button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="mt-2 w-full">
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
