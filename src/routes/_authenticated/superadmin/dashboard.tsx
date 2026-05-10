import { createFileRoute } from "@tanstack/react-router";
import {
  Users, DollarSign, CalendarDays, Award, Building2, UserCheck,
  ShieldAlert, TrendingUp,
} from "lucide-react";
import { KpiCard } from "@/components/site/KpiCard";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_authenticated/superadmin/dashboard")({
  head: () => ({ meta: [{ title: "Super Admin — DriveSchool Pro" }] }),
  component: SuperAdminDashboard,
});

const revenueData = [
  { month: "Jun", westlands: 62000, karen: 48000, mombasa: 35000 },
  { month: "Jul", westlands: 71000, karen: 52000, mombasa: 41000 },
  { month: "Aug", westlands: 68000, karen: 55000, mombasa: 38000 },
  { month: "Sep", westlands: 80000, karen: 60000, mombasa: 45000 },
  { month: "Oct", westlands: 75000, karen: 58000, mombasa: 42000 },
  { month: "Nov", westlands: 88000, karen: 65000, mombasa: 50000 },
  { month: "Dec", westlands: 95000, karen: 72000, mombasa: 55000 },
  { month: "Jan", westlands: 82000, karen: 68000, mombasa: 48000 },
  { month: "Feb", westlands: 90000, karen: 74000, mombasa: 52000 },
  { month: "Mar", westlands: 98000, karen: 80000, mombasa: 58000 },
  { month: "Apr", westlands: 105000, karen: 85000, mombasa: 62000 },
  { month: "May", westlands: 84500, karen: 71000, mombasa: 53000 },
];

const branches = [
  { name: "Westlands", students: 47, revenue: "KES 84,500", passRate: "96%", status: "online" },
  { name: "Karen", students: 38, revenue: "KES 71,000", passRate: "94%", status: "online" },
  { name: "Mombasa Road", students: 29, revenue: "KES 53,000", passRate: "91%", status: "online" },
];

const auditLog = [
  { action: "Student enrolled", entity: "Student", user: "Grace Wanjiru", role: "Branch Admin", time: "2 min ago", type: "create" },
  { action: "Payment recorded", entity: "Payment", user: "Finance Officer", role: "Finance", time: "15 min ago", type: "create" },
  { action: "Lesson rescheduled", entity: "Lesson", user: "James Mwangi", role: "Instructor", time: "1 hour ago", type: "update" },
  { action: "Vehicle status updated", entity: "Vehicle", user: "Grace Wanjiru", role: "Branch Admin", time: "2 hours ago", type: "update" },
  { action: "Course price updated", entity: "Course", user: "Super Admin", role: "Super Admin", time: "Yesterday", type: "update" },
];

const typeColor: Record<string, string> = {
  create: "bg-success-light text-success",
  update: "bg-warning-light text-warning-foreground",
  delete: "bg-danger-light text-danger",
};

function SuperAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-label-sm text-brand">Super Admin</p>
          <h1 className="text-h1 text-navy md:text-display-lg">Platform Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">All branches · Live data</p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">All systems operational</Badge>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Users} tone="info" label="Total Students" value="114" hint="All branches" />
        <KpiCard icon={DollarSign} tone="success" label="Revenue MTD" value="KES 208,500" hint="+14% vs last month" />
        <KpiCard icon={CalendarDays} tone="warning" label="Active Lessons" value="12" hint="Right now" />
        <KpiCard icon={UserCheck} tone="purple" label="Instructors" value="15" hint="Across 3 branches" />
        <KpiCard icon={Building2} tone="info" label="Branches Online" value="3 / 3" hint="All operational" />
        <KpiCard icon={Award} tone="success" label="Certificates Issued" value="342" hint="This year" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 text-navy">Revenue by branch (12 months)</h2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ right: 8 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="westlands" name="Westlands" stroke="var(--color-brand)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="karen" name="Karen" stroke="var(--color-info)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mombasa" name="Mombasa Rd" stroke="var(--color-success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch performance */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <h2 className="text-h2 text-navy">Branch performance</h2>
          <div className="mt-4 space-y-4">
            {branches.map((b) => (
              <div key={b.name} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-navy">{b.name}</p>
                  <Badge variant="success" size="sm">{b.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="font-semibold text-navy">{b.students}</p>
                    <p className="text-muted-foreground">Students</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{b.passRate}</p>
                    <p className="text-muted-foreground">Pass rate</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-[11px]">{b.revenue}</p>
                    <p className="text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-navy">Recent audit log</h2>
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-2">
          {auditLog.map((entry, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg p-3 hover:bg-surface-1 transition-colors text-sm">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor[entry.type]}`}>
                {entry.type}
              </span>
              <span className="flex-1 text-navy">{entry.action}</span>
              <Badge variant="default" size="sm">{entry.entity}</Badge>
              <span className="text-muted-foreground">{entry.user}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
