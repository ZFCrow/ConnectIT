
import type { PostProps } from "../Postcard";


export const mockPosts: PostProps[] = [
  {
    user: "CareerCounselor",
    date: "2025-05-20",
    labels: [
      { name: "career", color: "blue" },
      { name: "advice", color: "purple" }
    ],
    title: "Tech vs Finance: Which path suits me?",
    content:
      "I’m torn between going into software engineering or investment banking. Anyone here made the jump from one to the other? What pros/cons should I watch out for?",
    comments: []
  },
  {
    user: "StudentExplorer",
    date: "2025-05-18",
    labels: [
      { name: "internship", color: "gray" },
      { name: "student", color: "gray" },
      { name: "advice", color: "purple" }
    ],
    title: "Landing my first dev internship—tips?",
    content:
      "I’ve applied to 15 places and only got 1 interview. How can I stand out on my resume and portfolio as a second-year CS student?",
    comments: []
  },
  {
    user: "JoblessJoe",
    date: "2025-05-17",
    labels: [
      { name: "job-search", color: "red" },
      { name: "mental-health", color: "pink" }
    ],
    title: "Can’t find work after graduation 😞",
    content:
      "It’s been 4 months since I graduated and zero callbacks. I feel worthless, and some days I don’t know why I even get up.",
    comments: []
  },
  {
    user: "HopefulGrad",
    date: "2025-05-15",
    labels: [
      { name: "career", color: "blue" },
      { name: "resume", color: "gray" }
    ],
    title: "Resume review request",
    content:
      "Would anyone mind taking a quick look at my resume? I’m targeting junior frontend roles—what keywords or projects catch a recruiter’s eye?",
    comments: [
      { user: "TechGuru", content: "dm me" },
      { user: "ResumeNinja", content: "I can help!" }
    ]
  },
  {
    user: "BurntOutDev",
    date: "2025-05-14",
    labels: [
      { name: "career", color: "blue" },
      { name: "mental-health", color: "pink" }
    ],
    title: "Thinking of quitting coding altogether",
    content:
      "After 5 years in web dev, I’m exhausted and burned out. Has anyone successfully pivoted to a non-tech role? How’d you manage the transition?",
    comments: []
  },
  {
    user: "DreamJobSeeker",
    date: "2025-05-12",
    labels: [
      { name: "job-search", color: "red" },
      { name: "remote", color: "gray" }
    ],
    title: "Where to find remote developer gigs?",
    content:
      "I’m looking for fully remote contracts—any platforms or communities you swear by (besides Upwork and LinkedIn)?",
    comments: []
  },
  {
    user: "MidlifeCoder",
    date: "2025-05-10",
    labels: [
      { name: "career", color: "blue" },
      { name: "advice", color: "purple" }
    ],
    title: "Re-entering the workforce after a 10-year gap",
    content:
      "I left tech in 2013 to raise my family and now want back in. What’s the best way to upskill and convince employers I’m ready?",
    comments: []
  },
  {
    user: "DepressedAmy",
    date: "2025-05-08",
    labels: [
      { name: "job-search", color: "red" },
      { name: "depression", color: "gray" }
    ],
    title: "No interviews after 50 applications",
    content:
      "I’ve sent out resume after resume and nothing. I’m running out of hope—what else can I do before giving up?",
    comments: []
  },
  {
    user: "MotivationDad",
    date: "2025-05-05",
    labels: [
      { name: "career", color: "blue" },
      { name: "work-life", color: "gray" }
    ],
    title: "Balancing parenting with job hunt",
    content:
      "I have two toddlers and barely any time to network or prep for interviews. How do other parents keep the job search going without burning out?",
    comments: []
  },
  {
    user: "TechNewbie",
    date: "2025-05-02",
    labels: [
      { name: "learning", color: "lime" },
      { name: "advice", color: "purple" }
    ],
    title: "Best free resources to learn coding?",
    content:
      "I want to switch careers but can’t afford paid courses right now. Which YouTube channels or free MOOCs actually got you hired?",
    comments: []
  }
];
