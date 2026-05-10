import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Lock, Bell, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile & Settings — DriveSchool Pro" }] }),
  component: ProfilePage,
});

type Tab = "personal" | "password" | "preferences";

function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("personal");
  const [saving, setSaving] = useState(false);

  const [personal, setPersonal] = useState({
    firstName: "Amara",
    lastName: "Njeri",
    email: user?.email ?? "",
    phone: "0712 345 678",
    dob: "1998-04-15",
    nationalId: "12345678",
    branch: "westlands",
  });

  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });

  // Preferences state — must live at component level, never inside .map()
  const [prefs, setPrefs] = useState({
    sms: true,
    email: true,
    inApp: true,
    marketing: false,
  });

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    const { error } = await api.patch("/profile", {
      full_name: `${personal.firstName} ${personal.lastName}`,
      phone: personal.phone,
      branch_id: personal.branch,
    });
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success("Profile updated successfully");
  };

  const changePassword = async () => {
    if (passwords.newPw !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    const { error } = await api.post("/profile/change-password", {
      newPassword: passwords.newPw,
    });
    setSaving(false);
    if (error) { toast.error(error); return; }
    setPasswords({ current: "", newPw: "", confirm: "" });
    toast.success("Password changed successfully");
  };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "personal", label: "Personal info", icon: User },
    { key: "password", label: "Password", icon: Lock },
    { key: "preferences", label: "Preferences", icon: Bell },
  ];

  const BRANCHES = [
    { id: "westlands", name: "Westlands" },
    { id: "karen", name: "Karen" },
    { id: "msa-rd", name: "Mombasa Road" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-h1 text-navy">Profile & Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your personal information and account preferences.</p>

      {/* Avatar */}
      <div className="mt-8 flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-2xl font-bold text-white">
            {personal.firstName[0]}{personal.lastName[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-border shadow-sm hover:bg-surface-2 transition-colors">
            <Camera className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-navy text-lg">{personal.firstName} {personal.lastName}</p>
          <p className="text-sm text-muted-foreground">{personal.email}</p>
          <Badge variant="info" size="sm" className="mt-1">Student · {BRANCHES.find(b => b.id === personal.branch)?.name}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-surface-2 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-xs">
        {tab === "personal" && (
          <>
            <h2 className="text-h2 text-navy">Personal information</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input value={personal.firstName} onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })} />
              </Field>
              <Field label="Last name">
                <Input value={personal.lastName} onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })} />
              </Field>
              <Field label="Email address">
                <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
              </Field>
              <Field label="Phone number">
                <Input type="tel" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
              </Field>
              <Field label="Date of birth">
                <Input type="date" value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} />
              </Field>
              <Field label="National ID">
                <Input value={personal.nationalId} onChange={(e) => setPersonal({ ...personal, nationalId: e.target.value })} />
              </Field>
              <Field label="Branch" className="sm:col-span-2">
                <select
                  value={personal.branch}
                  onChange={(e) => setPersonal({ ...personal, branch: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="lg" onClick={save} disabled={saving}>
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </>
        )}

        {tab === "password" && (
          <>
            <h2 className="text-h2 text-navy">Change password</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use a strong password with at least 8 characters.</p>
            <div className="mt-6 space-y-4 max-w-sm">
              <Field label="Current password">
                <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
              </Field>
              <Field label="New password">
                <Input type="password" value={passwords.newPw} onChange={(e) => setPasswords({ ...passwords, newPw: e.target.value })} />
              </Field>
              <Field label="Confirm new password">
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="lg" onClick={changePassword} disabled={saving || !passwords.current || !passwords.newPw}>
                {saving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </>
        )}

        {tab === "preferences" && (
          <>
            <h2 className="text-h2 text-navy">Notification preferences</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose how you want to receive updates from DriveSchool Pro.</p>
            <div className="mt-6 space-y-5">
              {(
                [
                  { key: "sms" as const,       label: "SMS reminders",        desc: "Lesson reminders 24h and 1h before" },
                  { key: "email" as const,      label: "Email receipts",       desc: "Payment confirmations and invoices" },
                  { key: "inApp" as const,      label: "In-app notifications", desc: "Real-time updates while using the portal" },
                  { key: "marketing" as const,  label: "Marketing emails",     desc: "Tips, promotions, and school news" },
                ] as const
              ).map((pref) => (
                <div key={pref.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">{pref.label}</p>
                    <p className="text-sm text-muted-foreground">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() => togglePref(pref.key)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      prefs[pref.key] ? "bg-success" : "bg-surface-2",
                    )}
                    aria-pressed={prefs[pref.key]}
                    aria-label={`Toggle ${pref.label}`}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        prefs[pref.key] ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="lg" onClick={async () => {
                setSaving(true);
                const { error } = await api.put("/profile/preferences", prefs);
                setSaving(false);
                if (error) { toast.error(error); return; }
                toast.success("Preferences saved");
              }} disabled={saving}>
                <Save className="mr-1.5 h-4 w-4" /> Save preferences
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
