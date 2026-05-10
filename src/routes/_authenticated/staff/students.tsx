import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Eye, Edit, MessageSquare, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/staff/students")({
  head: () => ({ meta: [{ title: "Student Management — DriveSchool Pro" }] }),
  component: StudentsPage,
});

type StudentStatus = "active" | "pending" | "suspended";

interface Student {
  id: string;
  name: string;
  initials: string;
  course: string;
  branch: string;
  enrolled: string;
  progress: number;
  balance: number;
  status: StudentStatus;
  phone: string;
  email: string;
}

const STUDENTS: Student[] = [
  { id: "1", name: "Amara Njeri", initials: "AN", course: "Car (Standard)", branch: "Westlands", enrolled: "1 May 2026", progress: 40, balance: 0, status: "active", phone: "0712 345 678", email: "amara@example.com" },
  { id: "2", name: "Brian Kiprotich", initials: "BK", course: "Car (Premium)", branch: "Westlands", enrolled: "28 Apr 2026", progress: 65, balance: 0, status: "active", phone: "0723 456 789", email: "brian@example.com" },
  { id: "3", name: "Cynthia Odhiambo", initials: "CO", course: "Motorcycle (Basic)", branch: "Westlands", enrolled: "5 May 2026", progress: 20, balance: 3000, status: "pending", phone: "0734 567 890", email: "cynthia@example.com" },
  { id: "4", name: "David Mwenda", initials: "DM", course: "HGV (Standard)", branch: "Westlands", enrolled: "15 Apr 2026", progress: 80, balance: 0, status: "active", phone: "0745 678 901", email: "david@example.com" },
  { id: "5", name: "Esther Kamau", initials: "EK", course: "Car (Basic)", branch: "Westlands", enrolled: "3 May 2026", progress: 10, balance: 8500, status: "pending", phone: "0756 789 012", email: "esther@example.com" },
  { id: "6", name: "Felix Omondi", initials: "FO", course: "Car (Standard)", branch: "Westlands", enrolled: "20 Mar 2026", progress: 5, balance: 0, status: "suspended", phone: "0767 890 123", email: "felix@example.com" },
];

const statusConfig: Record<StudentStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  suspended: { label: "Suspended", variant: "danger" },
};

const FILTERS: { key: StudentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "suspended", label: "Suspended" },
];

function StudentDrawer({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-h2 text-navy">Student profile</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-xl font-bold text-white">
              {student.initials}
            </div>
            <div>
              <h3 className="text-h3 text-navy">{student.name}</h3>
              <p className="text-sm text-muted-foreground">{student.course}</p>
              <Badge variant={statusConfig[student.status].variant} size="sm" className="mt-1">
                {statusConfig[student.status].label}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Phone" value={student.phone} />
            <Row label="Email" value={student.email} />
            <Row label="Branch" value={student.branch} />
            <Row label="Enrolled" value={student.enrolled} />
            <Row label="Balance due" value={student.balance > 0 ? `KES ${student.balance.toLocaleString()}` : "Paid up"} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Course progress</span>
              <span className="font-semibold text-navy">{student.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${student.progress}%` }} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1"><MessageSquare className="mr-1.5 h-4 w-4" /> Message</Button>
            <Button variant="secondary" size="sm" className="flex-1"><Edit className="mr-1.5 h-4 w-4" /> Edit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-navy">{value}</span>
    </div>
  );
}

function StudentsPage() {
  const [filter, setFilter] = useState<StudentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = STUDENTS.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-navy">Student Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{STUDENTS.length} students enrolled at Westlands</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add student
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.key ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
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
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Course</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Enrolled</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Progress</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Balance</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-label-sm text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const cfg = statusConfig[s.status];
                return (
                  <tr
                    key={s.id}
                    className="cursor-pointer hover:bg-surface-1 transition-colors"
                    onClick={() => setSelected(s)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-xs font-bold text-white">
                          {s.initials}
                        </div>
                        <span className="font-medium text-navy">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.course}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.enrolled}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-2">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.balance > 0
                        ? <span className="font-medium text-danger">KES {s.balance.toLocaleString()}</span>
                        : <span className="text-success">Paid</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelected(s)} className="rounded p-1.5 hover:bg-surface-2 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1.5 hover:bg-surface-2 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1.5 hover:bg-surface-2 text-muted-foreground hover:text-foreground">
                          <MessageSquare className="h-4 w-4" />
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
          <div className="py-12 text-center text-muted-foreground">No students found.</div>
        )}
      </div>

      {selected && <StudentDrawer student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
