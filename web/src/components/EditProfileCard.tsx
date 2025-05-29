import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  EditProfile,
  EditProfileGroup,
  EditProfileField,
  EditProfileInput,
  EditProfileTextarea,
  EditProfileActions,
};