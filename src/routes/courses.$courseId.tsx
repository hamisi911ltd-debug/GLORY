import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Car, Bike, Truck, Check, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/site/PublicNav";
import { Footer } from "@/components/site/Footer";

const COURSES = {
  car: { icon: Car, name: "Car Driving Course", className: "Class B", tone: "info", lessons: 20, includes: ["20 professional lessons (1hr each)", "Theory test preparation", "Mock examination", "Certificate of completion", "Free lesson rescheduling"], packages: [{ name: "Basic", price: 8500, items: ["20 lessons", "Theory prep", "1 mock test", "Certificate"] }, { name: "Standard", price: 11500, items: ["25 lessons", "Theory prep", "3 mock tests", "Pickup service", "Certificate"] }, { name: "Premium", price: 16500, items: ["30 lessons", "1-on-1 instructor", "Unlimited mocks", "Pickup service", "Exam booking", "Certificate"] }] },
  motorcycle: { icon: Bike, name: "Motorcycle Course", className: "Class A", tone: "warning", lessons: 12, includes: ["12 riding lessons", "Safety gear training", "Highway code", "Mock test", "Certificate of completion"], packages: [{ name: "Basic", price: 6000, items: ["12 lessons", "Theory prep", "Certificate"] }, { name: "Standard", price: 8500, items: ["15 lessons", "Gear included", "2 mock tests", "Certificate"] }, { name: "Premium", price: 11000, items: ["20 lessons", "Premium gear", "Unlimited mocks", "Certificate"] }] },
  hgv: { icon: Truck, name: "HGV / Truck Course", className: "Class C", tone: "purple", lessons: 30, includes: ["30 lessons on heavy vehicles", "Pre-trip inspection training", "Reverse parking certification", "Highway driving", "Mock examination"], packages: [{ name: "Basic", price: 14000, items: ["30 lessons", "Theory prep", "Certificate"] }, { name: "Standard", price: 18500, items: ["40 lessons", "Pickup", "3 mocks", "Certificate"] }, { name: "Premium", price: 24000, items: ["50 lessons", "1-on-1", "Job placement help", "Certificate"] }] },
} as const;

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const c = COURSES[params.courseId as keyof typeof COURSES];
    if (!c) throw notFound();
    return { course: c };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.course.name} — DriveSchool Pro` },
      { name: "description", content: `Enrol in our ${loaderData.course.name}. ${loaderData.course.lessons} lessons, certified instructors.` },
    ] : [],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  const Icon = course.icon;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Courses</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{course.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Badge variant={course.tone as any}>{course.className}</Badge>
            <h1 className="mt-3 text-display-lg text-navy">{course.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Built around real-world Kenyan driving conditions. Our instructors will get you confident, safe, and ready to pass.
            </p>

            <div className={`mt-8 flex h-48 items-center justify-center rounded-2xl bg-${course.tone}-light`}>
              <Icon className={`h-24 w-24 text-${course.tone}`} strokeWidth={1.25} />
            </div>

            <div className="mt-10">
              <h2 className="text-h2 text-navy">What's included</h2>
              <ul className="mt-4 space-y-3">
                {course.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-surface-1 p-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <strong className="text-h3">4.9</strong>
                <span className="text-sm text-muted-foreground">· 124 student reviews</span>
              </div>
              <p className="mt-3 text-sm italic text-muted-foreground">
                "Best decision I made. Got my license in 6 weeks." — Aisha M.
              </p>
            </div>
          </div>

          {/* Sticky pricing */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-border bg-white p-6 shadow-lg">
              <h3 className="text-h3 text-navy">Enrol in this course</h3>
              <Tabs packages={course.packages as any} />
              <Button asChild variant="primary" size="lg" className="mt-6 w-full">
                <Link to="/register">Enrol now</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pay via M-Pesa or Card · Cancel anytime
              </p>
              <div className="mt-5 flex items-center justify-center gap-3 border-t border-border pt-5 opacity-60">
                <span className="text-xs font-mono">M-PESA</span>
                <span className="text-xs font-mono">VISA</span>
                <span className="text-xs font-mono">MASTERCARD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { useState } from "react";
function Tabs({ packages }: { packages: { name: string; price: number; items: string[] }[] }) {
  const [active, setActive] = useState(1);
  const pkg = packages[active];
  return (
    <>
      <div className="mt-5 flex rounded-lg bg-surface-2 p-1">
        {packages.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActive(i)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active === i ? "bg-white text-navy shadow-sm" : "text-muted-foreground"}`}
          >{p.name}</button>
        ))}
      </div>
      <div className="mt-5">
        <p className="text-display-lg text-navy">KES {pkg.price.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">/full course</p>
      </div>
      <ul className="mt-5 space-y-2">
        {pkg.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-success" /> {item}
          </li>
        ))}
      </ul>
    </>
  );
}
