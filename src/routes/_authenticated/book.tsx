import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Bike, Truck, Check, Star, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({ meta: [{ title: "Book a Lesson — DriveSchool Pro" }] }),
  component: BookPage,
});

const VEHICLE_TYPES = [
  { id: "car", label: "Car", icon: Car, tone: "info" },
  { id: "motorcycle", label: "Motorcycle", icon: Bike, tone: "warning" },
  { id: "hgv", label: "HGV / Truck", icon: Truck, tone: "purple" },
] as const;

const INSTRUCTORS = [
  { id: "jm", name: "James Mwangi", rating: 4.9, reviews: 47, slots: 8, vehicle: "car", initials: "JM" },
  { id: "gw", name: "Grace Wanjiru", rating: 4.8, reviews: 62, slots: 5, vehicle: "car", initials: "GW" },
  { id: "po", name: "Peter Otieno", rating: 4.9, reviews: 31, slots: 3, vehicle: "hgv", initials: "PO" },
  { id: "sm", name: "Sarah Mutua", rating: 4.7, reviews: 28, slots: 6, vehicle: "motorcycle", initials: "SM" },
];

const TIME_SLOTS = {
  morning: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
  afternoon: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
  evening: ["5:00 PM", "6:00 PM"],
};

const TAKEN_SLOTS = new Set(["9:00 AM", "2:00 PM", "5:00 PM"]);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return { first, days };
}

const AVAILABLE_DATES = new Set([12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 26, 27, 28]);

function BookPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState("car");
  const [instructor, setInstructor] = useState("");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [calMonth, setCalMonth] = useState(4); // May (0-indexed)
  const [calYear] = useState(2026);
  const [confirming, setConfirming] = useState(false);

  const { first, days } = buildCalendar(calYear, calMonth);
  const filteredInstructors = INSTRUCTORS.filter((i) => i.vehicle === vehicle || vehicle === "car");
  const selectedInstructor = INSTRUCTORS.find((i) => i.id === instructor);

  const confirm = async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1200));
    setConfirming(false);
    toast.success("Lesson booked! You'll receive an SMS confirmation shortly.");
    navigate({ to: "/dashboard" });
  };

  const steps = ["Vehicle", "Instructor", "Date & Time", "Confirm"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-h1 text-navy">Book a Lesson</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose your vehicle type, instructor, and preferred time slot.</p>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={s} className="flex flex-1 items-center">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                done ? "bg-success text-white" : active ? "bg-brand text-white" : "bg-surface-2 text-muted-foreground",
              )}>
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span className={cn("ml-2 hidden text-xs sm:block", active ? "font-medium text-navy" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <div className={cn("ml-2 h-px flex-1", done ? "bg-success" : "bg-border")} />}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-xs">
        {/* Step 1: Vehicle */}
        {step === 1 && (
          <>
            <h2 className="text-h2 text-navy">Select vehicle type</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {VEHICLE_TYPES.map((v) => {
                const sel = vehicle === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVehicle(v.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                      sel ? "border-brand-blue bg-brand-blue-light" : "border-border hover:border-muted-foreground/30",
                    )}
                  >
                    {sel && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-${v.tone}-light text-${v.tone}`}>
                      <v.icon className="h-7 w-7" />
                    </div>
                    <span className="font-semibold text-navy">{v.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <Button variant="primary" size="lg" onClick={() => setStep(2)}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Instructor */}
        {step === 2 && (
          <>
            <h2 className="text-h2 text-navy">Choose an instructor</h2>
            <p className="mt-1 text-sm text-muted-foreground">All instructors are certified and background-checked.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {filteredInstructors.map((ins) => {
                const sel = instructor === ins.id;
                return (
                  <button
                    key={ins.id}
                    onClick={() => setInstructor(ins.id)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      sel ? "border-brand-blue bg-brand-blue-light" : "border-border hover:border-muted-foreground/30",
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-sm font-bold text-white">
                      {ins.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy">{ins.name}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="font-medium">{ins.rating}</span>
                        <span className="text-muted-foreground">({ins.reviews})</span>
                      </div>
                      <Badge variant="success" size="sm" className="mt-1">{ins.slots} slots available</Badge>
                    </div>
                    {sel && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button variant="primary" size="lg" onClick={() => setStep(3)} disabled={!instructor}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <>
            <h2 className="text-h2 text-navy">Pick a date & time</h2>
            {/* Calendar */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <button onClick={() => setCalMonth((m) => Math.max(0, m - 1))} className="rounded-lg p-1.5 hover:bg-surface-2">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-semibold text-navy">{MONTHS[calMonth]} {calYear}</span>
                <button onClick={() => setCalMonth((m) => Math.min(11, m + 1))} className="rounded-lg p-1.5 hover:bg-surface-2">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                {DAYS.map((d) => (
                  <div key={d} className="py-1 text-xs font-semibold text-muted-foreground">{d}</div>
                ))}
                {Array.from({ length: first }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const avail = AVAILABLE_DATES.has(day);
                  const sel = selectedDate === day;
                  return (
                    <button
                      key={day}
                      disabled={!avail}
                      onClick={() => { setSelectedDate(day); setSelectedTime(""); }}
                      className={cn(
                        "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                        sel ? "bg-brand text-white font-semibold" :
                        avail ? "hover:bg-surface-2 text-foreground" :
                        "text-muted-foreground/40 cursor-not-allowed",
                      )}
                    >
                      {day}
                      {avail && !sel && (
                        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-success" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mt-6 space-y-4">
                {(Object.entries(TIME_SLOTS) as [string, string[]][]).map(([period, slots]) => (
                  <div key={period}>
                    <p className="text-label-sm mb-2 text-muted-foreground capitalize">{period}</p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => {
                        const taken = TAKEN_SLOTS.has(slot);
                        const sel = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            disabled={taken}
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                              sel ? "border-brand bg-brand text-white" :
                              taken ? "border-border bg-surface-2 text-muted-foreground/50 cursor-not-allowed line-through" :
                              "border-border hover:border-brand-blue hover:bg-brand-blue-light",
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button variant="primary" size="lg" onClick={() => setStep(4)} disabled={!selectedDate || !selectedTime}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedInstructor && (
          <>
            <h2 className="text-h2 text-navy">Confirm your booking</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review the details below before confirming.</p>
            <div className="mt-6 rounded-xl border border-border bg-surface-1 p-5 space-y-4">
              <Row label="Vehicle type" value={VEHICLE_TYPES.find((v) => v.id === vehicle)?.label ?? ""} />
              <Row label="Instructor" value={selectedInstructor.name} />
              <Row label="Date" value={`${selectedDate} ${MONTHS[calMonth]} ${calYear}`} />
              <Row label="Time" value={selectedTime} />
              <Row label="Branch" value="Westlands" />
              <div className="border-t border-border pt-4">
                <Row label="Lesson fee" value="KES 500" bold />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-info-light p-3 text-sm text-info">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>You'll receive an SMS confirmation and a reminder 24 hours before your lesson.</span>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="secondary" size="lg" onClick={() => setStep(3)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button variant="primary" size="lg" onClick={confirm} disabled={confirming}>
                {confirming ? "Booking…" : "Confirm booking"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-navy", bold && "font-semibold text-base")}>{value}</span>
    </div>
  );
}
