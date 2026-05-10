import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Star, ShieldCheck, Car, Bike, Truck, ArrowRight, Check, MapPin,
  Calendar, Award, Users, Quote, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/site/PublicNav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DriveSchool Pro — Learn to Drive with Confidence" },
      { name: "description", content: "Kenya's #1 driving school. Cars, motorcycles, HGVs. 500+ students trained, 98% pass rate, 3 branches." },
      { property: "og:title", content: "DriveSchool Pro" },
      { property: "og:description", content: "Learn to drive with Kenya's top-rated driving school." },
    ],
  }),
  component: HomePage,
});

const courses = [
  { slug: "car", icon: Car, name: "Car Driving", className: "Class B", desc: "Master cars from manual to automatic. Includes theory, mock tests, and 20 lessons.", lessons: 20, duration: "6 weeks", price: 8500, tone: "info", featured: true },
  { slug: "motorcycle", icon: Bike, name: "Motorcycle", className: "Class A", desc: "Build confidence on two wheels. Safety first, with experienced rider instructors.", lessons: 12, duration: "4 weeks", price: 6000, tone: "warning", featured: false },
  { slug: "hgv", icon: Truck, name: "HGV / Truck", className: "Class C", desc: "Open commercial driving careers. Heavy vehicle handling with certified examiners.", lessons: 30, duration: "10 weeks", price: 14000, tone: "purple", featured: false },
] as const;

const steps = [
  { n: 1, title: "Register Online", desc: "Create your account in under 2 minutes." },
  { n: 2, title: "Choose & Pay", desc: "Pick your course and pay via M-Pesa or card." },
  { n: 3, title: "Book Lessons", desc: "Schedule lessons that fit your week." },
  { n: 4, title: "Get Certified", desc: "Pass your assessment and earn your certificate." },
];

const instructors = [
  { name: "James Mwangi", role: "Senior Instructor", rating: 4.9, reviews: 47, vehicles: ["Car", "Motorcycle"], top: true },
  { name: "Grace Wanjiru", role: "Lead Instructor", rating: 4.8, reviews: 62, vehicles: ["Car"], top: true },
  { name: "Peter Otieno", role: "HGV Specialist", rating: 4.9, reviews: 31, vehicles: ["HGV"], top: false },
];

const branches = [
  { name: "Westlands", address: "Mpaka Rd, Westlands, Nairobi", phone: "+254 700 123 456", hours: "Mon–Sat · 7am–7pm" },
  { name: "Karen", address: "Karen Hardy, Langata Rd", phone: "+254 700 234 567", hours: "Mon–Sat · 7am–7pm" },
  { name: "Mombasa Road", address: "South C, Capital Centre", phone: "+254 700 345 678", hours: "Mon–Sat · 7am–7pm" },
];

