// ============================================================
// LET REVIEWER — GLOBAL TYPES
// ============================================================

export type ExamType = 'elementary' | 'secondary' | 'both'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ExamMode = 'quick' | 'timed' | 'mock' | 'survival' | 'daily' | 'mastery'
export type SubscriptionPlan = 'weekly' | 'monthly'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'

export interface Choice {
  key: string
  text: string
}

export interface Question {
  id: string
  subject: string
  topic: string
  subtopic?: string
  difficulty: Difficulty
  question_text: string
  choices: Choice[]
  correct_answer: string
  explanation?: string
  image_url?: string
  tags?: string[]
  exam_type: ExamType
  is_active: boolean
  reported_count: number
  created_at: string
}

export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  exam_type: ExamType
  major?: string
  target_exam_date?: string
  is_premium: boolean
  is_admin: boolean
  onboarding_done: boolean
  created_at: string
}

export interface Attempt {
  id: string
  user_id: string
  question_id: string
  selected_answer: string
  is_correct: boolean
  time_spent_ms?: number
  session_id?: string
  created_at: string
}

export interface ExamSession {
  id: string
  user_id: string
  mode: ExamMode
  subject?: string
  topic?: string
  score: number
  total_questions: number
  percentage?: number
  passed?: boolean
  time_taken_ms?: number
  question_ids?: string[]
  answers?: Record<string, string>
  started_at: string
  completed_at?: string
  is_completed: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  note?: string
  created_at: string
  question?: Question
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date?: string
  total_study_days: number
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  amount: number
  starts_at?: string
  ends_at?: string
  created_at: string
}

export interface DailyChallenge {
  id: string
  challenge_date: string
  question_ids: string[]
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  week_start: string
  total_questions: number
  correct_answers: number
  accuracy: number
  streak: number
  points: number
  rank?: number
  profile?: Pick<Profile, 'full_name' | 'avatar_url' | 'exam_type'>
}

// ── Analytics ────────────────────────────────────────────────

export interface SubjectStats {
  subject: string
  total: number
  correct: number
  accuracy: number
}

export interface UserAnalytics {
  total_attempts: number
  total_correct: number
  overall_accuracy: number
  study_hours: number
  subject_stats: SubjectStats[]
  strongest_subject?: string
  weakest_subject?: string
  readiness_percent: number
  sessions_completed: number
  average_score: number
}

// ── Exam Engine ───────────────────────────────────────────────

export interface ExamState {
  sessionId: string
  mode: ExamMode
  questions: Question[]
  currentIndex: number
  answers: Record<string, string>
  startTime: number
  timeLimit?: number // seconds
  isFinished: boolean
  showExplanation: boolean
  lives?: number // for survival mode
}

export interface ExamResult {
  session: ExamSession
  questions: Question[]
  answers: Record<string, string>
  score: number
  total: number
  percentage: number
  passed: boolean
  timeTaken: number
  subjectBreakdown: SubjectStats[]
}

// ── Subjects / Topics ─────────────────────────────────────────

export const SUBJECTS = {
  elementary: {
    'General Education': ['English', 'Filipino', 'Mathematics', 'Science', 'Social Science', 'ICT'],
    'Professional Education': [
      'Teaching Profession',
      'Curriculum Development',
      'Assessment',
      'Classroom Management',
      'Educational Psychology',
      'Teaching Strategies',
    ],
  },
  secondary: {
    'Professional Education': [
      'Teaching Profession',
      'Curriculum Development',
      'Assessment',
      'Classroom Management',
      'Educational Psychology',
      'Teaching Strategies',
    ],
    Majors: [
      'English',
      'Filipino',
      'Mathematics',
      'Science - Biological',
      'Science - Physical',
      'Social Studies',
      'MAPEH',
      'TLE',
      'Values Education',
      'ICT',
      'Agriculture',
      'Physics',
      'Chemistry',
    ],
  },
} as const

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard (Topnotcher)',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  hard: 'text-red-600 bg-red-50',
}

export const PASSING_SCORE = 75 // LET passing percentage
