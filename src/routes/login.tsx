import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Immacurate Driving School" }, { name: "description", content: "Log in to your Immacurate Driving School account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await api.post<{ token: string; user: any; roles: string[] }>('/auth/login', {
      email: email.trim(),
      password,
    });
    
    if (error || !data) {
      setLoading(false);
      toast.error(error || 'Login failed');
      return;
    }
    
    api.setAuthToken(data.token);
    await refreshAuth();
    setLoading(false);
    
    toast.success('Welcome back!');
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-h1 text-navy">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your journey.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/register" className="font-medium text-brand hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
