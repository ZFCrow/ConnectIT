import type { QuizAttempt } from "@/type/QuizAttempt";
export const mockRecentQuizAttempts: QuizAttempt[] = [
  { id: 1, userId: 1, quizTitle: "JavaScript Fundamentals",    date: "2025-05-27", score: 85    },
  { id: 2, userId: 1, quizTitle: "React State Management",     date: "2025-05-25", score: 7  },
  { id: 3, userId: 2, quizTitle: "Secure Coding Practices",    date: "2025-05-22", score: 90},
  { id: 4, userId: 3, quizTitle: "OWASP Threat Modeling MCQs", date: "2025-05-20", score: 6  },
];
