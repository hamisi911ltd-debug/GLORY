import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays, CheckCircle2, Clock, Star, Car, ChevronDown, ChevronUp,
  PenLine, Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/staff/instructor")({
  head: () => ({ meta: [{ title: "Instructor Dashboard — DriveSchool Pro" }] }),
  component: InstructorDashboard,
});

interface LessonItem {
  id: number;
  time: string;
  student: string;
  initials: string;
  vehicle: string;
  plate: string;
  status: "upcoming" | "in-progress" | "completed";
  notes?: string;
}

const todayLessons: LessonItem[] = [
  { id: 1, time: "8:00 AM", student: "Amara Njeri", initials: "AN", vehicle: "Car", plate: "KAB 123X", status: "completed", notes: "Good progress on roundabouts. Work on mirror checks." },
  { id: 2, time: "10:00 AM", student: "Brian Kiprotich", initials: "BK", vehicle: "Car", plate: "KAB 123X", status: "in-progress" },
  { id: 3, time: "12:00 PM", student: "Cynthia Odhiambo", initials: "CO", vehicle: "Car", plate: "KAB 456Y", status: "upcoming" },
  { id: 4, time: "2:00 PM", student: "David Mwenda", initials: "DM", vehicle: "Car", plate: "KAB 456Y", status: "upcoming" },
];

const myStudents = [
  { name: "Amara Njeri", initials: "AN", progress: 40, lessons: 8, lastLesson: "Today", rating: null },
  { name: "Brian Kiprotich", initials: "BK", progress: 65, lessons: 13, lastLesson: "Today", rating: null },
  { name: "Cynthia Odhiambo", initials: "CO", progress: 20, lessons: 4, lastLesson: "Today", rating: null },
  { name: "David Mwenda", initials: "DM", progress: 80, lessons: 24, lastLesson: "Today", rating: null },
  { name: "Esther Kamau", initials: "EK", progress: 10, lessons: 2, lastLesson: "3 days ago", rating: 5 },
];

const ratings = [
  { student: "Esther Kamau", stars: 5, comment: "Very patient and clear instructions. Highly recommend!", date: "7 May 2026" },
  { student: "Felix Omondi", stars: 4, comment: "Good instructor, helped me overcome my fear of roundabouts.", date: "5 May 2026" },
  { student: "Grace Wanjiru", stars: 5, comment: "Excellent! Passed my test first time thanks to James.", date: "1 May 2026" },
];

const statusConfig = {
  upcoming: { label: "Upcoming", color: "bg-surface-2 text-muted-foreground" },
  "in-progress": { label: "In progress", color: "bg-info-light text-info" },
  completed: { label: "Completed", color: "bg-success-light text-success" },
};

function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState<"today" | "students" | "ratings" | "availability">("today");
  const [noteModal, setNoteModal] = useState<LessonItem | null>(null);
  const [noteText, setNoteText] = useState("");
  const [lessons, setLessons] = useState(todayLessons);

  const markComplete = (id: number) => {
    setLessons((prev) => prev.map((l) => l.id === id ? { ...l, status: "completed" as const } : l));
    toast.success("Lesson marked as complete");
  };

  const saveNote = () => {
    if (!noteModal) return;
    setLessons((prev) => prev.map((l) => l.id === noteModal.id ? { ...l, notes: noteText } : l));
    setNoteModal(null);
    setNoteText("");
    toast.success("Lesson notes saved");
  };

  const completed = lessons.filter((l) => l.status === "completed").length;
  const avgRating = (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1);

  const TABS = [
    { key: "today" as const, label: "Today's lessons", icon: CalendarDays },
    { key: "students" as const, label: "My students", icon: Users },
    { key: "ratings" as const, label: "My ratings", icon: Star },
    { key: "availability" as const, label: "Availability", icon: Clock },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-label-sm text-brand">Instructor</p>
          <h1 className="text-h1 text-navy md:text-display-lg">James Mwangi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Westlands Branch · Car specialist</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-warning-light px-3 py-2">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold text-navy">{avgRating}</span>
            <span className="text-sm text-muted-foreground">({ratings.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Lessons today", value: lessons.length, sub: `${completed} completed` },
          { label: "Students assigned", value: myStudents.length, sub: "Active" },
          { label: "Hours this week", value: "14h", sub: "of 40h available" },
          { label: "Avg rating", value: avgRating, sub: `${ratings.length} reviews` },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <p className="text-h2 text-navy">{k.value}</p>
            <p className="text-xs font-medium text-foreground">{k.label}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === t.key ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* Today's lessons */}
        {activeTab === "today" && (
          <div className="space-y-3">
            {lessons.map((l) => {
              const cfg = statusConfig[l.status];
              return (
                <div key={l.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-sm font-bold text-white">
                      {l.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-navy">{l.student}</p>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.color)}>{cfg.label}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {l.time}</span>
                        <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" /> <span className="font-mono text-xs">{l.plate}</span></span>
                      </div>
                      {l.notes && (
                        <div className="mt-2 rounded-lg bg-surface-1 p-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Notes: </span>{l.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {l.status !== "completed" && (
                        <Button variant="primary" size="sm" onClick={() => markComplete(l.id)}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => { setNoteModal(l); setNoteText(l.notes ?? ""); }}>
                        <PenLine className="mr-1 h-3.5 w-3.5" /> Notes
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My students */}
        {activeTab === "students" && (
          <div className="space-y-3">
            {myStudents.map((s) => (
              <div key={s.name} className="flex items-center gap-4 rounded-xl border border-border bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-sm font-bold text-white">
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.lessons} lessons · Last: {s.lastLesson}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${s.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{s.progress}%</span>
                  </div>
                </div>
                {s.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{s.rating}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ratings */}
        {activeTab === "ratings" && (
          <div className="space-y-3">
            {ratings.map((r, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-navy">{r.student}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={cn("h-4 w-4", j < r.stars ? "fill-warning text-warning" : "text-border")} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="mt-3 text-sm text-muted-foreground italic">"{r.comment}"</p>}
              </div>
            ))}
          </div>
        )}

        {/* Availability */}
        {activeTab === "availability" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-h2 text-navy">Set your availability</h2>
            <p className="mt-1 text-sm text-muted-foreground">Mark the days and times you're available for lessons this week.</p>
            <div className="mt-6 space-y-3">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                const [available, setAvailable] = useState(day !== "Saturday");
                return (
                  <div key={day} className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAvailable(!available)}
                        className={cn("relative h-6 w-11 rounded-full transition-colors", available ? "bg-success" : "bg-surface-2")}
                      >
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", available ? "translate-x-5" : "translate-x-0.5")} />
                      </button>
                      <span className="font-medium text-navy">{day}</span>
                    </div>
                    {available && (
                      <span className="text-sm text-muted-foreground">8:00 AM – 6:00 PM</span>
                    )}
                    {!available && <Badge variant="default" size="sm">Off</Badge>}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="lg" onClick={() => toast.success("Availability saved")}>Save availability</Button>
            </div>
          </div>
        )}
      </div>

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-h2 text-navy">Lesson notes</h2>
            <p className="mt-1 text-sm text-muted-foreground">{noteModal.student} · {noteModal.time}</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add notes about this lesson…"
              rows={4}
              className="mt-4 w-full rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setNoteModal(null)}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={saveNote}>Save notes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
