import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Calendar, CreditCard, BookOpen, Award, AlertCircle, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — DriveSchool Pro" }] }),
  component: NotificationsPage,
});

type NotifType = "lesson" | "payment" | "theory" | "certificate" | "system";

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const typeConfig: Record<NotifType, { icon: any; color: string }> = {
  lesson: { icon: Calendar, color: "bg-info-light text-info" },
  payment: { icon: CreditCard, color: "bg-success-light text-success" },
  theory: { icon: BookOpen, color: "bg-purple-light text-purple" },
  certificate: { icon: Award, color: "bg-warning-light text-warning-foreground" },
  system: { icon: AlertCircle, color: "bg-surface-2 text-muted-foreground" },
};

const INITIAL: Notification[] = [
  { id: 1, type: "lesson", title: "Lesson reminder", body: "You have a lesson tomorrow at 10:00 AM with James Mwangi. Vehicle: KAB 123X.", time: "2 hours ago", read: false },
  { id: 2, type: "payment", title: "Payment received", body: "KES 500 received for Lesson #3. Receipt sent to your email.", time: "3 days ago", read: false },
  { id: 3, type: "theory", title: "Theory test result", body: "You scored 85% on Highway Code. Well done — you've passed this category!", time: "5 days ago", read: false },
  { id: 4, type: "lesson", title: "Lesson completed", body: "Lesson #2 with Grace Wanjiru has been marked complete. View instructor notes.", time: "1 week ago", read: true },
  { id: 5, type: "system", title: "Welcome to DriveSchool Pro", body: "Your account has been set up. Complete your profile and upload required documents to get started.", time: "2 weeks ago", read: true },
];

function NotificationsPage() {
  const [notifs, setNotifs] = useState(INITIAL);
  const [prefs, setPrefs] = useState({ sms: true, email: true, inApp: true });

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

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
        {notifs.map((n) => {
          const cfg = typeConfig[n.type];
          const Icon = cfg.icon;
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                n.read ? "border-border bg-white" : "border-brand-blue/30 bg-brand-blue-light",
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-brand" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{n.time}</p>
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
