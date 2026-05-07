'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import QuestionCard from '@/components/exam/QuestionCard'
import ExamResults from '@/components/exam/ExamResults'
import { shuffleArray, formatTime } from '@/lib/utils'
import type { Question } from '@/types'
import { Timer, AlertTriangle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const TOTAL_QUESTIONS = 100
const TIME_LIMIT_SECONDS = 3 * 60 * 60 // 3 hours

export default function TimedExamPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const startTimeRef = useRef<number>(0)
  const supabase = createClient()

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .limit(300)
    const shuffled = shuffleArray(data as Question[]).slice(0, TOTAL_QUESTIONS)
    setQuestions(shuffled)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  // Countdown timer
  useEffect(() => {
    if (!started || sessionDone) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          toast.error('Time is up! Exam auto-submitted.')
          handleFinish()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [started, sessionDone])

  function handleStart() {
    startTimeRef.current = Date.now()
    setStarted(true)
  }

  async function handleAnswer(answer: string) {
    const question = questions[currentIndex]
    setSelectedAnswer(answer)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('attempts').insert({
        user_id: user.id,
        question_id: question.id,
        selected_answer: answer,
        is_correct: answer === question.correct_answer,
        session_id: sessionId,
      })
    }
  }

  async function handleNext() {
    const newAnswers = selectedAnswer
      ? { ...answers, [questions[currentIndex].id]: selectedAnswer }
      : answers
    setAnswers(newAnswers)

    if (currentIndex + 1 >= questions.length) {
      await handleFinish(newAnswers)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
    }
  }

  async function handleFinish(finalAnswers?: Record<string, string>) {
    const ans = finalAnswers ?? answers
    const correct = questions.filter((q) => ans[q.id] === q.correct_answer).length
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('exam_sessions').insert({
        user_id: user.id,
        mode: 'timed',
        score: correct,
        total_questions: questions.length,
        percentage: (correct / questions.length) * 100,
        passed: (correct / questions.length) * 100 >= 75,
        time_taken_ms: timeTaken * 1000,
        question_ids: questions.map((q) => q.id),
        answers: ans,
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
    }
    setSessionDone(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (sessionDone) {
    const correct = questions.filter((q) => answers[q.id] === q.correct_answer).length
    return (
      <ExamResults
        score={correct}
        total={questions.length}
        mode="timed"
        timeTaken={TIME_LIMIT_SECONDS - timeLeft}
        onRetry={() => { setSessionDone(false); setStarted(false); setCurrentIndex(0); setAnswers({}); setTimeLeft(TIME_LIMIT_SECONDS); loadQuestions() }}
        questions={questions}
        answers={answers}
      />
    )
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Timer className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Timed Exam</h1>
          <p className="text-slate-500 mb-6">
            Simulates the real LET experience. <strong>{TOTAL_QUESTIONS} questions</strong> in{' '}
            <strong>3 hours</strong>. The exam auto-submits when time runs out.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Questions', value: TOTAL_QUESTIONS },
              { label: 'Time Limit', value: '3 hrs' },
              { label: 'Passing Score', value: '75%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 text-left">
              Once started, the timer cannot be paused. Make sure you have enough time before starting.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl transition-colors"
          >
            Start Exam →
          </button>
        </div>
      </div>
    )
  }

  const timerColor = timeLeft < 600 ? 'text-red-600' : timeLeft < 1800 ? 'text-amber-600' : 'text-slate-700'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Timer header */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3">
        <div>
          <span className="text-sm font-semibold text-slate-500">Timed Exam</span>
          <p className="text-xs text-slate-400">{currentIndex + 1} / {questions.length} questions</p>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timerColor}`}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <QuestionCard
          question={questions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          showExplanation={false} // No explanation during timed exam
          onNext={handleNext}
        />
      </div>
    </div>
  )
}
