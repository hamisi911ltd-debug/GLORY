import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Calendar, CreditCard, BookOpen, Award, AlertCircle, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DriveSchool Pro" }] }),
  component: NotificationsPage,
});

type NotifType = "lesson" | "payment" | "theory" | "certificate" | "system" | "info" | "success" | "warning" | "error" | "lesson_reminder" | "payment_due" | "test_result";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  created_at: string;
  read_status: boolean;
  action_url?: string;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  lesson:          { icon: Calendar,     color: "bg-info-light text-info" },
  lesson_reminder: { icon: Calendar,     color: "bg-info-light text-info" },
  payment:         { icon: CreditCard,   color: "bg-success-light text-success" },
  payment_due:     { icon: CreditCard,   color: "bg-warning-light text-warning-foreground" },
  theory:          { icon: BookOpen,     color: "bg-purple-light text-purple" },
  test_result:     { icon: BookOpen,     color: "bg-purple-light text-purple" },
  certificate:     { icon: Award,        color: "bg-warning-light text-warning-foreground" },
  success:         { icon: Award,        color: "bg-success-light text-success" },
  warning:         { icon: AlertCircle,  color: "bg-warning-light text-warning-foreground" },
  error:           { icon: AlertCircle,  color: "bg-danger-light text-danger" },
  system:          { icon: AlertCircle,  color: "bg-surface-2 text-muted-foreground" },
  info:            { icon: Bell,         color: "bg-surface-2 text-muted-foreground" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({ sms: true, email: true, inApp: true });

  const loadNotifications = async () => {
    setLoading(true);
    const { data, error } = await api.get<{ notifications: Notification[] }>("/notifications");
    if (data?.notifications) {
      setNotifs(data.notifications);
    } else if (error) {
      console.error("Failed to load notifications:", error);
    }
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, []);

  const unread = notifs.filter((n) => !n.read_status).length;

  const markAllRead = async () => {
    await api.post("/notifications/read-all");
    setNotifs((prev) => prev.map((n) => ({ ...n, read_status: true })));
  };

  const markRead = async (id: string) => {
    if (notifs.find(n => n.id === id)?.read_status) return;
    await api.patch(`/notifications/${id}/read`);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read_status: true } : n));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-navy">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {/* Notification feed */}
      <div className="mt-8 space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bell className="mx-auto h-10 w-10 opacity-30 mb-3" />
            <p>No notifications yet.</p>
          </div>
        ) : notifs.map((n) => {
          const cfg = typeConfig[n.type] ?? typeConfig.info;
          const Icon = cfg.icon;
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                n.read_status ? "border-border bg-white" : "border-brand-blue/30 bg-brand-blue-light",
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy">{n.title}</p>
                  {!n.read_status && <span className="h-2 w-2 rounded-full bg-brand" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{timeAgo(n.created_at)}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Preferences */}
      <div className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-xs">
        <h2 className="text-h2 text-navy">Notification preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose how you want to receive updates.</p>
        <div className="mt-5 space-y-4">
          {([
            { key: "sms" as const, label: "SMS notifications", desc: "Lesson reminders, payment confirmations" },
            { key: "email" as const, label: "Email notifications", desc: "Receipts, certificates, weekly summaries" },
            { key: "inApp" as const, label: "In-app notifications", desc: "Real-time updates while using the portal" },
          ]).map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-navy">{pref.label}</p>
                <p className="text-sm text-muted-foreground">{pref.desc}</p>
              </div>
              <button
                onClick={() => setPrefs((p) => ({ ...p, [pref.key]: !p[pref.key] }))}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  prefs[pref.key] ? "bg-success" : "bg-surface-2",
                )}
                aria-pressed={prefs[pref.key]}
                aria-label={`Toggle ${pref.label}`}
              >
                <span className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  prefs[pref.key] ? "translate-x-5" : "translate-x-0.5",
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
