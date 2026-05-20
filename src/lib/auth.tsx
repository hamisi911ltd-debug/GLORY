import * as React from "react";
import { api } from "@/lib/api";

type AppRole = "super_admin" | "branch_admin" | "instructor" | "finance" | "examiner" | "student";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  /** Call after login to refresh user/roles without a full page reload */
  refreshAuth: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  const checkAuth = React.useCallback(async () => {
    const token = api.getAuthToken();
    if (!token) {
      setUser(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await api.get<{ user: User; roles: AppRole[] }>("/auth/me");

    if (error || !data) {
      // Token invalid or expired — clear it
      api.clearAuthToken();
      setUser(null);
      setRoles([]);
    } else {
      setUser(data.user);
      setRoles(data.roles as AppRole[]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signOut = async () => {
    await api.post("/auth/logout");
    api.clearAuthToken();
    setUser(null);
    setRoles([]);
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const value: AuthState = { user, roles, loading, signOut, refreshAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
