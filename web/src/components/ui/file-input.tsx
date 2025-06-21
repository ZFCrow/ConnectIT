import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  onChange?: (file: File) => void; 
}

const PdfUpload = ({ name, label = "Upload File", accept = ".pdf", onChange }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (onChange) {
        onChange(file); 
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm">{label}</label>
      <div className="flex items-center gap-4">
        <Button type="button" variant="secondary" onClick={handleClick}>
          Upload a file
        </Button>
        <span className="text-sm text-muted-foreground">
          {fileName || "No file selected"}
        </span>
      </div>
      <input
        type="file"
        name={name}
        accept={accept}
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
      />
    </div>
  );
};

export default PdfUpload;