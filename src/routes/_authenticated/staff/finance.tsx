import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Download, Plus, CheckCircle2,
  Clock, XCircle, FileText, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/staff/finance")({
  head: () => ({ meta: [{ title: "Finance Dashboard — DriveSchool Pro" }] }),
  component: FinanceDashboard,
});

type PayMethod = "mpesa" | "card" | "cash";
type PayStatus = "paid" | "pending" | "failed";

interface PayRecord {
  id: string;
  student: string;
  date: string;
  amount: number;
  method: PayMethod;
  status: PayStatus;
  ref: string;
}

const allPayments: PayRecord[] = [
  { id: "1", student: "Amara Njeri", date: "10 May 2026", amount: 500, method: "mpesa", status: "paid", ref: "QHJ7K2L9" },
  { id: "2", student: "Brian Kiprotich", date: "10 May 2026", amount: 11500, method: "card", status: "paid", ref: "PI_3NxK" },
  { id: "3", student: "Cynthia Odhiambo", date: "9 May 2026", amount: 500, method: "cash", status: "paid", ref: "CASH-042" },
  { id: "4", student: "David Mwenda", date: "9 May 2026", amount: 500, method: "mpesa", status: "pending", ref: "—" },
  { id: "5", student: "Esther Kamau", date: "8 May 2026", amount: 8500, method: "mpesa", status: "paid", ref: "QHJ8M3N1" },
  { id: "6", student: "Felix Omondi", date: "7 May 2026", amount: 500, method: "card", status: "failed", ref: "—" },
];

const revenueData = [
  { week: "W1", mpesa: 18000, card: 12000, cash: 5000 },
  { week: "W2", mpesa: 22000, card: 15000, cash: 7000 },
  { week: "W3", mpesa: 19000, card: 11000, cash: 4000 },
  { week: "W4", mpesa: 25500, card: 18000, cash: 8000 },
];

const methodConfig: Record<PayMethod, { label: string; color: string }> = {
  mpesa: { label: "M-Pesa", color: "bg-success-light text-success" },
  card: { label: "Card", color: "bg-info-light text-info" },
  cash: { label: "Cash", color: "bg-warning-light text-warning-foreground" },
};

const statusConfig: Record<PayStatus, { label: string; icon: any; variant: "success" | "warning" | "danger" }> = {
  paid: { label: "Paid", icon: CheckCircle2, variant: "success" },
  pending: { label: "Pending", icon: Clock, variant: "warning" },
  failed: { label: "Failed", icon: XCircle, variant: "danger" },
};

