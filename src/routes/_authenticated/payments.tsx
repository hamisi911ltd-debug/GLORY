import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CreditCard, Smartphone, Download, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payments & Invoices — DriveSchool Pro" }] }),
  component: PaymentsPage,
});

type PayMethod = "mpesa" | "card" | "cash";
type PayStatus = "paid" | "pending" | "failed";

interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: PayMethod;
  status: PayStatus;
  ref: string;
}

const payments: Payment[] = [
  { id: "1", date: "5 May 2026", description: "Course enrolment — Car (Standard)", amount: 11500, method: "mpesa", status: "paid", ref: "QHJ7K2L9" },
  { id: "2", date: "7 May 2026", description: "Lesson #1 — James Mwangi", amount: 500, method: "mpesa", status: "paid", ref: "QHJ8M3N1" },
  { id: "3", date: "9 May 2026", description: "Lesson #2 — James Mwangi", amount: 500, method: "card", status: "paid", ref: "PI_3NxK" },
  { id: "4", date: "12 May 2026", description: "Lesson #3 — Grace Wanjiru", amount: 500, method: "cash", status: "paid", ref: "CASH-042" },
  { id: "5", date: "14 May 2026", description: "Lesson #4 — James Mwangi", amount: 500, method: "mpesa", status: "pending", ref: "—" },
  { id: "6", date: "16 May 2026", description: "Lesson #5 — Grace Wanjiru", amount: 500, method: "card", status: "failed", ref: "—" },
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

type PayModal = "mpesa" | "card" | null;

function MpesaModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("07");
  const [state, setState] = useState<"input" | "waiting" | "success">("input");

  const initiate = () => {
    setState("waiting");
    setTimeout(() => setState("success"), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {state === "input" && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-light text-success">
              <Smartphone className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-h2 text-navy">Pay via M-Pesa</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter your Safaricom number to receive an STK push.</p>
            <div className="mt-5 space-y-1.5">
              <Label>Phone number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" />
            </div>
            <div className="mt-4 rounded-lg bg-surface-1 p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">KES 3,500</span></div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={initiate}>Send prompt</Button>
            </div>
          </>
        )}
        {state === "waiting" && (
          <div className="py-6 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-success" />
            <h2 className="mt-5 text-h2 text-navy">Check your phone</h2>
            <p className="mt-2 text-sm text-muted-foreground">An M-Pesa prompt has been sent to <strong>{phone}</strong>. Enter your PIN to complete payment.</p>
          </div>
        )}
        {state === "success" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-h2 text-navy">Payment received!</h2>
            <p className="mt-2 text-sm text-muted-foreground">KES 3,500 confirmed. A receipt has been sent to your phone and email.</p>
            <Button variant="primary" size="lg" className="mt-6 w-full" onClick={onClose}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentsPage() {
  const { user } = useAuth();
  const [modal, setModal] = useState<PayModal>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balance, setBalance] = useState(3500);
  const [loading, setLoading] = useState(true);

  // Load payments and balance with real-time updates
  useEffect(() => {
    if (!user) return;

    const loadPayments = async () => {
      try {
        // Get student record first
        const { data: student } = await supabase
          .from("students")
          .select("id, total_paid, balance")
          .eq("user_id", user.id)
          .single();

        if (student) {
          setBalance(student.balance);

          // Get payments
          const { data: paymentData } = await supabase
            .from("payments")
            .select("*")
            .eq("student_id", student.id)
            .order("created_at", { ascending: false });

          if (paymentData) {
            const formattedPayments = paymentData.map(p => ({
              id: p.id,
              date: new Date(p.created_at).toLocaleDateString("en-GB"),
              description: p.description,
              amount: p.amount,
              method: p.payment_method as PayMethod,
              status: p.status as PayStatus,
              ref: p.payment_reference || "—",
            }));
            setPayments(formattedPayments);
          }
        }
      } catch (error) {
        console.error("Failed to load payments:", error);
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`payments_${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, (payload) => {
        // Reload payments when changes occur
        loadPayments();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, (payload) => {
        // Update balance when student record changes
        if (payload.new && payload.new.user_id === user.id) {
          setBalance(payload.new.balance);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-h1 text-navy">Payments & Invoices</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track your payments and download receipts.</p>

      {/* Balance card */}
      <div className="mt-8 rounded-2xl bg-brand p-6 text-white">
        <p className="text-sm opacity-90">Amount due</p>
        <p className="mt-2 text-4xl font-bold">KES {balance.toLocaleString()}</p>
        <p className="mt-1 text-sm opacity-75">{payments.filter(p => p.status === "paid").length} payments received</p>
        <Button variant="hero" size="lg" className="mt-5 bg-white text-brand hover:bg-white/90" onClick={() => setModal("mpesa")}>
          <Smartphone className="mr-1.5 h-4 w-4" /> Pay now
        </Button>
      </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-label-sm text-white/70">Outstanding balance</p>
            <p className="mt-1 text-display-lg font-bold">KES {outstanding.toLocaleString()}</p>
            <p className="mt-1 text-sm text-white/70">Total paid: KES {totalPaid.toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-navy hover:bg-white/90"
              onClick={() => setModal("mpesa")}
            >
              <Smartphone className="mr-1.5 h-4 w-4" /> Pay via M-Pesa
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
              onClick={() => toast.info("Card payment coming soon")}
            >
              <CreditCard className="mr-1.5 h-4 w-4" /> Pay via Card
            </Button>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="mt-8">
        <h2 className="text-h2 text-navy">Payment history</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-1">
                  <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Description</th>
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
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.date}</td>
                      <td className="px-4 py-3 text-foreground">{p.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy whitespace-nowrap">
                        KES {p.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", method.color)}>
                          {method.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} size="sm" className="gap-1">
                          <StatusIcon className="h-3 w-3" /> {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.ref}</td>
                      <td className="px-4 py-3">
                        {p.status === "paid" && (
                          <button
                            onClick={() => toast.success("Receipt downloaded")}
                            className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" /> Receipt
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
      </div>

      {modal === "mpesa" && <MpesaModal onClose={() => setModal(null)} />}
    </div>
  );
}
