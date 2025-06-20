import { useState, useCallback } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { Label } from "@/type/Label"; // Import the Label type 
import type { Violation } from "@/type/Violation";

export type Tag = Label | Violation; // Define AllTags type as an array of Label or Violation 

interface OptionBoxProps { 
  allTags: Tag[]; // Use AllTags type for all available tags 
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void; // Callback to handle tag selection changes
} 

const OptionBox = ({ allTags, selectedTags, onChange }: OptionBoxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Improved toggle function
  const toggleTag = useCallback((tag: Tag) => { 
    const isSelected = selectedTags.some(selected => selected.name === tag.name); 
    const newSelectedTags = isSelected
      ? selectedTags.filter(selected => selected.name !== tag.name) // Remove tag if already selected
      : [...selectedTags, tag]; // Add tag if not selected 
    // Keep popover open
    setOpen(true);
    onChange(newSelectedTags); // Call onChange with the updated tags 

  }, [selectedTags, onChange]);

  // Filter tags based on search
  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTags.length > 0
              ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
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
            {filteredTags.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No tags found</p>
            ) : (
              filteredTags.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => toggleTag(tag)}
                >
                  <span>{tag.name}</span>
                  {selectedTags.includes(tag) && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
                <Badge key={tag.name} variant="secondary" className="hover:bg-zinc-600 gap-1" onClick={() => toggleTag(tag)}>
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
};

export default OptionBox;