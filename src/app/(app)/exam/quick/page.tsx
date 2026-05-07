'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import QuestionCard from '@/components/exam/QuestionCard'
import RewardedAdGate from '@/components/shared/RewardedAdGate'
import AdBanner from '@/components/shared/AdBanner'
import ExamResults from '@/components/exam/ExamResults'
import { shuffleArray } from '@/lib/utils'
import type { Question } from '@/types'
import { Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuickReviewPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionDone, setSessionDone] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [sessionId] = useState(() => crypto.randomUUID())
  const [isPremium, setIsPremium] = useState(false)
  const [questionsAnsweredTotal, setQuestionsAnsweredTotal] = useState(0)
  const supabase = createClient()

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check premium status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()
    setIsPremium(profile?.is_premium ?? false)

    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .limit(100)

    const shuffled = shuffleArray(data as Question[]).slice(0, 20)
    setQuestions(shuffled)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  async function handleAnswer(answer: string) {
    const question = questions[currentIndex]
    setSelectedAnswer(answer)
    setShowExplanation(true)
    const isCorrect = answer === question.correct_answer
    const newAnswers = { ...answers, [question.id]: answer }
    setAnswers(newAnswers)

    // Save attempt
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('attempts').insert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: answer,
        is_correct: isCorrect,
        session_id: sessionId,
      })
    }
  }

  async function handleNext() {
    const newTotal = questionsAnsweredTotal + 1
    setQuestionsAnsweredTotal(newTotal)

    if (currentIndex + 1 >= questions.length) {
      // Save session
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const correct = Object.entries(answers).filter(([qId, ans]) => {
          const q = questions.find((q) => q.id === qId)
          return q?.correct_answer === ans
        }).length
        const total = questions.length
        await supabase.from('exam_sessions').insert({
          user_id: user.id,
          mode: 'quick',
          score: correct,
          total_questions: total,
          percentage: (correct / total) * 100,
          passed: (correct / total) * 100 >= 75,
          question_ids: questions.map((q) => q.id),
          answers,
          is_completed: true,
          completed_at: new Date().toISOString(),
        })

        // Update streak
        await fetch('/api/streak', { method: 'POST' }).catch(() => {})
      }
      setSessionDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  async function toggleBookmark(questionId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (bookmarks.has(questionId)) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, question_id: questionId })
      setBookmarks((b) => { const s = new Set(b); s.delete(questionId); return s })
      toast.success('Bookmark removed')
    } else {
      await supabase.from('bookmarks').upsert({ user_id: user.id, question_id: questionId })
      setBookmarks((b) => new Set([...b, questionId]))
      toast.success('Question bookmarked!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading questions…</p>
        </div>
      </div>
    )
  }

  if (sessionDone) {
    const correct = Object.entries(answers).filter(([qId, ans]) => {
      const q = questions.find((q) => q.id === qId)
      return q?.correct_answer === ans
    }).length
    return (
      <ExamResults
        score={correct}
        total={questions.length}
        mode="quick"
        onRetry={() => { setSessionDone(false); setCurrentIndex(0); setAnswers({}); setSelectedAnswer(null); loadQuestions() }}
        questions={questions}
        answers={answers}
      />
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-semibold text-slate-500">Quick Review</h1>
          <span className="text-sm text-slate-400">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Ad banner (top, only for free users) */}
      {!isPremium && (
        <AdBanner
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? ''}
          className="mb-6"
        />
      )}

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          showExplanation={showExplanation}
          onNext={handleNext}
          onBookmark={() => toggleBookmark(currentQuestion.id)}
          isBookmarked={bookmarks.has(currentQuestion.id)}
        />
      </div>

      {/* Rewarded ad gate every 5 questions */}
      <RewardedAdGate
        questionsAnswered={questionsAnsweredTotal}
        onUnlock={() => {}}
        isPremium={isPremium}
      />

      {/* New session button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => { loadQuestions(); setCurrentIndex(0); setAnswers({}); setSelectedAnswer(null); setSessionDone(false) }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 mx-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          New set of questions
        </button>
      </div>
    </div>
  )
}
