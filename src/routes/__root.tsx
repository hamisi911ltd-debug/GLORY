import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts, Link, useRouter } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-1 px-4">
      <div className="max-w-md text-center">
        <p className="text-label-sm text-brand">404</p>
        <h1 className="mt-2 text-display-lg text-navy">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you're looking for has moved or doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-md bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand/90">Back to home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-1 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-h1 text-navy">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Please try again."}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex h-10 items-center rounded-md bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand/90"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DriveSchool Pro — Learn to Drive with Confidence" },
      { name: "description", content: "Kenya's top-rated driving school. Professional instruction for cars, motorcycles, and HGVs across 3 branches." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
