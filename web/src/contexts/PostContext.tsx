// src/contexts/PostContext.tsx
import { createContext, useContext } from "react";
import { usePostManager } from "@/components/CustomHooks/usePostManger";




const PostContext = createContext<ReturnType<typeof usePostManager> | null>(null);

export const PostProvider = ({ children }) => {
  const manager = usePostManager(); // keeps all your existing logic
  return <PostContext.Provider value={manager}>{children}</PostContext.Provider>;
};

export const usePostContext = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePostContext must be within PostProvider");
  return ctx;
};
