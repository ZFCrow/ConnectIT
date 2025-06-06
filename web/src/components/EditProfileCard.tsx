import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const EditProfileCard = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto bg-card text-card-foreground rounded-xl border p-6 shadow-md",
        className
      )}
      {...props}
    />
  );
};

interface EditableAvatarProps {
  imageUrl?: string;
  fallbackText?: string;
}

const EditableAvatar = ({ imageUrl, fallbackText = "?" }: EditableAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center relative -mt-10 mb-4">
      <div
        onClick={handleClick}
        className="cursor-pointer w-28 h-28 rounded-full border-4 border-background bg-muted shadow-md overflow-hidden relative"
      >
        <Avatar className="w-full h-full">
          <AvatarImage src={previewUrl || "/placeholder-user.png"} alt="Profile" />
          <AvatarFallback>{fallbackText}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
}

const PortfolioUpload = ({ name, label = "Upload File", accept = ".pdf" }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // You can send this file to backend or attach it to FormData here
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

const EditProfile = ({ className, ...props }: React.ComponentProps<"form">) => (
  <form
    data-slot="edit-profile"
    className={cn("space-y-6", className)}
    {...props}
  />
);

const EditProfileGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("grid grid-cols-1 gap-4", className)} {...props} />
);

const EditProfileField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-muted-foreground block">{label}</label>
    {children}
  </div>
);

const EditProfileInput = (props: React.ComponentProps<typeof Input>) => (
  <Input {...props} />
);

const EditProfileTextarea = (props: React.ComponentProps<typeof Textarea>) => (
  <Textarea className="min-h-[100px]" {...props} />
);

const EditProfileActions = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end gap-4 pt-4">{children}</div>
);

export {
  EditProfileCard,
  EditableAvatar,
  PortfolioUpload,
  EditProfile,
  EditProfileGroup,
  EditProfileField,
  EditProfileInput,
  EditProfileTextarea,
  EditProfileActions,
};