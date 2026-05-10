import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import {
  Home, CalendarDays, BookOpen, CreditCard, FileText, GraduationCap,
  Bell, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/dashboard", label: "My Schedule", icon: CalendarDays, soon: true },
  { to: "/dashboard", label: "Book a Lesson", icon: BookOpen, soon: true },
  { to: "/dashboard", label: "Payments", icon: CreditCard, soon: true },
  { to: "/dashboard", label: "Theory Tests", icon: GraduationCap, soon: true },
  { to: "/dashboard", label: "Documents", icon: FileText, soon: true },
  { to: "/dashboard", label: "Notifications", icon: Bell, soon: true, badge: 3 },
];

function AuthenticatedLayout() {
  const { user, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-surface-1">Loading…</div>;

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex min-h-screen w-full bg-surface-1">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy p-4 text-white md:flex">
        <Logo light />
        <div className="mt-6 rounded-xl bg-white/5 p-3">
          <p className="text-h3">Hi, {firstName} 👋</p>
          <p className="mt-0.5 text-xs text-white/60">Car Course · Westlands</p>
        </div>

        <nav className="mt-6 space-y-1">
          {NAV.map((item, i) => {
            const active = i === 0 && path === "/dashboard";
            return (
              <Link
                key={item.label} to={item.to as any}
                className={cn("group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                {active && <span className="absolute left-0 h-6 w-0.5 rounded-r bg-brand" />}
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold">{item.badge}</span>}
                {item.soon && <span className="text-[10px] text-white/40">soon</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4">
          <Logo />
          <Button variant="ghost" size="icon-sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
