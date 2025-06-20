import type { Post } from "@/type/Post";

export const mockPosts: Post[] = [
  {
    accountId: 1,
    id: 1,
    user: "CareerCounselor",
    date: "2025-05-20",
    labels: [
      { labelId: 1, name: "career", color: "blue" },
      { labelId: 2, name: "advice", color: "purple" }
    ],
    title: "Tech vs Finance: Which path suits me?",
    content:
      "I’m torn between going into software engineering or investment banking. Anyone here made the jump from one to the other? What pros/cons should I watch out for?",
    comments: [
      {
        commentId: 1,
        accountId: 1,
        username: "FinancePro",
        displayPicUrl: "",
        content:
          "I moved from tech to finance last year. The work-life balance shifted a lot—more long hours in banking, but you learn a ton about financial modeling."
      },
      {
        commentId: 2,
        accountId: 12,
        username: "EngToBanker",
        displayPicUrl: "",
        content:
          "I did the reverse: finance into tech. The analytical skills helped, but you’ll need to brush up on coding if you go into software engineering."
      }
    ],
    likes: 8,
    liked: false
  },
  {
    accountId: 2,
    id: 2,
    user: "StudentExplorer",
    date: "2025-05-18",
    labels: [
      { labelId: 3, name: "internship", color: "gray" },
      { labelId: 4, name: "student", color: "gray" },
      { labelId: 2, name: "advice", color: "purple" }
    ],
    title: "Landing my first dev internship—tips?",
    content:
      "I’ve applied to 15 places and only got 1 interview. How can I stand out on my resume and portfolio as a second-year CS student?",
    comments: [
      {
        commentId: 3,
        accountId: 13,
        username: "ResumeGuru",
        displayPicUrl: "",
        content:
          "Highlight any open-source contributions or personal projects on GitHub. Recruiters love to see code you’ve actually written."
      },
      {
        commentId: 4,
        accountId: 14,
        username: "InternAlum",
        displayPicUrl: "",
        content:
          "Tailor your resume to each position. Use keywords from the job description—ATS filters matter more than you think."
      }
    ],
    likes: 5,
    liked: false
  },
  {
    accountId: 3,
    id: 3,
    user: "JoblessJoe",
    date: "2025-05-17",
    labels: [
      { labelId: 5, name: "job-search", color: "red" },
      { labelId: 6, name: "mental-health", color: "pink" },
      { labelId: 1, name: "career", color: "blue" }
    ],
    title: "Can’t find work after graduation 😞",
    content:
      "It’s been 4 months since I graduated and zero callbacks. I feel worthless, and some days I don’t know why I even get up.",
    comments: [
      {
        commentId: 5,
        accountId: 15,
        username: "SupportivePeer",
        displayPicUrl: "",
        content:
          "Hang in there! It took me 3 months to land something. Consider doing small freelance gigs or volunteering to build experience."
      },
      {
        commentId: 6,
        accountId: 16,
        username: "CareerCoach",
        displayPicUrl: "",
        content:
          "Your mental health is important. Maybe schedule a mock interview with a friend or career center to boost confidence and technique."
      }
    ],
    likes: 2,
    liked: false
  },
  {
    accountId: 4,
    id: 4,
    user: "HopefulGrad",
    date: "2025-05-15",
    labels: [
      { labelId: 1, name: "career", color: "blue" },
      { labelId: 7, name: "resume", color: "gray" }
    ],
    title: "Resume review request",
    content:
      "Would anyone mind taking a quick look at my resume? I’m targeting junior frontend roles—what keywords or projects catch a recruiter’s eye?",
    comments: [
      {
        commentId: 7,
        accountId: 17,
        username: "TechGuru",
        displayPicUrl: "",
        content: "DM me"
      },
      {
        commentId: 8,
        accountId: 18,
        username: "ResumeNinja",
        displayPicUrl: "",
        content: "I can help!"
      },
      {
        commentId: 9,
        accountId: 19,
        username: "FrontendFan",
        displayPicUrl: "",
        content:
          "Make sure you mention React, Tailwind CSS, and any live demos. Recruiters love to see deployed projects—link to your portfolio."
      }
    ],
    likes: 12,
    liked: false
  },
  {
    accountId: 5,
    id: 5,
    user: "BurntOutDev",
    date: "2025-05-14",
    labels: [
      { labelId: 1, name: "career", color: "blue" },
      { labelId: 6, name: "mental-health", color: "pink" }
    ],
    title: "Thinking of quitting coding altogether",
    content:
      "After 5 years in web dev, I’m exhausted and burned out. Has anyone successfully pivoted to a non-tech role? How’d you manage the transition?",
    comments: [
      {
        commentId: 10,
        accountId: 20,
        username: "ExDevNowPM",
        displayPicUrl: "",
        content:
          "I transitioned to product management last year. Focus on transferable skills like stakeholder communication and project planning."
      },
      {
        commentId: 11,
        accountId: 21,
        username: "CounselorKate",
        displayPicUrl: "",
        content:
          "Burnout is real—sometimes a short sabbatical or a part-time role can help rekindle passion before a full pivot."
      }
    ],
    likes: 6,
    liked: false
  },
  {
    accountId: 6,
    id: 6,
    user: "DreamJobSeeker",
    date: "2025-05-12",
    labels: [
      { labelId: 5, name: "job-search", color: "red" },
      { labelId: 8, name: "remote", color: "gray" }
    ],
    title: "Where to find remote developer gigs?",
    content:
      "I’m looking for fully remote contracts—any platforms or communities you swear by (besides Upwork and LinkedIn)?",
    comments: [
      {
        commentId: 12,
        accountId: 22,
        username: "RemoteExpert",
        displayPicUrl: "",
        content:
          "Check out Toptal and RemoteOK. Also, GitHub Discussions often has leads for short-term freelance gigs."
      },
      {
        commentId: 13,
        accountId: 23,
        username: "DevNomad",
        displayPicUrl: "",
        content:
          "I’ve had luck with AngelList and We Work Remotely. Don’t sleep on niche Slack communities for specific tech stacks."
      }
    ],
    likes: 4,
    liked: false
  },
  {
    accountId: 7,
    id: 7,
    user: "MidlifeCoder",
    date: "2025-05-10",
    labels: [
      { labelId: 1, name: "career", color: "blue" },
      { labelId: 2, name: "advice", color: "purple" }
    ],
    title: "Re-entering the workforce after a 10-year gap",
    content:
      "I left tech in 2013 to raise my family and now want back in. What’s the best way to upskill and convince employers I’m ready?",
    comments: [
      {
        commentId: 14,
        accountId: 24,
        username: "CareerPivot",
        displayPicUrl: "",
        content:
          "Consider building a small portfolio of updated projects—maybe a full-stack CRUD app using modern frameworks to show you’re current."
      },
      {
        commentId: 15,
        accountId: 25,
        username: "HiringManager",
        displayPicUrl: "",
        content:
          "Be honest about your gap but emphasize volunteer work or courses taken. Many companies appreciate transferable skills and fresh perspectives."
      }
    ],
    likes: 7,
    liked: false
  },
  {
    accountId: 8,
    id: 8,
    user: "DepressedAmy",
    date: "2025-05-08",
    labels: [
      { labelId: 5, name: "job-search", color: "red" },
      { labelId: 9, name: "depression", color: "gray" }
    ],
    title: "No interviews after 50 applications",
    content:
      "I’ve sent out resume after resume and nothing. I’m running out of hope—what else can I do before giving up?",
    comments: [
      {
        commentId: 16,
        accountId: 26,
        username: "MotivationCoach",
        displayPicUrl: "",
        content:
          "Try networking events or local meetups—even a brief conversation can lead to referrals. Keep your head up; persistence pays off."
      },
      {
        commentId: 17,
        accountId: 27,
        username: "RecruiterJane",
        displayPicUrl: "",
        content:
          "Make sure your resume is tailored to each application. Generic resumes often get passed over by ATS or hiring managers."
      }
    ],
    likes: 1,
    liked: false
  },
  {
    accountId: 9,
    id: 9,
    user: "MotivationDad",
    date: "2025-05-05",
    labels: [
      { labelId: 1, name: "career", color: "blue" },
      { labelId: 10, name: "work-life", color: "gray" }
    ],
    title: "Balancing parenting with job hunt",
    content:
      "I have two toddlers and barely any time to network or prep for interviews. How do other parents keep the job search going without burning out?",
    comments: [
      {
        commentId: 18,
        accountId: 28,
        username: "BusyMomDev",
        displayPicUrl: "",
        content:
          "I carve out 30 minutes each morning before the kids wake up to apply for jobs. Even small, consistent efforts add up over time."
      },
      {
        commentId: 19,
        accountId: 29,
        username: "TimeMgmtCoach",
        displayPicUrl: "",
        content:
          "Use job alerts to automate part of the search and set realistic daily limits. Schedule interview prep in small, feasible blocks."
      }
    ],
    likes: 3,
    liked: false
  },
  {
    accountId: 10,
    id: 10,
    user: "TechNewbie",
    date: "2025-05-02",
    labels: [
      { labelId: 11, name: "learning", color: "lime" },
      { labelId: 2, name: "advice", color: "purple" }
    ],
    title: "Best free resources to learn coding?",
    content:
      "I want to switch careers but can’t afford paid courses right now. Which YouTube channels or free MOOCs actually got you hired?",
    comments: [
      {
        commentId: 20,
        accountId: 30,
        username: "FreeCodeFan",
        displayPicUrl: "",
        content:
          "freeCodeCamp.org is great for full-stack basics. Also check out CS50 on edX—it’s rigorous and well recognized by employers."
      },
      {
        commentId: 21,
        accountId: 31,
        username: "YouTubeTeacher",
        displayPicUrl: "",
        content:
          "Traversy Media and The Net Ninja have excellent playlists. Follow along by building real projects, not just watching."
      }
    ],
    likes: 9,
    liked: false
  }
];
