'use client'

import Link from 'next/link'
import { Trophy, RefreshCw, Home, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import type { Question, ExamMode } from '@/types'
import { formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import AdBanner from '@/components/shared/AdBanner'

interface ExamResultsProps {
  score: number
  total: number
  mode: ExamMode
  timeTaken?: number // seconds
  onRetry?: () => void
  questions: Question[]
  answers: Record<string, string>
}

export default function ExamResults({
  score,
  total,
  mode,
  timeTaken,
  onRetry,
  questions,
  answers,
}: ExamResultsProps) {
  const percentage = total > 0 ? (score / total) * 100 : 0
  const passed = percentage >= 75

  const modeLabels: Record<ExamMode, string> = {
    quick: 'Quick Review',
    timed: 'Timed Exam',
    mock: 'Mock Board Exam',
    survival: 'Survival Mode',
    daily: 'Daily Challenge',
    mastery: 'Topic Mastery',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Result card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center mb-6">
        {/* Score circle */}
        <div className={cn(
          'w-28 h-28 rounded-full flex flex-col items-center justify-center mx-auto mb-6 border-4',
          passed
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-red-400 bg-red-50'
        )}>
          <span className={cn(
            'text-3xl font-black',
            passed ? 'text-emerald-600' : 'text-red-500'
          )}>
            {Math.round(percentage)}%
          </span>
          {passed
            ? <CheckCircle className="w-5 h-5 text-emerald-500 mt-1" />
            : <XCircle className="w-5 h-5 text-red-400 mt-1" />
          }
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {passed ? 'You Passed!' : 'Keep Practicing!'}
        </h1>
        <p className="text-slate-500 mb-6">
          {modeLabels[mode]} • {score}/{total} correct
          {timeTaken && ` • ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`}
        </p>

        {passed ? (
          <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">
              {percentage >= 90 ? 'Topnotcher performance!' : percentage >= 80 ? 'Excellent work!' : 'You cleared the passing mark!'}
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl mb-6 text-sm">
            You need {formatPercent(75, 0)} to pass. You were {formatPercent(75 - percentage, 1)} away.
            Focus on your weak topics and try again!
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Correct', value: score, color: 'text-emerald-600' },
            { label: 'Wrong', value: total - score, color: 'text-red-500' },
            { label: 'Accuracy', value: `${Math.round(percentage)}%`, color: passed ? 'text-emerald-600' : 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/analytics"
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            View Analytics
          </Link>
        </div>
      </div>

      {/* Question review */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-4">Answer Review</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct_answer
            return (
              <div key={q.id} className={cn(
                'flex items-start gap-3 p-3 rounded-xl',
                isCorrect ? 'bg-emerald-50' : 'bg-red-50'
              )}>
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                  isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                )}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 line-clamp-2">{q.question_text}</p>
                  <p className={cn('text-xs mt-1', isCorrect ? 'text-emerald-600' : 'text-red-600')}>
                    {isCorrect
                      ? `✓ ${q.choices.find((c) => c.key === q.correct_answer)?.text}`
                      : `✗ You: ${userAnswer ?? 'No answer'} | Correct: ${q.correct_answer}`
                    }
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Ad after results */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''}
        className="mt-6"
      />
    </div>
  )
}
