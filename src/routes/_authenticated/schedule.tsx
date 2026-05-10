import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar, Clock, MapPin, User, Car, RotateCcw, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/schedule")({
  head: () => ({ meta: [{ title: "My Schedule — DriveSchool Pro" }] }),
  component: SchedulePage,
});

type LessonStatus = "confirmed" | "pending" | "completed" | "cancelled";

interface Lesson {
  id: number;
  date: string;
  day: string;
  time: string;
  instructor: string;
  initials: string;
  vehicle: string;
  plate: string;
  branch: string;
  status: LessonStatus;
  notes?: string;
}

const upcoming: Lesson[] = [
  { id: 1, date: "14 May 2026", day: "Wed", time: "10:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", branch: "Westlands", status: "confirmed" },
  { id: 2, date: "16 May 2026", day: "Fri", time: "2:00 PM", instructor: "Grace Wanjiru", initials: "GW", vehicle: "Car", plate: "KAB 456Y", branch: "Westlands", status: "confirmed" },
  { id: 3, date: "19 May 2026", day: "Mon", time: "9:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", branch: "Westlands", status: "pending" },
  { id: 4, date: "21 May 2026", day: "Wed", time: "11:00 AM", instructor: "Grace Wanjiru", initials: "GW", vehicle: "Car", plate: "KAB 456Y", branch: "Westlands", status: "pending" },
];

const past: Lesson[] = [
  { id: 5, date: "7 May 2026", day: "Thu", time: "10:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", branch: "Westlands", status: "completed", notes: "Good progress on roundabouts. Work on mirror checks before lane changes." },
  { id: 6, date: "5 May 2026", day: "Tue", time: "2:00 PM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", branch: "Westlands", status: "completed", notes: "Excellent parking technique. Ready to move to highway driving." },
  { id: 7, date: "30 Apr 2026", day: "Thu", time: "9:00 AM", instructor: "Grace Wanjiru", initials: "GW", vehicle: "Car", plate: "KAB 456Y", branch: "Westlands", status: "completed" },
  { id: 8, date: "28 Apr 2026", day: "Tue", time: "11:00 AM", instructor: "Grace Wanjiru", initials: "GW", vehicle: "Car", plate: "KAB 456Y", branch: "Westlands", status: "cancelled" },
];

const statusConfig: Record<LessonStatus, { label: string; variant: "success" | "warning" | "default" | "danger" }> = {
  confirmed: { label: "Confirmed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

function LessonCard({ lesson, showActions = false }: { lesson: Lesson; showActions?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[lesson.status];

  return (
    <div className={cn(
      "rounded-xl border border-border bg-white p-4 transition-all",
      lesson.status === "cancelled" && "opacity-60",
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-center",
          lesson.status === "completed" ? "bg-success-light text-success" :
          lesson.status === "cancelled" ? "bg-surface-2 text-muted-foreground" :
          "bg-info-light text-info",
        )}>
          <span className="text-[10px] font-semibold uppercase">{lesson.day}</span>
          <span className="text-lg font-bold leading-none">{lesson.date.split(" ")[0]}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {lesson.time}
            </span>
            <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {lesson.instructor}
            </span>
            <span className="flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{lesson.plate}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {lesson.branch}
            </span>
          </div>
          {lesson.notes && expanded && (
            <div className="mt-3 rounded-lg bg-surface-1 p-3 text-sm text-foreground">
              <p className="text-label-sm mb-1 text-muted-foreground">Instructor notes</p>
              {lesson.notes}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {lesson.notes && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-blue hover:underline">
              {expanded ? "Hide notes" : "View notes"}
            </button>
          )}
          {showActions && lesson.status !== "cancelled" && lesson.status !== "completed" && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Reschedule
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-danger hover:bg-danger-light hover:text-danger">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SchedulePage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-navy">My Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your upcoming and past lessons.</p>
        </div>
        <Button asChild variant="primary" size="sm">
          <Link to="/book"><Calendar className="mr-1.5 h-4 w-4" /> Book a lesson</Link>
        </Button>
      </div>

      {/* Policy notice */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning bg-warning-light p-4 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
        <p className="text-warning-foreground">
          <strong>Cancellation policy:</strong> Free cancellation 24+ hours before your lesson. Cancellations within 24 hours incur a KES 500 fee.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-surface-2 p-1 w-fit">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t} {t === "upcoming" ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tab === "upcoming"
          ? upcoming.map((l) => <LessonCard key={l.id} lesson={l} showActions />)
          : past.map((l) => <LessonCard key={l.id} lesson={l} />)
        }
      </div>

      {tab === "upcoming" && upcoming.length === 0 && (
        <div className="mt-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No upcoming lessons. Book one now!</p>
          <Button asChild variant="primary" size="sm" className="mt-4">
            <Link to="/book">Book a lesson</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
