import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import {
  Home, CalendarDays, BookOpen, CreditCard, FileText, GraduationCap,
  Bell, Settings, LogOut, Users, Car, BarChart3, Building2, ShieldCheck,
  UserCog, DollarSign, ClipboardCheck, Menu, X,
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

// Student nav
const STUDENT_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/schedule", label: "My Schedule", icon: CalendarDays },
  { to: "/book", label: "Book a Lesson", icon: BookOpen },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/theory", label: "Theory Tests", icon: GraduationCap },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { to: "/profile", label: "Profile & Settings", icon: Settings },
];

// Branch admin nav
const BRANCH_ADMIN_NAV = [
  { to: "/staff/dashboard", label: "Dashboard", icon: Home },
  { to: "/staff/students", label: "Students", icon: Users },
  { to: "/staff/fleet", label: "Fleet", icon: Car },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

// Instructor nav
const INSTRUCTOR_NAV = [
  { to: "/staff/instructor", label: "My Dashboard", icon: Home },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

// Finance nav
const FINANCE_NAV = [
  { to: "/staff/finance", label: "Finance Dashboard", icon: Home },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

// Examiner nav
const EXAMINER_NAV = [
  { to: "/staff/examiner", label: "Assessments", icon: Home },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

// Super admin nav
const SUPER_ADMIN_NAV = [
  { to: "/superadmin/dashboard", label: "Platform Overview", icon: Home },
  { to: "/superadmin/users", label: "User Management", icon: UserCog },
  { to: "/dashboard", label: "Branches", icon: Building2, soon: true },
  { to: "/superadmin/courses", label: "Courses & Pricing", icon: BookOpen },
  { to: "/dashboard", label: "Audit Logs", icon: ShieldCheck, soon: true },
  { to: "/dashboard", label: "Reports", icon: BarChart3, soon: true },
];

type NavItem = { to: string; label: string; icon: any; soon?: boolean; badge?: number };

function NavLink({ item, active, mobile = false }: { item: NavItem; active: boolean; mobile?: boolean }) {
  return (
    <Link
      to={item.to as any}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        mobile 
          ? active 
            ? "bg-brand/10 text-brand border border-brand/20" 
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          : active 
            ? "bg-white/10 text-white" 
            : "text-white/70 hover:bg-white/5 hover:text-white",
      )}
    >
      {active && !mobile && <span className="absolute left-0 h-6 w-0.5 rounded-r bg-brand" />}
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className={cn(
          "rounded-full px-1.5 text-[10px] font-semibold",
          mobile ? "bg-brand text-white" : "bg-brand"
        )}>{item.badge}</span>
      )}
      {item.soon && <span className={cn("text-[10px]", mobile ? "text-gray-400" : "text-white/40")}>soon</span>}
    </Link>
  );
}

function AuthenticatedLayout() {
  const { user, roles, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-1">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand" />
      </div>
    );
  }

  const isSuperAdmin = roles.includes("super_admin");
  const isBranchAdmin = roles.includes("branch_admin");
  const isInstructor = roles.includes("instructor");
  const isFinance = roles.includes("finance");
  const isExaminer = roles.includes("examiner");
  const isStaff = isSuperAdmin || isBranchAdmin || isInstructor || isFinance || isExaminer;

  const navItems: NavItem[] = isSuperAdmin
    ? SUPER_ADMIN_NAV
    : isBranchAdmin
    ? BRANCH_ADMIN_NAV
    : isInstructor
    ? INSTRUCTOR_NAV
    : isFinance
    ? FINANCE_NAV
    : isExaminer
    ? EXAMINER_NAV
    : STUDENT_NAV;

  const roleLabel = isSuperAdmin ? "Super Admin"
    : isBranchAdmin ? "Branch Admin"
    : isInstructor ? "Instructor"
    : isFinance ? "Finance"
    : isExaminer ? "Examiner"
    : "Student";

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="flex min-h-screen w-full bg-surface-1">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy p-4 text-white md:flex">
        <Logo light />
        <div className="mt-6 rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {firstName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Hi, {firstName}</p>
              <p className="text-xs text-white/60">{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => {
            const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
            return <NavLink key={item.label} item={item} active={active} />;
          })}
        </nav>

        {/* Role switcher hint for demo */}
        {!isStaff && (
          <div className="mt-2 space-y-1 border-t border-white/10 pt-3">
            <p className="px-3 text-[10px] text-white/30 uppercase tracking-wider">Demo portals</p>
            <Link to="/staff/dashboard" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
              <Building2 className="h-3.5 w-3.5" /> Branch Admin
            </Link>
            <Link to="/staff/instructor" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
              <Users className="h-3.5 w-3.5" /> Instructor
            </Link>
            <Link to="/staff/finance" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
              <DollarSign className="h-3.5 w-3.5" /> Finance
            </Link>
            <Link to="/staff/examiner" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
              <ClipboardCheck className="h-3.5 w-3.5" /> Examiner
            </Link>
            <Link to="/superadmin/dashboard" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
            </Link>
          </div>
        )}

        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm">
          <Logo />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {firstName[0]?.toUpperCase()}
            </div>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile menu */}
        <div className={cn(
          "fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {firstName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hi, {firstName}</p>
                  <p className="text-sm text-gray-500">{roleLabel}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
                  return (
                    <div key={item.label} onClick={() => setMobileMenuOpen(false)}>
                      <NavLink item={item} active={active} mobile />
                    </div>
                  );
                })}
              </div>

              {/* Mobile role switcher */}
              {!isStaff && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <p className="px-3 text-xs text-gray-400 uppercase tracking-wider mb-2">Demo portals</p>
                  <div className="space-y-1">
                    <Link to="/staff/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <Building2 className="h-4 w-4" /> Branch Admin
                    </Link>
                    <Link to="/staff/instructor" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <Users className="h-4 w-4" /> Instructor
                    </Link>
                    <Link to="/staff/finance" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <DollarSign className="h-4 w-4" /> Finance
                    </Link>
                    <Link to="/staff/examiner" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <ClipboardCheck className="h-4 w-4" /> Examiner
                    </Link>
                    <Link to="/superadmin/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldCheck className="h-4 w-4" /> Super Admin
                    </Link>
                  </div>
                </div>
              )}
            </nav>

            <div className="border-t border-gray-200 p-4">
              <div className="space-y-2">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
