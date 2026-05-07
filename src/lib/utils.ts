import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatTimeMs(ms: number): string {
  return formatTime(Math.floor(ms / 1000))
}

export function getReadinessLabel(percent: number): { label: string; color: string } {
  if (percent >= 85) return { label: 'Exam Ready', color: 'text-emerald-600' }
  if (percent >= 75) return { label: 'Almost Ready', color: 'text-blue-600' }
  if (percent >= 60) return { label: 'Needs Practice', color: 'text-amber-600' }
  return { label: 'Keep Studying', color: 'text-red-600' }
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function calculateReadiness(
  accuracy: number,
  sessionsCompleted: number,
  streakDays: number,
  mockScores: number[]
): number {
  const accuracyWeight = accuracy * 0.5
  const consistencyWeight = Math.min(sessionsCompleted / 30, 1) * 20
  const streakWeight = Math.min(streakDays / 14, 1) * 10
  const mockWeight = mockScores.length > 0
    ? (mockScores.reduce((a, b) => a + b, 0) / mockScores.length) * 0.2
    : 0
  return Math.min(Math.round(accuracyWeight + consistencyWeight + streakWeight + mockWeight), 100)
}

export function getDaysUntilExam(targetDate: string | null): number | null {
  if (!targetDate) return null
  const today = new Date()
  const exam = new Date(targetDate)
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'Professional Education': 'bg-indigo-100 text-indigo-700',
    'General Education': 'bg-sky-100 text-sky-700',
    'Mathematics': 'bg-purple-100 text-purple-700',
    'English': 'bg-blue-100 text-blue-700',
    'Science': 'bg-emerald-100 text-emerald-700',
    'Filipino': 'bg-rose-100 text-rose-700',
    'Social Science': 'bg-amber-100 text-amber-700',
    'ICT': 'bg-cyan-100 text-cyan-700',
  }
  return colors[subject] ?? 'bg-slate-100 text-slate-700'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}
