import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { 
    Card,
    CardContent,
} from "@/components/ui/card"
import AnimatedProgressBar from "./AnimatedProgressBar";
import type { FC } from "react"; 
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react"; 

// Mock data imports
//user side
import type { AppliedJob } from "@/type/AppliedJob";
import { mockAppliedJobs } from "@/components/FakeData/MockAppliedJobs";
import type { QuizAttempt } from "@/type/QuizAttempt";
import { mockRecentQuizAttempts } from "@/components/FakeData/MockRecentQuizAttempts";
import type { RecentPostLike } from "@/type/RecentPostLikes";
import { mockRecentPostsLikes } from "@/components/FakeData/MockRecentPostsLikes";

// company side
import type { JobListing } from "@/type/jobListing";
import { sampleJobs } from "@/components/FakeData/sampleJobs"



export interface FullHeightVerticalBarProps {
    accountID : number; 
}


const FullHeightVerticalBar: FC<FullHeightVerticalBarProps> = (
    { accountID} 
) => {
    // depends on the context , this is either a userID or companyID  
    const userIdNum = Number(accountID); 

    // const accountID 
    const accountIDNum = 3;

    // accountID gives me the role and  userID/companyID depending on the context 
    const role = 0 || "company"

    // users 
    const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([])
    const [recentQuizzes, setRecentQuizzes] = useState<QuizAttempt[]>([])
    const [recentPosts, setRecentPosts] = useState<RecentPostLike[]>([])

    // companies 
    const [myJobs, setMyJobs] = useState<JobListing[]>([])
    // const [incomingApps, setIncomingApps] = useState<Application[]>([])

    // // admins 
    // const [allUsers, setAllUsers] = useState<User[]>([])
    // const [siteStats, setSiteStats] = useState<Stats[]>([])

    const navigate = useNavigate()


    // const appliedJobs = mockAppliedJobs.filter((job) => job.userId === userIdNum);
    // const recentQuizAttempts = mockRecentQuizAttempts.filter((quiz) => quiz.userId === userIdNum);
    // const recentPosts = mockRecentPostsLikes.filter((post) => post.userId === userIdNum);

    // const navigate = useNavigate(); 

    useEffect(() => {
        if (role === "user"){
            // Fetch applied jobs for the user
            const userAppliedJobs = mockAppliedJobs.filter((job) => job.userId === userIdNum);
            setAppliedJobs(userAppliedJobs);

            // Fetch recent quiz attempts for the user
            const userRecentQuizzes = mockRecentQuizAttempts.filter((quiz) => quiz.userId === userIdNum);
            setRecentQuizzes(userRecentQuizzes);

            // Fetch recent posts liked by the user
            const userRecentPosts = mockRecentPostsLikes.filter((post) => post.accountId === accountIDNum);
            setRecentPosts(userRecentPosts);
        }
        else if (role === "company") {
            // Fetch jobs posted by the company
            const companyJobs = sampleJobs.filter((job) => job.companyId === userIdNum);
            setMyJobs(companyJobs);

            // Fetch recent posts liked by the user (this needs to be accountID)
            const companyRecentPosts = mockRecentPostsLikes.filter((post) => post.accountId === accountIDNum);
            setRecentPosts(companyRecentPosts);


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
    },[role, userIdNum, accountIDNum]); 

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
                {
                    role === "user" && (
                        <>
                            <AccordionItem value="applied">
                                <AccordionTrigger>📄 Recently Applied Job</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2 text-sm">
                                        {appliedJobs.map( (job) => (
                                            <Card key={job.jobId} 
                                                className="hover:bg-muted transition cursor-pointer" 
                                                onClick={() => navigate(`/jobDetails/${job.jobId}`)}>
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

                            <AccordionItem value="quizzes">
                                <AccordionTrigger>💬 Recent Quiz</AccordionTrigger>
                                <AccordionContent>
                                <ul className="space-y-2 text-sm">
                                    {recentQuizzes.map((quiz) => (
                                    <Card key={quiz.id} className="shadow-sm border">
                                        <CardContent className="p-3">
                                        <div className="font-semibold">{quiz.quizTitle}</div>
                                        <div className="text-muted-foreground text-sm truncate">
                                            {quiz.date}
                                        </div>

                                        <AnimatedProgressBar
                                            target={quiz.score}
                                            isOpen={openSections.includes("quizzes")}
                                        />
                                                
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
                    )
                }


                {/* Recent Interactions – users & companies */}
                {(role === "user" || role === "company") && (
                    <AccordionItem value="posts">
                    <AccordionTrigger>👍 Recent Interactions</AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-2 text-sm">
                        {recentPosts.map((post) => (
                            <Card
                            key={post.postId}
                            className="hover:bg-muted cursor-pointer"
                            onClick={() => navigate(`/post/${post.postId}`)}
                            >
                            <CardContent className="p-3">
                                <div className="font-medium">{post.title}</div>
                            </CardContent>
                            </Card>
                        ))}
                        </ul>
                    </AccordionContent>
                    </AccordionItem>
                )}
                {
                    role === "company" && (
                        <AccordionItem value="myJobs">
                            <AccordionTrigger>📋 My Posted Jobs</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 text-sm">
                                    {myJobs.map((job) => (
                                        <Card key={job.jobId} 
                                            className="hover:bg-muted transition cursor-pointer" 
                                            onClick={() => navigate(`/jobDetails/${job.jobId}`)}>
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
                    )
                }
            </Accordion>
                    )
                }
                

export default FullHeightVerticalBar; 