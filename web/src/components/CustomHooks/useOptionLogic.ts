// useOptionLogic.ts
import { useState, useCallback, useMemo } from "react";

export function useOptionLogic<T, K extends keyof T>(
  allItems: T[],
  selectedItems: T[],
) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      allItems.filter((item) =>
      
        String(item["name"]).toLowerCase().includes(search.toLowerCase())
      ),
    [allItems, search]
  );

  const toggle = useCallback(
    (item: T) => {
      
      const exists = selectedItems.some((s) => s["name"] === item["name"]);
      const next = exists
        ? selectedItems.filter((s) => s["name"] !== item["name"])
        : [...selectedItems, item];
      setOpen(true);
      return next;
    },
    [selectedItems]
  );

  const removeItem = useCallback( 
    (item: T) => {
      
      const next = selectedItems.filter((s) => s["name"] !== item["name"]);
      //setOpen(true);
      return next;
    },
    [selectedItems]
  ); 

  return { open, setOpen, search, setSearch, filtered, toggle, removeItem };
}
