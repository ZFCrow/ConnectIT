// src/types/quizAttempt.ts
export interface QuizAttempt {
  id:        number
  userId:    number
  quizTitle: string
  date:      string    // ISO date string
  score:     number
}
