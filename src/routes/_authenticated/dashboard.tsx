import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, BookOpen, AlertCircle, ArrowRight, Clock, MapPin } from "lucide-react";
import { KpiCard } from "@/components/site/KpiCard";
import { ProgressRing } from "@/components/site/ProgressRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DriveSchool Pro" }] }),
  component: DashboardPage,
});

const lessons = [
  { id: 1, day: "Wed", date: "14 May", time: "10:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", status: "confirmed", color: "var(--color-info)" },
  { id: 2, day: "Fri", date: "16 May", time: "2:00 PM", instructor: "Grace Wanjiru", initials: "GW", vehicle: "Car", plate: "KAB 456Y", status: "confirmed", color: "var(--color-success)" },
  { id: 3, day: "Mon", date: "19 May", time: "9:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", status: "pending", color: "var(--color-info)" },
];

const milestones = [
  { label: "Enrolled", state: "done" },
  { label: "Theory Module 1", state: "done" },
  { label: "Lessons — 8 of 20", state: "current" },
  { label: "Theory Mock Test", state: "todo" },
  { label: "Exam Assessment", state: "todo" },
  { label: "Certificate", state: "todo" },
];

function DashboardPage() {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).single()
      .then(({ data }) => setName(data?.full_name?.split(" ")[0] ?? "there"));
  }, [user]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-h1 text-navy md:text-display-lg">Good morning, {name || "there"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Calendar} tone="info" label="Next Lesson" value="Wed 14 May" hint="10:00am · James Mwangi" />
        <KpiCard icon={CheckCircle2} tone="success" label="Lessons Completed" value="8 / 20" hint="40% complete" />
        <KpiCard icon={BookOpen} tone="warning" label="Theory Score" value="74%" hint="2 categories left" />
        <KpiCard icon={AlertCircle} tone="danger" label="Balance Due" value="KES 3,500"
          action={<Button size="sm" variant="primary">Pay now</Button>} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Progress */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs lg:col-span-2">
          <h2 className="text-h3 text-navy">My progress</h2>
          <div className="mt-6 flex justify-center">
            <ProgressRing value={40} label="Complete" />
          </div>
          <ul className="mt-8 space-y-3">
            {milestones.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-sm">
                <span className={
                  m.state === "done" ? "flex h-5 w-5 items-center justify-center rounded-full bg-success text-white" :
                  m.state === "current" ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-white" :
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-white"
                }>
                  {m.state === "done" && <CheckCircle2 className="h-3 w-3" strokeWidth={3} />}
                  {m.state === "current" && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className={m.state === "todo" ? "text-muted-foreground" : "text-foreground"}>{m.label}</span>
                {m.state === "current" && <Badge variant="info" size="sm" className="ml-auto">In progress</Badge>}
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming lessons + quick actions */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-navy">Upcoming lessons</h2>
              <a href="#" className="text-sm font-medium text-brand-blue hover:underline">See all →</a>
            </div>
            <div className="mt-4 space-y-3">
              {lessons.map((l) => (
                <div key={l.id} className="group flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md">
                  <div className="h-12 w-1 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                  <div className="flex w-16 flex-col items-center text-center">
                    <span className="text-label-sm text-muted-foreground">{l.day}</span>
                    <span className="text-h3 text-navy">{l.date.split(" ")[0]}</span>
                    <span className="text-xs text-muted-foreground">{l.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{l.time}</span>
                      <Badge variant={l.status === "confirmed" ? "success" : "warning"} size="sm">
                        {l.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-[10px] font-semibold text-white">{l.initials}</span>
                      <span>{l.instructor}</span>
                      <span>·</span>
                      <span className="font-mono text-xs">{l.plate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <h2 className="text-h3 text-navy">Quick actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ActionCard icon={Calendar} title="Book next lesson" tone="info" to="/book" />
              <ActionCard icon={AlertCircle} title="Pay balance" tone="brand" to="/payments" />
              <ActionCard icon={BookOpen} title="Take theory quiz" tone="purple" to="/theory" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, tone, to }: { icon: any; title: string; tone: "info" | "brand" | "purple"; to: string }) {
  const toneCls = { info: "bg-info-light text-info", brand: "bg-brand-light text-brand", purple: "bg-purple-light text-purple" }[tone];
  return (
    <Link to={to as any} className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-left transition-all hover:border-brand-blue hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneCls}`}><Icon className="h-5 w-5" /></div>
      <span className="flex-1 text-sm font-medium">{title}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