const testimonials = [
  { quote: "I went from terrified of intersections to confidently driving across Nairobi in 6 weeks. The instructors actually care.", name: "Amara Njeri", branch: "Westlands Branch" },
  { quote: "Booking lessons online was so easy. M-Pesa payment, instant confirmation, and James was an incredible instructor.", name: "Brian Kiprotich", branch: "Karen Branch" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand-blue/40 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-12 md:gap-8 md:px-8 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="md:col-span-7"
          >
            <Badge variant="brand" className="mb-6">Kenya's #1 Driving School</Badge>
            <h1 className="text-display-lg md:text-display-xl">
              Learn to Drive with <span className="text-brand">Confidence</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Professional instruction for cars, motorcycles, and HGVs across 3 branches. Book lessons online, pay with M-Pesa, get certified.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/register">Enrol now <ArrowRight className="ml-1" /></Link></Button>
              <Button asChild variant="hero-outline" size="xl"><Link to="/courses/car">Explore courses</Link></Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" /> <strong className="text-white">4.9</strong> Google rating</div>
              <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 500+ students</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Since 2018</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-5"
          >
            <div className="rounded-2xl bg-white p-6 text-foreground shadow-2xl">
              <div className="flex items-center justify-between">
                <Badge variant="success">Confirmed</Badge>
                <span className="text-xs text-muted-foreground">Booking #1847</span>
              </div>
              <p className="text-label-sm mt-5 text-muted-foreground">Next lesson</p>
              <p className="mt-1 text-h2 text-navy">Wed 14 May · 10:00 AM</p>
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-surface-2 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">JM</div>
                <div>
                  <p className="text-sm font-semibold">James Mwangi</p>
                  <p className="text-xs text-muted-foreground">Senior Instructor</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-mono font-semibold">KAB 123X</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="font-semibold">Westlands</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 py-10 md:grid-cols-4 md:px-8">
          {[
            { v: "500+", l: "Students trained" },
            { v: "15", l: "Instructors" },
            { v: "3", l: "Branches" },
            { v: "98%", l: "Pass rate" },
          ].map((s) => (
            <div key={s.l} className="px-4 text-center">
              <p className="text-h1 text-brand">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="bg-surface-1 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-label-sm text-brand">Courses</p>
            <h2 className="mt-2 text-h1 text-navy md:text-display-lg">Pick the course that fits your goal</h2>
            <p className="mt-3 text-muted-foreground">Whether you're after a personal license or a commercial career, we've got a track for you.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {courses.map((c) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xs transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {c.featured && (
                  <Badge variant="brand" className="absolute right-4 top-4 z-10">Most popular</Badge>
                )}
                <div className={`h-40 bg-${c.tone}-light flex items-center justify-center`}>
                  <c.icon className={`h-16 w-16 text-${c.tone}`} strokeWidth={1.25} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <Badge variant={c.tone as any} size="sm" className="self-start">{c.className}</Badge>
                  <h3 className="mt-3 text-h3 text-navy">{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.lessons} lessons</span>
                    <span>·</span>
                    <span>{c.duration}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-h2 text-navy">KES {c.price.toLocaleString()}</p>
                    </div>
                    <Link to="/courses/$courseId" params={{ courseId: c.slug }} className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
                      View course <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-label-sm text-brand">How it works</p>
            <h2 className="mt-2 text-h1 text-navy md:text-display-lg">From sign-up to certificate</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-px w-full bg-border md:block" />
                )}
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-h2 text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-center text-h3 text-navy">{s.title}</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section id="instructors" className="bg-surface-1 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-label-sm text-brand">Instructors</p>
              <h2 className="mt-2 text-h1 text-navy md:text-display-lg">Meet the team</h2>
            </div>
            <Link to="/" className="hidden text-sm font-medium text-brand-blue hover:underline md:inline">Meet all instructors →</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {instructors.map((i) => (
              <div key={i.name} className="rounded-2xl border border-border bg-white p-6 shadow-xs">
                <div className="relative inline-block">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-blue text-h2 font-bold text-white">
                    {i.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  {i.top && <Badge variant="warning" size="sm" className="absolute -right-1 -top-1">Top rated</Badge>}
                </div>
                <h3 className="mt-4 text-h3 text-navy">{i.name}</h3>
                <p className="text-sm text-muted-foreground">{i.role}</p>
                <div className="mt-3 flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <strong>{i.rating}</strong>
                  <span className="text-muted-foreground">({i.reviews} reviews)</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {i.vehicles.map(v => <Badge key={v} variant="default" size="sm">{v}</Badge>)}
                </div>
                <Button variant="secondary" size="sm" className="mt-5 w-full">View profile</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-label-sm text-brand">Reviews</p>
            <h2 className="mt-2 text-h1 text-navy md:text-display-lg">What our students say</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <div key={t.name} className="relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-8">
                <Quote className="absolute -right-2 -top-2 h-24 w-24 text-border" strokeWidth={1} />
                <p className="relative text-lg italic text-foreground">"{t.quote}"</p>
                <div className="relative mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.branch}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="bg-surface-1 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-label-sm text-brand">Locations</p>
            <h2 className="mt-2 text-h1 text-navy md:text-display-lg">3 branches across Nairobi</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {branches.map((b) => (
              <div key={b.name} className="rounded-2xl border border-border bg-white p-6 shadow-xs transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-h3 text-navy">{b.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.address}</p>
                    <p className="mt-2 text-sm">{b.phone}</p>
                    <p className="text-xs text-muted-foreground">{b.hours}</p>
                  </div>
                </div>
                <button className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
                  Get directions <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <Award className="mx-auto h-12 w-12 text-brand" />
          <h2 className="mt-4 text-h1 md:text-display-lg">Ready to take the wheel?</h2>
          <p className="mt-3 text-white/70">Join 500+ students who got their license with us.</p>
          <Button asChild variant="hero" size="xl" className="mt-8"><Link to="/register">Start your application <ArrowRight /></Link></Button>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Pay via M-Pesa</span>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Free reschedule</span>
            <span className="flex items-center gap-1"><Check className="h-4 w-4 text-success" /> Certified instructors</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
