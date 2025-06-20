import React, { createContext, useContext, useState, useEffect } from "react";
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
  userId: number | null;
  companyId: number | null;
  login: (
    accountId: number,
    role: Role,
    opts?: { userId?: number; companyId?: number }
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  accountId: null,
  role: null,
  userId: null,
  companyId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accountId, setAccountId] = useState<number | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // Optionally: load from localStorage / cookie on mount
  useEffect(() => {
    logout(); //!! clear any existing auth state CAN REMOVE IF LOGOUT IS IMPLEMENTED IN THE FUTURE
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { accountId, role, userId, companyId } = JSON.parse(stored);
      setAccountId(accountId);
      setRole(role);
      setUserId(userId ?? null);
      setCompanyId(companyId ?? null);
    } else {
      //!!  for now we HARDCODE the values
      // login(2, Role.Company, { companyId: 1 });
      // login(1, Role.User, { userId: 1 });
      // login(1, Role.Company, { companyId: 1 });
      // login(1, Role.Admin, { userId: 1 }); // HARDCODED FOR TESTING
    }
  }, []);

  const login = (
    acctId: number,
    r: Role,
    opts: { userId?: number; companyId?: number } = {}
  ) => {
    setAccountId(acctId);
    setRole(r);

    // only one of these should be non-null:
    setUserId(opts.userId ?? null);
    setCompanyId(opts.companyId ?? null);

    localStorage.setItem(
      "auth",
      JSON.stringify({
        accountId: acctId,
        role: r,
        userId: opts.userId ?? null,
        companyId: opts.companyId ?? null,
      })
    );
  };

  const logout = () => {
    setAccountId(null);
    setRole(null);
    setUserId(null);
    setCompanyId(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{ accountId, role, userId, companyId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
