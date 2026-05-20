import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Download, Plus, CheckCircle2,
  Clock, XCircle, FileText, BarChart3, AlertTriangle, User, Phone,
  Edit, Trash2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/staff/finance")({
  head: () => ({ meta: [{ title: "Finance Dashboard — DriveSchool Pro" }] }),
  component: FinanceDashboard,
});

type PayMethod = "mpesa" | "card" | "cash";
type PayStatus = "paid" | "pending" | "failed";

interface PayRecord {
  id: string;
  student: string;
  student_id: string;
  date: string;
  amount: number;
  method: PayMethod;
  status: PayStatus;
  ref: string;
  description?: string;
}

interface PendingBalance {
  id: string;
  student: string;
  phone: string;
  course: string;
  totalFees: number;
  amountPaid: number;
  balance: number;
  lastPayment: string;
  daysOverdue: number;
}

const methodConfig: Record<PayMethod, { label: string; color: string }> = {
  mpesa: { label: "M-Pesa", color: "bg-success-light text-success" },
  card:  { label: "Card",   color: "bg-info-light text-info" },
  cash:  { label: "Cash",   color: "bg-warning-light text-warning-foreground" },
};

const statusConfig: Record<PayStatus, { label: string; icon: any; variant: "success" | "warning" | "danger" }> = {
  paid:    { label: "Paid",    icon: CheckCircle2, variant: "success" },
  pending: { label: "Pending", icon: Clock,        variant: "warning" },
  failed:  { label: "Failed",  icon: XCircle,      variant: "danger" },
};

