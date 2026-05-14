import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, BookOpen, AlertCircle, ArrowRight, Clock, MapPin, TrendingUp, Users, DollarSign, Car, Bike, Truck, BarChart, PieChart } from "lucide-react";
import { KpiCard } from "@/components/site/KpiCard";
import { ProgressRing } from "@/components/site/ProgressRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DriveSchool Pro" }] }),
  component: DashboardPage,
});

const lessons = [
  { id: 1, day: "Wed", date: "14 May", time: "10:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", status: "confirmed", color: "var(--color-info)" },
  { id: 2, day: "Fri", date: "16 May", time: "2:00 PM", instructor: "Grace Wanjiru", initials: "GW", vehicle: "Car", plate: "KAB 456Y", status: "confirmed", color: "var(--color-success)" },
  { id: 3, day: "Mon", date: "19 May", time: "9:00 AM", instructor: "James Mwangi", initials: "JM", vehicle: "Car", plate: "KAB 123X", status: "pending", color: "var(--color-info)" },
];

const milestones = [
  { label: "Enrolled", state: "done" },
  { label: "Theory Module 1", state: "done" },
  { label: "Lessons — 8 of 20", state: "current" },
  { label: "Theory Mock Test", state: "todo" },
  { label: "Exam Assessment", state: "todo" },
  { label: "Certificate", state: "todo" },
];

// Enhanced chart data
const lessonProgressData = [
  { week: "Week 1", completed: 2, pending: 0, target: 3 },
  { week: "Week 2", completed: 4, pending: 1, target: 5 },
  { week: "Week 3", completed: 6, pending: 2, target: 8 },
  { week: "Week 4", completed: 8, pending: 2, target: 10 },
  { week: "Week 5", completed: 10, pending: 1, target: 12 },
  { week: "Week 6", completed: 12, pending: 0, target: 15 },
];

const paymentData = [
  { name: "Paid", value: 8000, fill: "#10b981" },
  { name: "Pending", value: 3500, fill: "#f59e0b" },
];

const performanceData = [
  { subject: "Highway Code", score: 85, maxScore: 100 },
  { subject: "Road Signs", score: 92, maxScore: 100 },
  { subject: "Parking", score: 78, maxScore: 100 },
  { subject: "Maneuvers", score: 88, maxScore: 100 },
  { subject: "Safety", score: 95, maxScore: 100 },
];

const weeklyActivityData = [
  { day: "Mon", lessons: 2, theory: 1, practice: 1 },
  { day: "Tue", lessons: 1, theory: 2, practice: 0 },
  { day: "Wed", lessons: 2, theory: 1, practice: 1 },
  { day: "Thu", lessons: 1, theory: 0, practice: 2 },
  { day: "Fri", lessons: 2, theory: 1, practice: 1 },
  { day: "Sat", lessons: 3, theory: 0, practice: 2 },
  { day: "Sun", lessons: 0, theory: 1, practice: 0 },
];

// Course data matching landing page
const courses = [
  { slug: "car", icon: Car, name: "Car Driving", className: "Class B", desc: "Master cars from manual to automatic. Includes theory, mock tests, and 20 lessons.", lessons: 20, duration: "6 weeks", price: 8500, tone: "info", featured: true },
  { slug: "motorcycle", icon: Bike, name: "Motorcycle", className: "Class A", desc: "Build confidence on two wheels. Safety first, with experienced rider instructors.", lessons: 12, duration: "4 weeks", price: 6000, tone: "warning", featured: false },
  { slug: "hgv", icon: Truck, name: "HGV / Truck", className: "Class C", desc: "Open commercial driving careers. Heavy vehicle handling with certified examiners.", lessons: 30, duration: "10 weeks", price: 14000, tone: "purple", featured: false },
];

