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
  name: string | "";
  profilePicUrl: string | "";
  userId: number | null;
  companyId: number | null;
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

  // Optionally: load from localStorage / cookie on mount
  useEffect(() => {
    logout(); //!! clear any existing auth state CAN REMOVE IF LOGOUT IS IMPLEMENTED IN THE FUTURE
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { accountId, role, name, profilePicUrl, userId, companyId } = JSON.parse(stored);
      setAccountId(accountId);
      setRole(role);
      setName(name);
      setProfilePic(profilePicUrl ?? null);
      setUserId(userId ?? null);
      setCompanyId(companyId ?? null);
    } else {
      //!!  for now we HARDCODE the values
      // login(2, Role.Company, { companyId: 1 });
      // login(1, Role.User, "JOHNNY", 
      //   { userId: 1, profilePicUrl: "https://storage.googleapis.com/connectit-63f60.firebasestorage.app/profilePic/acc_35.png" });
      // login(40, Role.Company, { companyId: 2 });
      // login(1, Role.Admin, { userId: 1 }); // HARDCODED FOR TESTING
      //login (35,Role.User, { userId: 8 }); // HARDCODED FOR TESTING
    }
  }, []);

  const login = (
    acctId: number,
    r: Role,
    name: string, 
    opts: { userId?: number; companyId?: number; profilePicUrl?: string } = {}
  ) => {
    setAccountId(acctId);
    setRole(r);
    setName(name);

    // only one of these should be non-null:
    setUserId(opts.userId ?? null);
    setCompanyId(opts.companyId ?? null);
    setProfilePic(opts.profilePicUrl ?? null);

    localStorage.setItem(
      "auth",
      JSON.stringify({
        accountId: acctId,
        role: r,
        name: name,
        userId: opts.userId ?? null,
        companyId: opts.companyId ?? null,
        profilePicUrl: opts.profilePicUrl ?? null,
      })
    );
  };

  const logout = () => {
    setAccountId(null);
    setRole(null);
    setName(null);
    setUserId(null);
    setCompanyId(null);
    setProfilePic(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider
      value={{ accountId, role, name, profilePicUrl, userId, companyId, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
