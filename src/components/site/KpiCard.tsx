import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "info" | "success" | "warning" | "danger" | "purple" | "brand";
  action?: React.ReactNode;
}

const tones = {
  info: "bg-info-light text-info",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  purple: "bg-purple-light text-purple",
  brand: "bg-brand-light text-brand",
};

export function KpiCard({ icon: Icon, label, value, hint, tone = "info", action }: KpiCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {action}
      </div>
      <p className="text-label-sm mt-4 text-muted-foreground">{label}</p>
      <p className="mt-1 text-h1 text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
