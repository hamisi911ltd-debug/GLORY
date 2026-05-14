import { createFileRoute } from "@tanstack/react-router";
import {
  Users, CalendarDays, DollarSign, Car, TrendingUp, Clock,
  ArrowUpRight, MoreHorizontal,
} from "lucide-react";
import { KpiCard } from "@/components/site/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/staff/dashboard")({
  head: () => ({ meta: [{ title: "Branch Admin Dashboard — DriveSchool Pro" }] }),
  component: BranchAdminDashboard,
});

const todayLessons = [
  { time: "8:00 AM", student: "Amara Njeri", instructor: "JM", vehicle: "KAB 123X", status: "completed" },
  { time: "9:00 AM", student: "Brian Kiprotich", instructor: "GW", vehicle: "KAB 456Y", status: "in-progress" },
  { time: "10:00 AM", student: "Cynthia Odhiambo", instructor: "JM", vehicle: "KAB 123X", status: "upcoming" },
  { time: "11:00 AM", student: "David Mwenda", instructor: "PO", vehicle: "KAC 789Z", status: "upcoming" },
  { time: "2:00 PM", student: "Esther Kamau", instructor: "GW", vehicle: "KAB 456Y", status: "upcoming" },
];

const recentPayments = [
  { student: "Amara Njeri", amount: 500, method: "M-Pesa", time: "8:45 AM" },
  { student: "Brian Kiprotich", amount: 11500, method: "Card", time: "Yesterday" },
  { student: "Cynthia Odhiambo", amount: 500, method: "Cash", time: "Yesterday" },
  { student: "David Mwenda", amount: 500, method: "M-Pesa", time: "2 days ago" },
];

const utilizationData = [
  { name: "James M.", used: 85 },
  { name: "Grace W.", used: 72 },
  { name: "Peter O.", used: 60 },
  { name: "Sarah M.", used: 45 },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  completed: { label: "Done", color: "bg-success-light text-success" },
  "in-progress": { label: "In progress", color: "bg-info-light text-info" },
  upcoming: { label: "Upcoming", color: "bg-surface-2 text-muted-foreground" },
};

function BranchAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-label-sm text-brand">Branch Admin</p>
          <h1 className="text-h1 text-navy md:text-display-lg">Westlands Branch</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sunday, 10 May 2026</p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">Branch online</Badge>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} tone="info" label="Active Students" value="47" hint="+3 this week" />
        <KpiCard icon={CalendarDays} tone="success" label="Lessons Today" value="12" hint="5 completed" />
        <KpiCard icon={DollarSign} tone="warning" label="Revenue This Month" value="KES 84,500" hint="+12% vs last month" />
        <KpiCard icon={Car} tone="purple" label="Vehicles Available" value="4 / 6" hint="2 in service" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Today's schedule */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 text-navy">Today's schedule</h2>
            <Button variant="ghost" size="sm">View full calendar</Button>
          </div>
          <div className="mt-4 space-y-3">
            {todayLessons.map((l, i) => {
              const cfg = statusConfig[l.status];
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 shrink-0 text-right text-xs font-mono text-muted-foreground">{l.time}</div>
                  <div className="h-full w-px bg-border" />
                  <div className="flex flex-1 items-center gap-3 rounded-lg border border-border p-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
                      {l.instructor}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{l.student}</p>
                      <p className="font-mono text-xs text-muted-foreground">{l.vehicle}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent payments */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 text-navy">Recent payments</h2>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="mt-4 space-y-2">
            {recentPayments.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg p-2.5 hover:bg-surface-1 transition-colors">
                <div>
                  <p className="text-sm font-medium text-navy">{p.student}</p>
                  <p className="text-xs text-muted-foreground">{p.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-navy">KES {p.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{p.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructor utilisation */}
      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-navy">Instructor utilisation today</h2>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-6 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={72} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-white p-2 shadow-md">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
                        <p className="text-sm font-bold text-navy">{payload[0].value}% Utilisation</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="used" 
                fill="var(--color-brand)" 
                radius={[0, 4, 4, 0]} 
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
