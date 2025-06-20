// useOptionLogic.ts
import { useState, useCallback, useMemo } from "react";

export function useOptionLogic<T, K extends keyof T>(
  allItems: T[],
  selectedItems: T[],
  key: K
) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      allItems.filter((item) =>
        String(item[key]).toLowerCase().includes(search.toLowerCase())
      ),
    [allItems, key, search]
  );

  const toggle = useCallback(
    (item: T) => {
      console.log("Toggling item:", item);
      const exists = selectedItems.some((s) => s[key] === item[key]);
      const next = exists
        ? selectedItems.filter((s) => s[key] !== item[key])
        : [...selectedItems, item];
      setOpen(true);
      return next;
    },
    [key, selectedItems]
  );

  const removeItem = useCallback( 
    (item: T) => {
      console.log("Removing item:", item);
      const next = selectedItems.filter((s) => s[key] !== item[key]);
      //setOpen(true);
      return next;
    },
    [key, selectedItems]
  ); 

  return { open, setOpen, search, setSearch, filtered, toggle, removeItem };
}
