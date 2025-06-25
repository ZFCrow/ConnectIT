import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

export const Role = {
  User: "User",
  Admin: "Admin",
  Company: "Company",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

interface AuthContextType {
  accountId: number | null;
  role: Role | null;
  name: string | "";
  profilePicUrl: string | "";
  userId: number | null;
  companyId: number | null;
  isLoading: boolean;
  login: (
    accountId: number,
    role: Role,
    name: string,
    opts?: { userId?: number; companyId?: number; profilePicUrl?: string }
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
  isLoading:     true,
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
  const [isLoading,     setIsLoading]     = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const res = await fetch("/api/me", {
          method:      "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data)
          if (!isMounted) return;
          setAccountId(     data.accountId     ?? null);
          setRole(          data.role          ?? null);
          setName(          data.name          ?? null);
          setProfilePic( data.profilePicUrl ?? null);
          setUserId(        data.userId        ?? null);
          setCompanyId(     data.companyId     ?? null);
        } else {
          // 401 or empty payload → user not logged in
          console.log("json returns nothing");
        }
      } catch (err) {
        console.error("[AuthProvider] Auth check failed:", err);
      } finally {
        if (isMounted) setIsLoading(false);
        console.log("[AuthProvider] Auth check completed");
      }
    }

    bootstrapAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (
    acctId: number,
    r:      Role,
    nm:     string,
    opts:   { userId?: number; companyId?: number; profilePicUrl?: string } = {}
  ) => {
    setAccountId(acctId);
    setRole(r);
    setName(nm);
    setUserId(opts.userId          ?? null);
    setCompanyId(opts.companyId    ?? null);
    setProfilePic(opts.profilePicUrl ?? null);
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method:      "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("[AuthProvider] Logout failed", err);
    } finally {
      setAccountId(null);
      setRole(     null);
      setName(     null);
      setUserId(   null);
      setCompanyId(null);
      setProfilePic(null);
    }
  };

  useEffect(() => {
  if (!isLoading && accountId) {

    const refreshInterval = setInterval(() => {
      fetch("/api/refresh", {
        method:      "POST",
        credentials: "include",
      })
      .then(res => {
        if (!res.ok) {
          console.error("[AuthProvider] Token refresh failed:", res.statusText);
        }
      })
      .catch(err => {
        console.error("[AuthProvider] Token refresh network error:", err);
      });
    }, 15 * 60 * 1000); // 15 minutes

    return () => {
      clearInterval(refreshInterval);
      };
    }
  }, [isLoading, accountId]);


  // memoize the context value
  const authValue = useMemo(() => ({
    accountId,
    role,
    name,
    profilePicUrl,
    userId,
    companyId,
    isLoading,
    login,
    logout,
  }), [
    accountId,
    role,
    name,
    profilePicUrl,
    userId,
    companyId,
    isLoading,
    login,
    logout,
  ]);

  
  return (
    <AuthContext.Provider
      value={authValue}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  // console.log("[useAuth] context returned", {
  //   accountId: ctx.accountId,
  //   role:      ctx.role,
  //   name:      ctx.name,
  // });
  return ctx;
};
