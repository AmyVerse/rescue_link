import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "user" | "admin";

interface AuthState {
  name: string;
  role: UserRole;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (name: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Cookie helpers
const setCookie = (name: string, value: string, days = 30) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const COOKIE_NAME = "rescue_auth";
const COOKIE_ROLE = "rescue_role";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(() => {
    const savedName = getCookie(COOKIE_NAME);
    const savedRole = getCookie(COOKIE_ROLE) as UserRole | null;

    return {
      name: savedName || "",
      role: savedRole || "user",
      isLoggedIn: !!savedName,
    };
  });

  const login = useCallback((name: string, role: UserRole) => {
    setCookie(COOKIE_NAME, name);
    setCookie(COOKIE_ROLE, role);
    setState({ name, role, isLoggedIn: true });
  }, []);

  const logout = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    deleteCookie(COOKIE_ROLE);
    setState({ name: "", role: "user", isLoggedIn: false });
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setCookie(COOKIE_ROLE, role);
    setState((prev) => ({ ...prev, role }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        switchRole,
        isAdmin: state.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
