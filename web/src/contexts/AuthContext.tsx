import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import axios from "@/utility/axiosConfig";
import { set } from "zod";
export const Role = {
  User: "User",
  Admin: "Admin",
  Company: "Company",
} as const;
export type Role = (typeof Role)[keyof typeof Role];
import { resetCsrf } from "@/utility/axiosConfig";

interface AuthContextType {
  accountId: number | null;
  role: Role | null;
  name: string | "";
  profilePicUrl: string | "";
  userId: number | null;
  companyId: number | null;
  isLoading: boolean;
  verified: boolean | null;

  login: (
    accountId: number,
    role: Role,
    name: string,
    opts?: {
      userId?: number;
      companyId?: number;
      profilePicUrl?: string;
      verified?: boolean | null;
    }
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accountId: null,
  role: null,
  name: null,
  profilePicUrl: null,
  userId: null,
  companyId: null,
  verified: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accountId, setAccountId] = useState<number | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [profilePicUrl, setProfilePic] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          setAccountId(data.accountId ?? null);
          setRole(data.role ?? null);
          setName(data.name ?? null);
          setProfilePic(data.profilePicUrl ?? null);
          setUserId(data.userId ?? null);
          setCompanyId(data.companyId ?? null);
          setVerified(data.verified ?? null);
        } 
      } catch (err) {
        console.error("[AuthProvider] Auth check failed:", err);
      } finally {
        if (isMounted) setIsLoading(false);
    }
    }

    bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
  (
    acctId: number,
    r: Role,
    nm: string,
    opts: {
      userId?: number;
      companyId?: number;
      profilePicUrl?: string;
      verified?: boolean;
    } = {}
  ) => {
    setAccountId(acctId);
    setRole(r);
    setName(nm);
    setUserId(opts.userId ?? null);
    setCompanyId(opts.companyId ?? null);
    setProfilePic(opts.profilePicUrl ?? null);
    setVerified(opts.verified ?? null);
  },
    []
  );

  const logout = useCallback(async () => {
  try {
    await axios.post("/api/logout");
  } catch (err) {
    console.error("[AuthProvider] Logout failed", err);
  } finally {
    setAccountId(null);
    setRole(null);
    setName(null);
    setUserId(null);
    setCompanyId(null);
    setProfilePic(null);
    setVerified(null);
  }
}, []);

  const endSession = useCallback(async () => {
    await axios.post("/api/logout");
    resetCsrf();
    window.location.reload();
  }, []);

  // 24-hour TTL logout
  useEffect(() => {
    const ttl = 24 * 60 * 60 * 1000; // 24 hours
    const ttlId = setTimeout(() => {
      endSession()
        .catch((err) => console.error("endSession error:", err))
        .finally(() => {
          window.location.reload();
        });
    }, ttl);

    return () => clearTimeout(ttlId);
  }, [endSession]);

  // Idle-timeout logout (30 min of no activity)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        endSession()
          .catch((err) => console.error("endSession failed:", err))
          .finally(() => {
            window.location.reload();
          });
      }, 30 * 60 * 1000);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer(); // start initial idle timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [endSession]);

  // memoize the context value
  const authValue = useMemo(
    () => ({
      accountId,
      role,
      name,
      profilePicUrl,
      userId,
      companyId,
      verified,
      isLoading,
      login,
      logout,
    }),
    [
      accountId,
      role,
      name,
      profilePicUrl,
      userId,
      companyId,
      verified,
      isLoading,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return ctx;
};
