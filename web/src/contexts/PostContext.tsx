// src/contexts/PostContext.tsx
import { createContext, useContext, ReactNode } from "react"; 
import usePostManager from "@/components/CustomHooks/usePostManager";

const PostContext = createContext<ReturnType<typeof usePostManager> | null>(null);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const manager = usePostManager(); // keeps all your existing logic
  return <PostContext.Provider value={manager}>{children}</PostContext.Provider>;
};

export const usePostContext = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePostContext must be within PostProvider");
  return ctx;
};
