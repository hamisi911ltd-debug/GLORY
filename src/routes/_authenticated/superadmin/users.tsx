import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Edit, KeyRound, Ban, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/superadmin/users")({
  head: () => ({ meta: [{ title: "User Management — DriveSchool Pro" }] }),
  component: UsersPage,
});

type AppRole = "super_admin" | "branch_admin" | "instructor" | "finance" | "examiner" | "student";

interface PlatformUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: AppRole;
  branch: string;
  status: "active" | "banned";
  lastActive: string;
}

const USERS: PlatformUser[] = [
  { id: "1", name: "Admin User", initials: "AU", email: "admin@driveschoolpro.com", role: "super_admin", branch: "All branches", status: "active", lastActive: "Now" },
  { id: "2", name: "Grace Wanjiru", initials: "GW", email: "grace@driveschoolpro.com", role: "branch_admin", branch: "Westlands", status: "active", lastActive: "5 min ago" },
  { id: "3", name: "James Mwangi", initials: "JM", email: "james@driveschoolpro.com", role: "instructor", branch: "Westlands", status: "active", lastActive: "1 hour ago" },
  { id: "4", name: "Finance Officer", initials: "FO", email: "finance@driveschoolpro.com", role: "finance", branch: "Karen", status: "active", lastActive: "Today" },
  { id: "5", name: "Peter Otieno", initials: "PO", email: "peter@driveschoolpro.com", role: "examiner", branch: "Mombasa Road", status: "active", lastActive: "Yesterday" },
  { id: "6", name: "Amara Njeri", initials: "AN", email: "amara@example.com", role: "student", branch: "Westlands", status: "active", lastActive: "2 hours ago" },
  { id: "7", name: "Brian Kiprotich", initials: "BK", email: "brian@example.com", role: "student", branch: "Westlands", status: "active", lastActive: "Today" },
  { id: "8", name: "Felix Omondi", initials: "FO2", email: "felix@example.com", role: "student", branch: "Westlands", status: "banned", lastActive: "3 weeks ago" },
];

const roleConfig: Record<AppRole, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-danger-light text-danger" },
  branch_admin: { label: "Branch Admin", color: "bg-brand-light text-brand" },
  instructor: { label: "Instructor", color: "bg-success-light text-success" },
  finance: { label: "Finance", color: "bg-warning-light text-warning-foreground" },
  examiner: { label: "Examiner", color: "bg-purple-light text-purple" },
  student: { label: "Student", color: "bg-info-light text-info" },
};

const ROLE_FILTERS: { key: AppRole | "all"; label: string }[] = [
  { key: "all", label: "All roles" },
  { key: "branch_admin", label: "Branch Admin" },
  { key: "instructor", label: "Instructor" },
  { key: "finance", label: "Finance" },
  { key: "examiner", label: "Examiner" },
  { key: "student", label: "Student" },
];

function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [users, setUsers] = useState(USERS);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleBan = (id: string) => {
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u
    ));
    toast.success("User status updated");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-navy">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{users.length} users platform-wide</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                roleFilter === f.key ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Branch</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Last active</th>
                <th className="px-4 py-3 text-label-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => {
                const role = roleConfig[u.role];
                return (
                  <tr key={u.id} className="hover:bg-surface-1 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-xs font-bold text-white">
                          {u.initials.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", role.color)}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.branch}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          u.status === "active" ? "bg-success" : "bg-danger",
                        )} />
                        <span className="capitalize text-sm">{u.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.lastActive}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toast.info("Edit role coming soon")}
                          className="rounded p-1.5 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                          title="Edit role"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.success("Password reset email sent")}
                          className="rounded p-1.5 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                          title="Reset password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleBan(u.id)}
                          className={cn(
                            "rounded p-1.5 transition-colors",
                            u.status === "banned"
                              ? "text-success hover:bg-success-light"
                              : "text-danger hover:bg-danger-light",
                          )}
                          title={u.status === "banned" ? "Unban user" : "Ban user"}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">No users found.</div>
        )}
      </div>
    </div>
  );
}
