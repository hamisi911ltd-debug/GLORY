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
}

const AuthContext = React.createContext<AuthState>({
  user: null, roles: [], loading: true, signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = api.getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token and get user data
      const { data, error } = await api.get<{ user: User; roles: AppRole[] }>("/auth/me");
      
      if (error || !data) {
        // Token invalid, clear it
        api.clearAuthToken();
        setUser(null);
        setRoles([]);
      } else {
        setUser(data.user);
        setRoles(data.roles);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    await api.post("/auth/logout");
    api.clearAuthToken();
    setUser(null);
    setRoles([]);
  };

  const value: AuthState = {
    user,
    roles,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => React.useContext(AuthContext);
