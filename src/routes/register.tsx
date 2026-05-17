import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Car, Bike, Truck, Check, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — DriveSchool Pro" }, { name: "description", content: "Create your DriveSchool Pro account in under 2 minutes." }] }),
  component: RegisterPage,
});

// Fallback display data (used for UI icons/descriptions only)
const COURSE_META: Record<string, { icon: any; tone: string; desc: string; lessons: number; duration: string }> = {
  car:        { icon: Car,   tone: "info",    desc: "Master cars from manual to automatic. Includes theory, mock tests, and 20 lessons.", lessons: 20, duration: "6 weeks" },
  motorcycle: { icon: Bike,  tone: "warning", desc: "Build confidence on two wheels. Safety first, with experienced rider instructors.", lessons: 12, duration: "4 weeks" },
  hgv:        { icon: Truck, tone: "purple",  desc: "Open commercial driving careers. Heavy vehicle handling with certified examiners.", lessons: 30, duration: "10 weeks" },
};

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Real courses and branches from the API
  const [courses, setCourses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "",
    course: "", branch: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      const [coursesRes, branchesRes] = await Promise.all([
        api.get<{ courses: any[] }>("/auth/courses"),
        api.get<{ branches: any[] }>("/auth/branches"),
      ]);
      if (coursesRes.data?.courses?.length) {
        setCourses(coursesRes.data.courses);
        setForm(f => ({ ...f, course: coursesRes.data!.courses[0].id }));
      }
      if (branchesRes.data?.branches?.length) {
        setBranches(branchesRes.data.branches);
        setForm(f => ({ ...f, branch: branchesRes.data!.branches[0].id }));
      }
      setDataLoading(false);
    };
    loadData();
  }, []);

  const submit = async () => {
    if (!form.course || !form.branch) {
      toast.error("Please select a course and branch");
      return;
    }
    setLoading(true);
    
    const { data, error } = await api.post<{ userId: string; message: string }>("/auth/register", {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      course: form.course,
      branch: form.branch
    });
    
    setLoading(false);
    if (error || !data) { 
      toast.error(error || "Registration failed"); 
      return; 
    }
    
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-1 px-4">
        <div className="max-w-md rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-h1 text-navy">Welcome to DriveSchool Pro!</h1>
          <p className="mt-2 text-muted-foreground">Your account is ready. Sign in to get started.</p>
          <Button asChild variant="primary" size="lg" className="mt-6 w-full">
            <Link to="/login">Go to sign in <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="text-sm text-muted-foreground">Already registered? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link></span>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-3">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex flex-1 items-center">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                step > n ? "bg-success text-white" :
                step === n ? "bg-brand text-white" :
                "bg-surface-2 text-muted-foreground")}>
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {i < 2 && <div className={cn("ml-3 h-0.5 flex-1 transition-colors", step > n ? "bg-success" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {step === 1 && (
            <>
              <h1 className="text-h2 text-navy">Personal information</h1>
              <p className="mt-1 text-sm text-muted-foreground">We'll use this to set up your student account.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="First name"><Input required value={form.firstName} onChange={set("firstName")} /></Field>
                <Field label="Last name"><Input required value={form.lastName} onChange={set("lastName")} /></Field>
                <Field label="Email"><Input type="email" required value={form.email} onChange={set("email")} /></Field>
                <Field label="Phone"><Input type="tel" required value={form.phone} onChange={set("phone")} placeholder="07XX XXX XXX" /></Field>
                <Field label="Password" className="md:col-span-2">
                  <Input type="password" required minLength={6} value={form.password} onChange={set("password")} />
                </Field>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="primary" size="lg" onClick={() => setStep(2)} disabled={!form.firstName || !form.email || !form.password}>
                  Continue <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-h2 text-navy">Choose your course</h1>
              <p className="mt-1 text-sm text-muted-foreground">You can change this later.</p>
              {dataLoading ? (
                <div className="mt-8 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand" /></div>
              ) : (
                <div className="mt-6 space-y-3">
                  {courses.map((c) => {
                    const selected = form.course === c.id;
                    // Derive display icon from vehicle_type
                    const vehicleKey = c.vehicle_type === 'motorcycle' ? 'motorcycle' : c.vehicle_type === 'truck' ? 'hgv' : 'car';
                    const meta = COURSE_META[vehicleKey] ?? COURSE_META.car;
                    const Icon = meta.icon;
                    return (
                      <button key={c.id} type="button" onClick={() => setForm({ ...form, course: c.id })}
                        className={cn("flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                          selected ? "border-brand-blue bg-brand-blue-light" : "border-border bg-white hover:border-muted-foreground/30")}>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${meta.tone}-light text-${meta.tone}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-navy">{c.name}</p>
                          <p className="text-sm text-muted-foreground">From KES {Number(c.price).toLocaleString()}</p>
                        </div>
                        {selected && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></div>}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)}><ArrowLeft /> Back</Button>
                <Button variant="primary" size="lg" onClick={() => setStep(3)} disabled={!form.course}>Continue <ArrowRight /></Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-h2 text-navy">Select branch</h1>
              <p className="mt-1 text-sm text-muted-foreground">Pick the branch closest to you.</p>
              {dataLoading ? (
                <div className="mt-8 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand" /></div>
              ) : (
                <div className="mt-6 space-y-3">
                  {branches.map((b) => {
                    const selected = form.branch === b.id;
                    return (
                      <button key={b.id} type="button" onClick={() => setForm({ ...form, branch: b.id })}
                        className={cn("flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                          selected ? "border-brand-blue bg-brand-blue-light" : "border-border bg-white hover:border-muted-foreground/30")}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-navy">{b.name}</p>
                          <p className="text-sm text-muted-foreground">{b.address || ""}</p>
                        </div>
                        {selected && <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></div>}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <Button variant="secondary" size="lg" onClick={() => setStep(2)}><ArrowLeft /> Back</Button>
                <Button variant="primary" size="lg" onClick={submit} disabled={loading || !form.branch}>
                  {loading ? "Creating account…" : "Complete registration"}
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">By registering you agree to our Terms of Service.</p>
            </>
          )}
        </div>
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

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — DriveSchool Pro" }, { name: "description", content: "Create your DriveSchool Pro account in under 2 minutes." }] }),
  component: RegisterPage,
});

const COURSES = [
  { id: "car", name: "Car (Class B)", price: 8500, icon: Car, tone: "info" },
  { id: "motorcycle", name: "Motorcycle (Class A)", price: 6000, icon: Bike, tone: "warning" },
  { id: "hgv", name: "HGV / Truck (Class C)", price: 14000, icon: Truck, tone: "purple" },
];
const BRANCHES = [
  { id: "westlands", name: "Westlands", address: "Mpaka Rd, Westlands, Nairobi", slots: 23 },
  { id: "karen", name: "Karen", address: "Karen Hardy, Langata Rd", slots: 12 },
  { id: "msa-rd", name: "Mombasa Road", address: "South C, Capital Centre", slots: 18 },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "",
    course: "car", branch: "westlands",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setLoading(true);
    
    const { data, error } = await api.post<{ userId: string; message: string }>("/auth/register", {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      course: form.course,
      branch: form.branch
    });
    
    setLoading(false);
    if (error || !data) { 
      toast.error(error || "Registration failed"); 
      return; 
    }
    
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-1 px-4">
        <div className="max-w-md rounded-2xl border border-border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light text-success">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-h1 text-navy">Welcome to DriveSchool Pro!</h1>
          <p className="mt-2 text-muted-foreground">Check your email to verify your account, then sign in.</p>
          <Button asChild variant="primary" size="lg" className="mt-6 w-full">
            <Link to="/login">Go to sign in <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="text-sm text-muted-foreground">Already registered? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link></span>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-3">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex flex-1 items-center">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                step > n ? "bg-success text-white" :
                step === n ? "bg-brand text-white" :
                "bg-surface-2 text-muted-foreground")}>
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {i < 2 && <div className={cn("ml-3 h-0.5 flex-1 transition-colors", step > n ? "bg-success" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {step === 1 && (
            <>
              <h1 className="text-h2 text-navy">Personal information</h1>
              <p className="mt-1 text-sm text-muted-foreground">We'll use this to set up your student account.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="First name"><Input required value={form.firstName} onChange={set("firstName")} /></Field>
                <Field label="Last name"><Input required value={form.lastName} onChange={set("lastName")} /></Field>
                <Field label="Email"><Input type="email" required value={form.email} onChange={set("email")} /></Field>
                <Field label="Phone"><Input type="tel" required value={form.phone} onChange={set("phone")} placeholder="07XX XXX XXX" /></Field>
                <Field label="Password" className="md:col-span-2">
                  <Input type="password" required minLength={6} value={form.password} onChange={set("password")} />
                </Field>
              </div>
              <div className="mt-8 flex justify-end">
                <Button variant="primary" size="lg" onClick={() => setStep(2)} disabled={!form.firstName || !form.email || !form.password}>
                  Continue <ArrowRight />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-h2 text-navy">Choose your course</h1>
              <p className="mt-1 text-sm text-muted-foreground">You can change this later.</p>
              <div className="mt-6 space-y-3">
                {COURSES.map((c) => {
                  const selected = form.course === c.id;
                  return (
                    <button key={c.id} type="button" onClick={() => setForm({ ...form, course: c.id })}
                      className={cn("flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                        selected ? "border-brand-blue bg-brand-blue-light" : "border-border bg-white hover:border-muted-foreground/30")}>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${c.tone}-light text-${c.tone}`}>
                        <c.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-navy">{c.name}</p>
                        <p className="text-sm text-muted-foreground">From KES {c.price.toLocaleString()}</p>
                      </div>
                      {selected && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></div>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="secondary" size="lg" onClick={() => setStep(1)}><ArrowLeft /> Back</Button>
                <Button variant="primary" size="lg" onClick={() => setStep(3)}>Continue <ArrowRight /></Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-h2 text-navy">Select branch</h1>
              <p className="mt-1 text-sm text-muted-foreground">Pick the branch closest to you.</p>
              <div className="mt-6 space-y-3">
                {BRANCHES.map((b) => {
                  const selected = form.branch === b.id;
                  return (
                    <button key={b.id} type="button" onClick={() => setForm({ ...form, branch: b.id })}
                      className={cn("flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                        selected ? "border-brand-blue bg-brand-blue-light" : "border-border bg-white hover:border-muted-foreground/30")}>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-navy">{b.name}</p>
                        <p className="text-sm text-muted-foreground">{b.address}</p>
                        <Badge variant="success" size="sm" className="mt-2">{b.slots} slots available</Badge>
                      </div>
                      {selected && <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></div>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="secondary" size="lg" onClick={() => setStep(2)}><ArrowLeft /> Back</Button>
                <Button variant="primary" size="lg" onClick={submit} disabled={loading}>
                  {loading ? "Creating account…" : "Complete registration"}
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">By registering you agree to our Terms of Service.</p>
            </>
          )}
        </div>
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
