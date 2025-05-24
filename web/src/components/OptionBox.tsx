import { useState, useCallback } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OptionBoxProps {
  allTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const OptionBox = ({ allTags, selectedTags, onChange }: OptionBoxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Improved toggle function
  const toggleTag = useCallback((tag: string) => {
    onChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
    // Keep popover open
    setOpen(true);
  }, [selectedTags, onChange]);

  // Filter tags based on search
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(search.toLowerCase())
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
                  key={tag}
                  className="flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => toggleTag(tag)}
                >
                  <span>{tag}</span>
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
                <Badge key={tag} variant="secondary" className="hover:bg-zinc-600 gap-1" onClick={() => toggleTag(tag)}>
                {tag}
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