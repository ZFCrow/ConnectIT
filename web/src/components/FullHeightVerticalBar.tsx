import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedProgressBar from "./AnimatedProgressBar";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Mock data imports
//user side
import type { AppliedJob } from "@/type/AppliedJob";
import { mockAppliedJobs } from "@/components/FakeData/MockAppliedJobs";
import type { RecentPostLike } from "@/type/RecentPostLikes";
import { mockRecentPostsLikes } from "@/components/FakeData/MockRecentPostsLikes";

// company side
import type { JobListing } from "@/type/jobListing";
import { sampleJobs } from "@/components/FakeData/sampleJobs";

import { Role, useAuth } from "@/contexts/AuthContext";
import { usePostContext } from "@/contexts/PostContext";



const FullHeightVerticalBar = () => {
  const { accountId, role, userId, companyId } = useAuth();

  // users
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  //const [recentPosts, setRecentPosts] = useState<RecentPostLike[]>([]); 
  const {recentlyInteractedPost} = usePostContext();


  // companies
  const [myJobs, setMyJobs] = useState<JobListing[]>([]);
  // const [incomingApps, setIncomingApps] = useState<Application[]>([])

  // // admins
  // const [allUsers, setAllUsers] = useState<User[]>([])
  // const [siteStats, setSiteStats] = useState<Stats[]>([])

  const navigate = useNavigate();



  


  useEffect(() => {
    if (role === Role.User) {
      // Fetch applied jobs for the user
      const userAppliedJobs = mockAppliedJobs.filter(
        (job) => job.userId === userId
      );
      setAppliedJobs(userAppliedJobs);

      // Fetch recent posts liked by the user
      // const userRecentPosts = mockRecentPostsLikes.filter(
      //   (post) => post.accountId === accountId
      // );
      // setRecentPosts(userRecentPosts);
    } else if (role === Role.Company) {
      // Fetch jobs posted by the company
      const companyJobs = sampleJobs.filter(
        (job) => job.companyId === companyId
      );
      setMyJobs(companyJobs);

      // Fetch recent posts liked by the user (this needs to be accountID)
      // const companyRecentPosts = mockRecentPostsLikes.filter(
      //   (post) => post.accountId === companyId
      // );
      // setRecentPosts(companyRecentPosts);

      // Fetch incoming applications for the company
      // const companyApps = mockAppliedJobs.filter((app) => app.companyId === userIdNum);
      // setIncomingApps(companyApps);
    }
    // else if (role === "admin") {
    //     // Fetch all users
    //     setAllUsers(mockRecentPostsLikes.map(post => ({ id: post.userId, name: post.user })));

    //     // Fetch site statistics
    //     setSiteStats([
    //         { name: "Total Users", value: 1000 },
    //         { name: "Total Posts", value: 500 },
    //         { name: "Total Jobs", value: 200 },
    //     ]);
    // }
  }, [role, userId, accountId, companyId]);

  const [openSections, setOpenSections] = useState<string[]>([]);

  const handleAccordionChange = (values: string[]) => {
    setOpenSections(values);
  };

  return (
    // <ScrollArea className="h-screen p-4">
    <Accordion
      type="multiple"
      className="space-y-4"
      value={openSections}
      onValueChange={handleAccordionChange}
    >
      {role === Role.User && (
        <>
          <AccordionItem value="applied">
            <AccordionTrigger>📄 Recently Applied Job</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm">
                {appliedJobs.map((job) => (
                  <Card
                    key={job.jobId}
                    className="hover:bg-muted transition cursor-pointer"
                    onClick={() => navigate(`/jobDetails/${job.jobId}`)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {job.companyName}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* <AccordionItem value="posts">
                                <AccordionTrigger>👍 Recent Interactions</AccordionTrigger>
                                <AccordionContent>
                                <ul className="space-y-2 text-sm">
                                    {recentPosts.map((post) => (
                                    <Card key={post.postId} 
                                            className="hover:bg-muted transition cursor-pointer" 
                                            onClick={() => navigate(`/post/${post.postId}`)}>
                                        <CardContent className="p-3">
                                        <div className="font-medium">{post.title}</div>
                                        <div className="text-muted-foreground text-xs mt-1">
                                            Click to view post
                                        </div>
                                        </CardContent>
                                    </Card>
                                    ))}
                                </ul>
                                </AccordionContent>
                            </AccordionItem> */}
        </>
      )}

      {/* Recent Interactions – users & companies */}
      {(role === Role.User || role === Role.Company) && (
        <AccordionItem value="posts">
          <AccordionTrigger>👍 Recent Interactions</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">

              {
                recentlyInteractedPost? (recentlyInteractedPost.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:bg-muted cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        Click to view post
                      </div>
                    </CardContent>
                  </Card>
                ))) : (<div>No recent interactions</div>)
              }

            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {role === Role.Company && (
        <AccordionItem value="myJobs">
          <AccordionTrigger>📋 My Posted Jobs</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-sm">
              {myJobs.map((job) => (
                <Card
                  key={job.jobId}
                  className="hover:bg-muted transition cursor-pointer"
                  onClick={() => navigate(`/jobDetails/${job.jobId}`)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {job.companyName}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
};

export default FullHeightVerticalBar;
