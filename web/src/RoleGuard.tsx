// RoleGuard.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "./contexts/AuthContext";
import { JSX } from "react/jsx-runtime";

type Props = {
  allowed: Role[];
  children: JSX.Element;
};

const RoleGuard = ({ allowed, children }: Props) => {
  const { role } = useAuth();
  const navigate = useNavigate();

  // If role not allowed, immediately step back in history
  useEffect(() => {
    if (!allowed.includes(role)) {
      window.history.go(-1); // <- go back one entry
    }
  }, [role, allowed, navigate]);

  // Render children only when authorised
  return allowed.includes(role) ? children : null;
};

export default RoleGuard;
