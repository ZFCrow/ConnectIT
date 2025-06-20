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

type EditableAvatarProps = {
  imageUrl?: string;
  fallbackText?: string;
  onFileSelect?: (file: File) => void;
};

const EditableAvatar = ({ imageUrl, fallbackText = "?", onFileSelect }: EditableAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageUrl);
  const cacheBustedUrl = `${previewUrl}?t=${Date.now()}`

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
      if (onFileSelect) onFileSelect(file);  // <-- pass file to parent
    }
  };

  return (
    <div className="flex justify-center relative -mt-10 mb-4">
      <div
        onClick={handleClick}
        className="cursor-pointer w-28 h-28 rounded-full border-4 border-background bg-muted shadow-md overflow-hidden relative"
      >
        <Avatar className="w-full h-full">
          <AvatarImage src={cacheBustedUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackText}`} alt="Profile" />
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
  EditProfile,
  EditProfileGroup,
  EditProfileField,
  EditProfileInput,
  EditProfileTextarea,
  EditProfileActions,
};