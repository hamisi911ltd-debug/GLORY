import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoImg from "@/LOGO.jpeg";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <img
        src={logoImg}
        alt="Immacurate Driving School"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}