const revenueData = [
  { week: "Week 1", mpesa: 18000, card: 5000, cash: 3000 },
  { week: "Week 2", mpesa: 22000, card: 8000, cash: 4500 },
  { week: "Week 3", mpesa: 19500, card: 6000, cash: 2000 },
  { week: "Week 4", mpesa: 25000, card: 9500, cash: 5500 },
];
function FinanceDashboard() {
  const [tab, setTab] = useState<"payments" | "pending" | "invoices" | "expenses" | "reports">("payments");
  const [payments, setPayments] = useState<PayRecord[]>([]);
  const [balances, setBalances] = useState<PendingBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashModal, setCashModal] = useState(false);
  const [editModal, setEditModal] = useState<PayRecord | null>(null);
  const [cashForm, setCashForm] = useState({ student_id: "", amount: "", note: "", method: "cash" as PayMethod });

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch payments
      const { data: payData, error: payError } = await api.get<{ payments: any[] }>("/payments");

      if (payData && payData.payments) {
        setPayments(payData.payments.map((p: any) => ({
          id: p.id,
          student: p.student_full_name || p.full_name || "Unknown",
          student_id: p.student_id,
          date: new Date(p.created_at || p.payment_date).toLocaleDateString("en-GB"),
          amount: p.amount,
          method: p.payment_method as PayMethod,
          status: (p.status === "completed" ? "paid" : p.status) as PayStatus,
          ref: p.payment_reference || "—",
          description: p.description
        })));
      } else if (payError) {
        console.error("Fetch payments error:", payError);
      }

      // Fetch students for balances
      const { data: stuData, error: stuError } = await api.get<{ students: any[] }>("/students");

      if (stuData && stuData.students) {
        setBalances(stuData.students.map((s: any) => ({
          id: s.id,
          student: s.full_name || "Unknown",
          phone: s.phone || "N/A",
          course: s.course_name || "N/A",
          totalFees: s.course_price || 0,
          amountPaid: s.total_paid || 0,
          balance: s.balance || 0,
          lastPayment: "N/A",
          daysOverdue: 0
        })));
      } else if (stuError) {
        console.error("Fetch students error:", stuError);
      }
    } catch (error) {
      console.error("Load data error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = balances.reduce((s, p) => s + p.balance, 0);
  const mpesaTotal = payments.filter((p) => p.status === "paid" && p.method === "mpesa").reduce((s, p) => s + p.amount, 0);
  const cardTotal = payments.filter((p) => p.status === "paid" && p.method === "card").reduce((s, p) => s + p.amount, 0);

  const sendReminder = (student: string, phone: string, balance: number) => {
    toast.success(`Payment reminder sent to ${student} (${phone}) for KES ${balance.toLocaleString()}`);
  };

  const TABS = [
    { key: "payments" as const, label: "Payments", icon: DollarSign },
    { key: "pending" as const, label: "Outstanding", icon: AlertTriangle, badge: balances.filter(b => b.balance > 0).length },
    { key: "invoices" as const, label: "Invoices", icon: FileText },
    { key: "expenses" as const, label: "Expenses", icon: TrendingDown },
    { key: "reports" as const, label: "Reports", icon: BarChart3 },
  ];

  const handleRecordPayment = async () => {
    if (!cashForm.student_id || !cashForm.amount) {
      toast.error("Please fill in student and amount");
      return;
    }

    try {
      const { error } = await api.post("/payments/cash", {
        student_id: cashForm.student_id,
        amount: parseFloat(cashForm.amount),
        payment_method: cashForm.method,
        description: cashForm.note,
        receipt_number: `MAN-${Date.now()}`
      });

      if (error) throw new Error(error);

      toast.success("Payment recorded successfully");
      setCashModal(false);
      setCashForm({ student_id: "", amount: "", note: "", method: "cash" });
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdatePayment = async () => {
    if (!editModal) return;

    try {
      const { error } = await api.put(`/payments/${editModal.id}`, {
        amount: editModal.amount,
        payment_method: editModal.method,
        status: editModal.status === "paid" ? "completed" : editModal.status,
        description: editModal.description
      });

      if (error) throw new Error(error);

      toast.success("Payment updated");
      setEditModal(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const { error } = await api.delete(`/payments/${id}`);
      if (error) throw new Error(error);

      toast.success("Payment deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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
          { label: "Outstanding balances", value: `KES ${totalOutstanding.toLocaleString()}`, sub: `${balances.filter(b => b.balance > 0).length} students`, icon: AlertTriangle, color: "text-danger" },
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
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative",
              tab === t.key ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
            {t.badge && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "pending" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h2 text-navy">Outstanding Balances</h2>
                <p className="text-sm text-muted-foreground">Students with pending payments</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => toast.success("Bulk reminder sent to all students")}>
                  Send bulk reminder
                </Button>
                <Button variant="primary" size="sm" onClick={() => toast.success("Outstanding balances report exported")}>
                  <Download className="mr-1.5 h-4 w-4" /> Export
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-1">
                      <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Student</th>
                      <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Course</th>
                      <th className="px-4 py-3 text-right text-label-sm text-muted-foreground">Total Fees</th>
                      <th className="px-4 py-3 text-right text-label-sm text-muted-foreground">Paid</th>
                      <th className="px-4 py-3 text-right text-label-sm text-muted-foreground">Balance</th>
                      <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Last Payment</th>
                      <th className="px-4 py-3 text-center text-label-sm text-muted-foreground">Days Overdue</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {balances
                      .sort((a, b) => b.daysOverdue - a.daysOverdue)
                      .map((student) => (
                      <tr key={student.id} className="hover:bg-surface-1 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-navy">{student.student}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{student.course}</td>
                        <td className="px-4 py-3 text-right font-medium text-navy">
                          KES {student.totalFees.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-success font-medium">
                          KES {student.amountPaid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "font-bold",
                            student.balance > 5000 ? "text-danger" : 
                            student.balance > 2000 ? "text-warning-foreground" : "text-muted-foreground"
                          )}>
                            KES {student.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {student.lastPayment}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            variant={student.daysOverdue > 21 ? "danger" : student.daysOverdue > 14 ? "warning" : "default"} 
                            size="sm"
                          >
                            {student.daysOverdue} days
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => sendReminder(student.student, student.phone, student.balance)}
                              className="text-xs text-brand-blue hover:underline"
                            >
                              Send reminder
                            </button>
                            <button 
                              onClick={() => toast.success(`Payment plan created for ${student.student}`)}
                              className="text-xs text-success hover:underline"
                            >
                              Payment plan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-light">
                    <AlertTriangle className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Critical (&gt;21 days)</p>
                    <p className="text-h3 font-bold text-danger">
                      {balances.filter(p => p.daysOverdue > 21).length} students
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-light">
                    <Clock className="h-5 w-5 text-warning-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Moderate (14-21 days)</p>
                    <p className="text-h3 font-bold text-warning-foreground">
                      {balances.filter(p => p.daysOverdue > 14 && p.daysOverdue <= 21).length} students
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-light">
                    <User className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent (&lt;14 days)</p>
                    <p className="text-h3 font-bold text-info">
                      {balances.filter(p => p.daysOverdue <= 14).length} students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  {payments.map((p) => {
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditModal(p)}
                              className="rounded p-1 hover:bg-surface-2 text-muted-foreground hover:text-brand"
                              title="Edit payment"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              className="rounded p-1 hover:bg-danger-light text-muted-foreground hover:text-danger"
                              title="Delete payment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            {p.status === "paid" && (
                              <button onClick={() => toast.success("Receipt downloaded")} className="flex items-center gap-1 text-xs text-brand-blue hover:underline">
                                <Download className="h-3.5 w-3.5" /> Receipt
                              </button>
                            )}
                          </div>
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
              {payments.filter((p) => p.status === "paid").map((p) => (
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
            <h2 className="text-h2 text-navy">Record payment</h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Student *</Label>
                <select
                  className="w-full rounded-lg border border-border p-2 text-sm"
                  value={cashForm.student_id}
                  onChange={(e) => setCashForm({ ...cashForm, student_id: e.target.value })}
                >
                  <option value="">Select student...</option>
                  {balances.map(b => (
                    <option key={b.id} value={b.id}>{b.student}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (KES) *</Label>
                <Input type="number" value={cashForm.amount} onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Method *</Label>
                <select
                  className="w-full rounded-lg border border-border p-2 text-sm"
                  value={cashForm.method}
                  onChange={(e) => setCashForm({ ...cashForm, method: e.target.value as PayMethod })}
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Input value={cashForm.note} onChange={(e) => setCashForm({ ...cashForm, note: e.target.value })} placeholder="e.g. Lesson #4 payment" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCashModal(false)}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleRecordPayment}>Record</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit payment modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-h2 text-navy">Edit payment</h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Student</Label>
                <Input value={editModal.student} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (KES) *</Label>
                <Input type="number" value={editModal.amount} onChange={(e) => setEditModal({ ...editModal, amount: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Method *</Label>
                <select
                  className="w-full rounded-lg border border-border p-2 text-sm"
                  value={editModal.method}
                  onChange={(e) => setEditModal({ ...editModal, method: e.target.value as PayMethod })}
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <select
                  className="w-full rounded-lg border border-border p-2 text-sm"
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value as PayStatus })}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Note</Label>
                <Input value={editModal.description} onChange={(e) => setEditModal({ ...editModal, description: e.target.value })} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleUpdatePayment}>Save changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
