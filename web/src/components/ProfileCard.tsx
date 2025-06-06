import * as React from "react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import {
  Briefcase,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { JobListing } from "@/type/jobListing";
import { dateLocale, dateFormatOptions } from "@/components/JobOpportunity/SharedConfig";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { FC } from "react";

import type { Post } from "@/type/Post";

type ProfileAvatarProps = {
  src?: string;
  fallbackText: string;
};

const Profile = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="profile"
    className={cn("grid grid-cols-10 gap-6 items-start", className)}
    {...props}
  />
);

const ProfileAvatar = ({ src, fallbackText }: ProfileAvatarProps) => {
  return (
    <div className="w-full flex justify-center relative -mt-14 mb-2">
      <div className="w-24 h-24 rounded-full border-4 border-background bg-muted shadow-md overflow-hidden">
        <Avatar className="w-full h-full">
          <AvatarImage src={src} alt="User profile" />
          <AvatarFallback>{fallbackText}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

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
    className={cn("text-xl font-bold mb-6", className)}
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

type Props = { job: JobListing };

const ProfileJobCard: React.FC<Props> = ({ job }) => {
  const posted = new Date(job.createdAt).toLocaleDateString(dateLocale, dateFormatOptions);

  return (
    <div className="border border-zinc-700 bg-zinc-900 p-4 rounded-xl space-y-2 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
        <span className="text-xs text-gray-400">{posted}</span>
      </div>
      <div className="text-sm text-gray-300 space-y-1">
        <div>{job.companyName}</div>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-gray-400" />
            {job.type}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-400" />
            ${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            Deadline: {new Date(job.applicationDeadline).toLocaleDateString(dateLocale, dateFormatOptions)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <Link
          to={`/jobDetails/${job.jobId}`}
          className="text-blue-500 hover:underline text-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
};

const ProfilePostCard: FC<Post> = ({ id, user, date, title, content }) => {
  return (
    <Card className="hover:!shadow-lg cursor-pointer transition-shadow duration-200 ease-in-out hover:bg-muted">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt={user} />
            <AvatarFallback>{user[0]}</AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-base font-semibold leading-tight">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{date}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed line-clamp-3">{content}</p>
      </CardContent>
    </Card>
  );
};

export {
  Profile,
  ProfileAvatar,
  ProfileCardLeft,
  ProfileCardRight,
  ProfileTitle,
  ProfileLabel,
  ProfileValue,
  ProfileField,
  ProfileAction,
  Tabs,
  TabPanel,
  ProfileJobCard,
  ProfilePostCard
};
