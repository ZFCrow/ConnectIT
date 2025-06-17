// ViolationPicker.tsx
import {  Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useOptionLogic } from "./CustomHooks/useOptionLogic";
import type { Violation } from "@/type/Violation";

interface ViolationPickerProps {
  allViolations: Violation[];
  selected: Violation[];
  onChange: (violations: Violation[]) => void;
}

export function ViolationPicker({ allViolations, selected, onChange }: ViolationPickerProps) {
  const { open, setOpen, search, setSearch, filtered, toggle } =
    useOptionLogic<Violation, "name">(allViolations, selected, "name");

  return (
    //! from gpt
    // <div>
    //   <Popover open={open} onOpenChange={setOpen}>
    //     <PopoverTrigger asChild>
    //       <Button>{selected.length ? `${selected.length} chosen` : "Select violations..."}</Button>
    //     </PopoverTrigger>
    //     <PopoverContent>
    //       <input 
    //         placeholder="Search reasons…" 
    //         value={search} 
    //         onChange={(e)=>setSearch(e.target.value)}
    //       />
    //       {filtered.map((v) => (
    //         <div key={v.violationId} onClick={()=>onChange(toggle(v))}>
    //           {v.name} {selected.some(s=>s.violationId===v.violationId) && <Check />}
    //         </div>
    //       ))}
    //     </PopoverContent>
    //   </Popover>
    //   <div>
    //     {selected.map((v)=>(
    //       <Badge key={v.violationId} onClick={()=>onChange(toggle(v))}>
    //         {v.name} <X />
    //       </Badge>
    //     ))}
    //   </div>
    // </div>


         <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected.length > 0
              ? `${selected.length} tag${selected.length > 1 ? "s" : ""} selected`
              : "Select tags..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <div className="border-b p-2">
            <input
                className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground"
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No tags found</p>
            ) : (
              filtered.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={ 
                    () => {
                      const next = toggle(tag);
                      onChange(next);
                    }

                  }
                >
                  <span>{tag.name}</span>
                  {selected.includes(tag) && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

        {/* Selected tags */}
        {selected.length > 0 && (
            <div className="flex flex-wrap gap-1">
            {selected.map((tag) => (
                <Badge key={tag.name} variant="secondary" className="hover:bg-zinc-600 gap-1" onClick={() => toggle(tag)}>
                {tag.name}
                <X
                    className="h-3 w-3" 
                />
                </Badge>
            ))}
            </div>
        )}
    </div> 
  );
}
