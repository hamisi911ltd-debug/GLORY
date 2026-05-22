import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Immacurate Driving School" }, { name: "description", content: "Log in to your Immacurate Driving School account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-surface-1">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-h1 text-navy">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tap the button below to continue to the dashboard.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Continue to Dashboard
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No credentials required – everyone can access the app from here.
          </p>
        </div>
      </div>
    </div>
  );
}
