import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Bike, Truck, Plus, Wrench, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/staff/fleet")({
  head: () => ({ meta: [{ title: "Fleet Management — DriveSchool Pro" }] }),
  component: FleetPage,
});

type VehicleStatus = "available" | "in-lesson" | "in-service";

interface Vehicle {
  id: string;
  plate: string;
  type: "car" | "motorcycle" | "hgv";
  year: number;
  status: VehicleStatus;
  assignedTo?: string;
  lastService: string;
  mileage: number;
  serviceDue: boolean;
}

const VEHICLES: Vehicle[] = [
  { id: "1", plate: "KAB 123X", type: "car", year: 2022, status: "in-lesson", assignedTo: "James Mwangi", lastService: "1 Apr 2026", mileage: 42500, serviceDue: false },
  { id: "2", plate: "KAB 456Y", type: "car", year: 2021, status: "available", lastService: "15 Mar 2026", mileage: 58200, serviceDue: true },
  { id: "3", plate: "KAC 789Z", type: "car", year: 2023, status: "available", lastService: "20 Apr 2026", mileage: 18900, serviceDue: false },
  { id: "4", plate: "KAD 012A", type: "car", year: 2020, status: "in-service", lastService: "10 May 2026", mileage: 74100, serviceDue: false },
  { id: "5", plate: "KAE 345B", type: "motorcycle", year: 2022, status: "available", lastService: "5 Apr 2026", mileage: 22300, serviceDue: false },
  { id: "6", plate: "KAF 678C", type: "hgv", year: 2019, status: "available", lastService: "28 Mar 2026", mileage: 112000, serviceDue: true },
];

const statusConfig: Record<VehicleStatus, { label: string; variant: "success" | "info" | "warning" }> = {
  available: { label: "Available", variant: "success" },
  "in-lesson": { label: "In Lesson", variant: "info" },
  "in-service": { label: "In Service", variant: "warning" },
};

const typeIcon: Record<string, any> = { car: Car, motorcycle: Bike, hgv: Truck };

function FleetPage() {
  const [vehicles] = useState(VEHICLES);

  const available = vehicles.filter((v) => v.status === "available").length;
  const inLesson = vehicles.filter((v) => v.status === "in-lesson").length;
  const inService = vehicles.filter((v) => v.status === "in-service").length;
  const serviceDue = vehicles.filter((v) => v.serviceDue).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-navy">Fleet Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{vehicles.length} vehicles registered at Westlands</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add vehicle
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Available", value: available, color: "text-success" },
          { label: "In lesson", value: inLesson, color: "text-info" },
          { label: "In service", value: inService, color: "text-warning-foreground" },
          { label: "Service due", value: serviceDue, color: "text-danger" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-white p-4 text-center">
            <p className={`text-h1 ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {serviceDue > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning bg-warning-light p-4 text-sm text-warning-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{serviceDue} vehicle{serviceDue > 1 ? "s" : ""}</strong> due for service. Schedule maintenance soon.</span>
        </div>
      )}

      {/* Vehicle grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicles.map((v) => {
          const Icon = typeIcon[v.type];
          const cfg = statusConfig[v.status];
          return (
            <div key={v.id} className={cn(
              "rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md",
              v.serviceDue ? "border-warning" : "border-border",
            )}>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
              </div>
              <p className="mt-4 font-mono text-xl font-bold text-navy">{v.plate}</p>
              <p className="text-sm text-muted-foreground capitalize">{v.type} · {v.year}</p>

              {v.assignedTo && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Assigned to <span className="font-medium text-foreground">{v.assignedTo}</span>
                </p>
              )}

              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Last service</span>
                  <span>{v.lastService}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mileage</span>
                  <span>{v.mileage.toLocaleString()} km</span>
                </div>
              </div>

              {v.serviceDue && (
                <div className="mt-3 flex items-center gap-1 text-xs text-warning-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> Service overdue
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => toast.info("Service log coming soon")}>
                  <Wrench className="mr-1 h-3.5 w-3.5" /> Log service
                </Button>
              </div>
            </div>
          );
        })}

        {/* Add vehicle card */}
        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white p-5 text-muted-foreground transition-colors hover:border-brand-blue hover:text-brand-blue">
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Add vehicle</span>
        </button>
      </div>
    </div>
  );
}
