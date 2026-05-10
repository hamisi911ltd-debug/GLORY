import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/courses/car", label: "Courses" },
  { to: "/#instructors", label: "Instructors" },
  { to: "/#branches", label: "Branches" },
  { to: "/#about", label: "About" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild variant="primary"><Link to="/dashboard">My Dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/login">Log in</Link></Button>
              <Button asChild variant="primary"><Link to="/register">Enrol now</Link></Button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.to} href={l.to} className="text-sm font-medium" onClick={() => setOpen(false)}>{l.label}</a>
            ))}
            {user ? (
              <Button asChild variant="primary"><Link to="/dashboard">My Dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="secondary"><Link to="/login">Log in</Link></Button>
                <Button asChild variant="primary"><Link to="/register">Enrol now</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