function DashboardPage() {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        // Get profile name
        const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        setName(data?.full_name?.split(" ")[0] ?? "there");

        // Fetch student data with real-time updates
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setStudentData(profileData);
        setLoading(false);

        // Subscribe to real-time updates
        const channel = supabase
          .channel(`profile_${user.id}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, (payload) => {
            setStudentData(payload.new);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-h1 text-navy md:text-display-lg">Good morning, {name || "there"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Calendar} tone="info" label="Next Lesson" value="Wed 14 May" hint="10:00am · James Mwangi" />
        <KpiCard icon={CheckCircle2} tone="success" label="Lessons Completed" value="8 / 20" hint="40% complete" />
        <KpiCard icon={BookOpen} tone="warning" label="Theory Score" value="74%" hint="2 categories left" />
        <KpiCard icon={AlertCircle} tone="danger" label="Balance Due" value={`KES ${(studentData?.balance || 0).toLocaleString()}`}
          action={<Button size="sm" variant="primary">Pay now</Button>} />
      </div>

      {/* Enhanced Charts Section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Lesson Progress Chart */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 text-navy">Lesson Progress</h2>
            <Badge variant="info" size="sm">8/20 completed</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={lessonProgressData}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-white p-3 shadow-lg">
                        <p className="text-xs font-bold text-navy mb-2">{label}</p>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-[11px] text-muted-foreground">{entry.name}:</span>
                            </div>
                            <span className="text-xs font-bold text-navy">{entry.value} lessons</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#targetGradient)" 
                name="Target" 
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#completedGradient)" 
                name="Completed" 
                animationDuration={1500}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Chart */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 text-navy">Payment Status</h2>
            <Badge variant="success" size="sm">KES 8,000 paid</Badge>
          </div>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <RechartsPieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-white p-2 shadow-md">
                          <p className="text-xs font-bold text-navy">KES {payload[0].value.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{payload[0].name}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {paymentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-navy ml-auto">KES {item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy">Total Course Fee</span>
                  <span className="text-sm font-bold text-navy">KES 11,500</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Completion</span>
                  <span className="text-xs font-medium text-success">70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Analytics Section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Performance Analysis */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 text-navy">Performance Analysis</h2>
            <Badge variant="info" size="sm">Theory Tests</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={performanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
              <YAxis dataKey="subject" type="category" width={80} stroke="#6b7280" />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-white p-2 shadow-md">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
                        <p className="text-sm font-bold text-navy">{payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="score" 
                fill="#10b981" 
                radius={[0, 4, 4, 0]} 
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 text-navy">Weekly Activity</h2>
            <Badge variant="purple" size="sm">This Week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-white p-3 shadow-lg min-w-[120px]">
                        <p className="text-xs font-bold text-navy mb-2">{label}</p>
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-[11px] text-muted-foreground">{entry.name}:</span>
                            </div>
                            <span className="text-xs font-bold text-navy">{entry.value}</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-1 border-t border-border flex justify-between">
                          <span className="text-[11px] font-medium text-navy">Total:</span>
                          <span className="text-xs font-bold text-navy">
                            {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Bar dataKey="lessons" stackId="a" fill="#3b82f6" name="Lessons" radius={[0, 0, 0, 0]} animationDuration={1000} />
              <Bar dataKey="theory" stackId="a" fill="#10b981" name="Theory" radius={[0, 0, 0, 0]} animationDuration={1200} />
              <Bar dataKey="practice" stackId="a" fill="#f59e0b" name="Practice" radius={[4, 4, 0, 0]} animationDuration={1400} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Progress */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs lg:col-span-2">
          <h2 className="text-h3 text-navy">My progress</h2>
          <div className="mt-6 flex justify-center">
            <ProgressRing value={40} label="Complete" />
          </div>
          <ul className="mt-8 space-y-3">
            {milestones.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-sm">
                <span className={
                  m.state === "done" ? "flex h-5 w-5 items-center justify-center rounded-full bg-success text-white" :
                  m.state === "current" ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-white" :
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-white"
                }>
                  {m.state === "done" && <CheckCircle2 className="h-3 w-3" strokeWidth={3} />}
                  {m.state === "current" && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className={m.state === "todo" ? "text-muted-foreground" : "text-foreground"}>{m.label}</span>
                {m.state === "current" && <Badge variant="info" size="sm" className="ml-auto">In progress</Badge>}
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming lessons + quick actions */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-navy">Upcoming lessons</h2>
              <a href="#" className="text-sm font-medium text-brand-blue hover:underline">See all →</a>
            </div>
            <div className="mt-4 space-y-3">
              {lessons.map((l) => (
                <div key={l.id} className="group flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-white p-4 transition-all hover:shadow-md">
                  <div className="h-12 w-1 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                  <div className="flex w-16 flex-col items-center text-center">
                    <span className="text-label-sm text-muted-foreground">{l.day}</span>
                    <span className="text-h3 text-navy">{l.date.split(" ")[0]}</span>
                    <span className="text-xs text-muted-foreground">{l.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{l.time}</span>
                      <Badge variant={l.status === "confirmed" ? "success" : "warning"} size="sm">
                        {l.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-[10px] font-semibold text-white">{l.initials}</span>
                      <span>{l.instructor}</span>
                      <span>·</span>
                      <span className="font-mono text-xs">{l.plate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <h2 className="text-h3 text-navy">Quick actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ActionCard icon={Calendar} title="Book next lesson" tone="info" to="/book" />
              <ActionCard icon={AlertCircle} title="Pay balance" tone="brand" to="/payments" />
              <ActionCard icon={BookOpen} title="Take theory quiz" tone="purple" to="/theory" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-h2 text-navy">Available Courses</h2>
            <p className="text-sm text-muted-foreground mt-1">Explore other courses you can enroll in</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {courses.map((course) => {
            const Icon = course.icon;
            const toneCls = {
              info: "border-info-light bg-info-light/5",
              warning: "border-warning-light bg-warning-light/5",
              purple: "border-purple-light bg-purple-light/5",
            };
            const toneText = {
              info: "text-info",
              warning: "text-warning",
              purple: "text-purple",
            };

            return (
              <div
                key={course.slug}
                className={`group relative overflow-hidden rounded-2xl border-2 ${toneCls[course.tone]} bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-brand-blue`}
              >
                {course.featured && (
                  <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-brand/10 blur-2xl group-hover:bg-brand/20 transition-all" />
                )}
                <div className="relative">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${course.tone}-light text-${course.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-h3 text-navy">{course.name}</h3>
                        <Badge variant={course.tone} size="sm" className="mt-2">{course.className}</Badge>
                      </div>
                      {course.featured && <Badge className="bg-brand text-white">Popular</Badge>}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{course.desc}</p>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                      <div>
                        <p className="text-h3 text-navy">{course.lessons}</p>
                        <p className="text-[11px] text-muted-foreground">Lessons</p>
                      </div>
                      <div>
                        <p className="text-h3 text-navy">{course.duration}</p>
                        <p className="text-[11px] text-muted-foreground">Duration</p>
                      </div>
                      <div>
                        <p className="text-h3 text-brand">KES {course.price}</p>
                        <p className="text-[11px] text-muted-foreground">Price</p>
                      </div>
                    </div>
                    <Button asChild variant="primary" size="sm" className="mt-4 w-full">
                      <Link to={`/book?course=${course.slug}`}>Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, tone, to }: { icon: any; title: string; tone: "info" | "brand" | "purple"; to: string }) {
  const toneCls = { info: "bg-info-light text-info", brand: "bg-brand-light text-brand", purple: "bg-purple-light text-purple" }[tone];
  return (
    <Link to={to as any} className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 text-left transition-all hover:border-brand-blue hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneCls}`}><Icon className="h-5 w-5" /></div>
      <span className="flex-1 text-sm font-medium">{title}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