function FinanceDashboard() {
  const [tab, setTab] = useState<"payments" | "invoices" | "expenses" | "reports">("payments");
  const [cashModal, setCashModal] = useState(false);
  const [cashForm, setCashForm] = useState({ student: "", amount: "", note: "" });

  const totalRevenue = allPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const outstanding = allPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const mpesaTotal = allPayments.filter((p) => p.status === "paid" && p.method === "mpesa").reduce((s, p) => s + p.amount, 0);
  const cardTotal = allPayments.filter((p) => p.status === "paid" && p.method === "card").reduce((s, p) => s + p.amount, 0);

  const recordCash = () => {
    if (!cashForm.student || !cashForm.amount) { toast.error("Fill in all required fields"); return; }
    setCashModal(false);
    setCashForm({ student: "", amount: "", note: "" });
    toast.success(`Cash payment of KES ${Number(cashForm.amount).toLocaleString()} recorded`);
  };

  const TABS = [
    { key: "payments" as const, label: "Payments", icon: DollarSign },
    { key: "invoices" as const, label: "Invoices", icon: FileText },
    { key: "expenses" as const, label: "Expenses", icon: TrendingDown },
    { key: "reports" as const, label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label-sm text-brand">Finance Officer</p>
          <h1 className="text-h1 text-navy">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Westlands Branch · May 2026</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCashModal(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Record cash payment
        </Button>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total revenue", value: `KES ${totalRevenue.toLocaleString()}`, sub: "This month", icon: TrendingUp, color: "text-success" },
          { label: "Collected today", value: "KES 12,000", sub: "3 transactions", icon: DollarSign, color: "text-info" },
          { label: "Outstanding", value: `KES ${outstanding.toLocaleString()}`, sub: `${allPayments.filter(p => p.status === "pending").length} pending`, icon: Clock, color: "text-warning-foreground" },
          { label: "M-Pesa vs Card", value: `${Math.round((mpesaTotal / (mpesaTotal + cardTotal)) * 100)}% M-Pesa`, sub: `KES ${cardTotal.toLocaleString()} card`, icon: BarChart3, color: "text-purple" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-label-sm text-muted-foreground">{k.label}</p>
                <p className={cn("mt-1 text-h2 font-bold", k.color)}>{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.sub}</p>
              </div>
              <k.icon className={cn("h-5 w-5", k.color)} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "payments" && (
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-1">
                    <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Student</th>
                    <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-label-sm text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Method</th>
                    <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Ref</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allPayments.map((p) => {
                    const method = methodConfig[p.method];
                    const status = statusConfig[p.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={p.id} className="hover:bg-surface-1 transition-colors">
                        <td className="px-4 py-3 font-medium text-navy">{p.student}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.date}</td>
                        <td className="px-4 py-3 text-right font-semibold text-navy">KES {p.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", method.color)}>{method.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={status.variant} size="sm" className="gap-1">
                            <StatusIcon className="h-3 w-3" /> {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.ref}</td>
                        <td className="px-4 py-3">
                          {p.status === "paid" && (
                            <button onClick={() => toast.success("Receipt downloaded")} className="flex items-center gap-1 text-xs text-brand-blue hover:underline">
                              <Download className="h-3.5 w-3.5" /> Receipt
                            </button>
                          )}
                          {p.status === "pending" && (
                            <button onClick={() => toast.success("Marked as received")} className="text-xs text-success hover:underline">
                              Mark received
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "invoices" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h2 text-navy">Invoices</h2>
              <Button variant="primary" size="sm" onClick={() => toast.info("Invoice generator coming soon")}>
                <Plus className="mr-1.5 h-4 w-4" /> Generate invoice
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {allPayments.filter((p) => p.status === "paid").map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-surface-1 transition-colors">
                  <div>
                    <p className="font-medium text-navy">INV-{p.id.padStart(4, "0")}</p>
                    <p className="text-xs text-muted-foreground">{p.student} · {p.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-navy">KES {p.amount.toLocaleString()}</span>
                    <button onClick={() => toast.success("Invoice downloaded")} className="flex items-center gap-1 text-xs text-brand-blue hover:underline">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h2 text-navy">Expense tracking</h2>
              <Button variant="primary" size="sm" onClick={() => toast.info("Expense form coming soon")}>
                <Plus className="mr-1.5 h-4 w-4" /> Log expense
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { desc: "Fuel — KAB 123X", amount: 4500, date: "9 May 2026", cat: "Fuel" },
                { desc: "Vehicle service — KAB 456Y", amount: 12000, date: "5 May 2026", cat: "Maintenance" },
                { desc: "Office supplies", amount: 1200, date: "3 May 2026", cat: "Utilities" },
              ].map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-navy">{e.desc}</p>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" size="sm">{e.cat}</Badge>
                    <span className="font-semibold text-danger">-KES {e.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-h2 text-navy">Monthly revenue breakdown</h2>
              <Button variant="secondary" size="sm" onClick={() => toast.success("Report exported")}>
                <Download className="mr-1.5 h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, ""]} />
                  <Bar dataKey="mpesa" name="M-Pesa" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="card" name="Card" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cash" name="Cash" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Cash payment modal */}
      {cashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-h2 text-navy">Record cash payment</h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Student name *</Label>
                <Input value={cashForm.student} onChange={(e) => setCashForm({ ...cashForm, student: e.target.value })} placeholder="Search student…" />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (KES) *</Label>
                <Input type="number" value={cashForm.amount} onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Input value={cashForm.note} onChange={(e) => setCashForm({ ...cashForm, note: e.target.value })} placeholder="e.g. Lesson #4 payment" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCashModal(false)}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={recordCash}>Record</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
