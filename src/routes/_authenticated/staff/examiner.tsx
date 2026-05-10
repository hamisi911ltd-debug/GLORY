import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/staff/examiner")({
  head: () => ({ meta: [{ title: "Examiner Dashboard — DriveSchool Pro" }] }),
  component: ExaminerDashboard,
});

type ReadinessStatus = "pending" | "ready" | "not-ready";

interface StudentAssessment {
  id: string;
  name: string;
  initials: string;
  course: string;
  lessonsCompleted: number;
  totalLessons: number;
  theoryScore: number | null;
  readiness: ReadinessStatus;
  mockScore: number | null;
  comments: string;
  assessedAt: string | null;
}

const STUDENTS: StudentAssessment[] = [
  { id: "1", name: "Brian Kiprotich", initials: "BK", course: "Car (Premium)", lessonsCompleted: 25, totalLessons: 30, theoryScore: 88, readiness: "pending", mockScore: null, comments: "", assessedAt: null },
  { id: "2", name: "David Mwenda", initials: "DM", course: "HGV (Standard)", lessonsCompleted: 38, totalLessons: 40, theoryScore: 82, readiness: "pending", mockScore: null, comments: "", assessedAt: null },
  { id: "3", name: "Amara Njeri", initials: "AN", course: "Car (Standard)", lessonsCompleted: 20, totalLessons: 25, theoryScore: 75, readiness: "ready", mockScore: 84, comments: "Excellent control. Ready for official test.", assessedAt: "8 May 2026" },
  { id: "4", name: "Felix Omondi", initials: "FO", course: "Car (Basic)", lessonsCompleted: 18, totalLessons: 20, theoryScore: 62, readiness: "not-ready", mockScore: 58, comments: "Needs more practice on parallel parking and highway merging.", assessedAt: "5 May 2026" },
];

const readinessConfig: Record<ReadinessStatus, { label: string; variant: "warning" | "success" | "danger" }> = {
  pending: { label: "Pending assessment", variant: "warning" },
  ready: { label: "Exam ready", variant: "success" },
  "not-ready": { label: "Not ready", variant: "danger" },
};

function AssessmentCard({ student, onUpdate }: { student: StudentAssessment; onUpdate: (id: string, score: number, comments: string, ready: boolean) => void }) {
  const [expanded, setExpanded] = useState(student.readiness === "pending");
  const [score, setScore] = useState(student.mockScore ?? 0);
  const [comments, setComments] = useState(student.comments);
  const [saving, setSaving] = useState(false);

  const submit = async (ready: boolean) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onUpdate(student.id, score, comments, ready);
    setExpanded(false);
    toast.success(`${student.name} marked as ${ready ? "exam ready" : "not ready"}`);
  };

  const cfg = readinessConfig[student.readiness];

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <button
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-surface-1 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-sm font-bold text-white">
          {student.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-navy">{student.name}</p>
            <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{student.course}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
            <span>Lessons: {student.lessonsCompleted}/{student.totalLessons}</span>
            {student.theoryScore !== null && <span>Theory: {student.theoryScore}%</span>}
            {student.mockScore !== null && <span>Mock: {student.mockScore}%</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {student.assessedAt && (
            <p className="text-xs text-muted-foreground">Last assessed: {student.assessedAt}</p>
          )}

          <div>
            <label className="text-label-sm text-muted-foreground block mb-2">Mock test score (%)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="flex-1 accent-brand"
              />
              <span className={cn(
                "w-12 text-center font-bold text-lg",
                score >= 70 ? "text-success" : "text-danger",
              )}>{score}%</span>
            </div>
          </div>

          <div>
            <label className="text-label-sm text-muted-foreground block mb-2">Evaluator comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add assessment notes…"
              rows={3}
              className="w-full rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 border-danger text-danger hover:bg-danger-light"
              disabled={saving}
              onClick={() => submit(false)}
            >
              <XCircle className="mr-1.5 h-4 w-4" /> Not ready
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={saving || score === 0}
              onClick={() => submit(true)}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {saving ? "Saving…" : "Mark exam ready"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExaminerDashboard() {
  const [students, setStudents] = useState(STUDENTS);

  const pending = students.filter((s) => s.readiness === "pending").length;
  const ready = students.filter((s) => s.readiness === "ready").length;
  const notReady = students.filter((s) => s.readiness === "not-ready").length;

  const updateStudent = (id: string, score: number, comments: string, isReady: boolean) => {
    setStudents((prev) => prev.map((s) =>
      s.id === id ? {
        ...s,
        mockScore: score,
        comments,
        readiness: isReady ? "ready" : "not-ready",
        assessedAt: "10 May 2026",
      } : s
    ));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <div>
        <p className="text-label-sm text-brand">Examiner</p>
        <h1 className="text-h1 text-navy">Student Assessments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review assigned students and record mock test results.</p>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: pending, color: "text-warning-foreground", bg: "bg-warning-light" },
          { label: "Exam ready", value: ready, color: "text-success", bg: "bg-success-light" },
          { label: "Not ready", value: notReady, color: "text-danger", bg: "bg-danger-light" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl p-4 text-center", s.bg)}>
            <p className={cn("text-h1 font-bold", s.color)}>{s.value}</p>
            <p className={cn("text-xs font-medium", s.color)}>{s.label}</p>
          </div>
        ))}
      </div>

      {pending > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning bg-warning-light p-3 text-sm text-warning-foreground">
          <ClipboardCheck className="h-4 w-4 shrink-0" />
          <span><strong>{pending} student{pending > 1 ? "s" : ""}</strong> pending assessment. Expand to record results.</span>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {students.map((s) => (
          <AssessmentCard key={s.id} student={s} onUpdate={updateStudent} />
        ))}
      </div>
    </div>
  );
}
