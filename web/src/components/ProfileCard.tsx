import * as React from "react"
import { cn } from "@/lib/utils"

const Profile = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="profile"
    className={cn("grid grid-cols-10 gap-6", className)}
    {...props}
  />
);

const ProfileCardLeft = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="profile-card-left"
    className={cn(
      "col-span-3 bg-background text-foreground rounded-xl border p-6 shadow-sm space-y-4",
      className
    )}
    {...props}
  />
);

const ProfileCardRight = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="profile-card-right"
    className={cn(
      "col-span-7 bg-background text-foreground rounded-xl border p-6 shadow-sm space-y-4",
      className
    )}
    {...props}
  />
);

const ProfileTitle = ({ className, ...props }: React.ComponentProps<"h2">) => (
  <h2
    data-slot="profile-title"
    className={cn("text-xl font-bold", className)}
    {...props}
  />
);

const ProfileLabel = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    className={cn("text-sm font-medium text-muted-foreground", className)}
    {...props}
  />
);

const ProfileValue = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span className={cn("text-base", className)} {...props} />
);

const ProfileField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <ProfileLabel>{label}</ProfileLabel>
    <ProfileValue>{value}</ProfileValue>
  </div>
);

const ProfileAction = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex justify-end pt-4", className)} {...props} />
);

const Tabs = ({ tabs, activeTab, setActiveTab }: { tabs: string[]; activeTab: string; setActiveTab: (tab: string) => void }) => (
  <div className="flex border-b gap-4">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={cn(
          "py-2 px-4 text-sm font-medium border-b-2",
          activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        {tab}
      </button>
    ))}
  </div>
);

const TabPanel = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => (
  <div className={cn(!isActive && "hidden")}>{children}</div>
);

export {
  Profile,
  ProfileCardLeft,
  ProfileCardRight,
  ProfileTitle,
  ProfileLabel,
  ProfileValue,
  ProfileField,
  ProfileAction,
  Tabs,
  TabPanel,
};
