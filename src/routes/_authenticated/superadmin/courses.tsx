import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, CheckCircle2, XCircle, Clock, BookOpen, Car, Bike, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/superadmin/courses")({
  head: () => ({ meta: [{ title: "Course Management — DriveSchool Pro" }] }),
  component: CoursesPage,
});

interface Course {
  id: string;
  name: string;
  description: string;
  vehicle_type: string;
  lesson_count: number;
  theory_hours: number;
  price: number;
  duration_weeks: number;
  status: "active" | "inactive";
}

const vehicleIcons: Record<string, any> = {
  car: Car,
  motorcycle: Bike,
  truck: Truck,
};

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Partial<Course>>({
    name: "",
    description: "",
    vehicle_type: "car",
    lesson_count: 20,
    theory_hours: 8,
    price: 0,
    duration_weeks: 6,
    status: "active",
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      console.error("Load courses error:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(form)
          .eq("id", editingCourse.id);
        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase
          .from("courses")
          .insert(form);
        if (error) throw error;
        toast.success("Course created successfully");
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setForm({
        name: "",
        description: "",
        vehicle_type: "car",
        lesson_count: 20,
        theory_hours: 8,
        price: 0,
        duration_weeks: 6,
        status: "active",
      });
      loadCourses();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setForm(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Course deleted");
      loadCourses();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-navy">Courses &amp; Pricing</h1>
          <p className="mt-1 text-sm text-muted-foreground">{courses.length} courses platform-wide</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditingCourse(null); setForm({ name: "", description: "", vehicle_type: "car", lesson_count: 20, theory_hours: 8, price: 0, duration_weeks: 6, status: "active" }); setIsModalOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" /> Add course
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Course</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Vehicle</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Lessons</th>
                <th className="px-4 py-3 text-right text-label-sm text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left text-label-sm text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-label-sm text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">Loading courses...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">No courses found.</td>
                </tr>
              ) : (
                filtered.map((course) => {
                  const Icon = vehicleIcons[course.vehicle_type] || BookOpen;
                  return (
                    <tr key={course.id} className="hover:bg-surface-1 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-navy">{course.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{course.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground flex items-center gap-2">
                        <Icon className="h-4 w-4" /> {course.vehicle_type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{course.lesson_count} lessons · {course.duration_weeks}w</td>
                      <td className="px-4 py-3 text-right font-semibold text-navy">KES {course.price.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant={course.status === "active" ? "success" : "danger"} size="sm">
                          {course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(course)} className="rounded p-1.5 hover:bg-surface-2 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(course.id)} className="rounded p-1.5 hover:bg-danger-light text-muted-foreground hover:text-danger">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-h2 text-navy">{editingCourse ? "Edit Course" : "Add Course"}</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label>Course Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Vehicle Type *</Label>
                  <select
                    className="w-full rounded-lg border border-border p-2 text-sm"
                    value={form.vehicle_type}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                  >
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status *</Label>
                  <select
                    className="w-full rounded-lg border border-border p-2 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Lessons *</Label>
                  <Input type="number" value={form.lesson_count} onChange={(e) => setForm({ ...form, lesson_count: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration (Weeks) *</Label>
                  <Input type="number" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Price (KES) *</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Theory Hours</Label>
                  <Input type="number" value={form.theory_hours} onChange={(e) => setForm({ ...form, theory_hours: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="lg" className="flex-1" type="submit">Save Course</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
