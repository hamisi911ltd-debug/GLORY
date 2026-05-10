import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-bold", className)}>
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", light ? "bg-brand text-white" : "bg-navy text-white")}>
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className={cn("text-lg tracking-tight", light ? "text-white" : "text-navy")}>
        DriveSchool <span className="text-brand">Pro</span>
      </span>
    </Link>
  );
}
