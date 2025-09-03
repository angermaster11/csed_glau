import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/60">
      <div className="container mx-auto flex items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-2 font-extrabold tracking-tight"
        >
          <span className="inline-block h-8 w-8 rounded bg-gradient-to-br from-primary to-indigo-500" />
          <span className="text-lg sm:text-xl">CSED Club</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a
            href={isHome ? "#events" : "/#events"}
            className="hover:text-primary transition-colors"
          >
            Events
          </a>
          <a
            href={isHome ? "#projects" : "/#projects"}
            className="hover:text-primary transition-colors"
          >
            Projects
          </a>
          <a
            href={isHome ? "#members" : "/#members"}
            className="hover:text-primary transition-colors"
          >
            Members
          </a>
          <Link to="/events" className="hover:text-primary transition-colors">
            All Events
          </Link>
          <Link
            to="/admin"
            className={cn(
              "px-3 py-1 rounded-md border",
              "hover:bg-primary hover:text-primary-foreground transition-colors",
            )}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t mt-24">
      <div className="container mx-auto py-10 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} CSED Club — Central Skill for
          Entrepreneur and Development
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary">
            Privacy
          </a>
          <a href="#" className="hover:text-primary">
            Terms
          </a>
          <a href="#" className="hover:text-primary">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
