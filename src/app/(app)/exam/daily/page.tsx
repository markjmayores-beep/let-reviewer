'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import QuestionCard from '@/components/exam/QuestionCard'
import ExamResults from '@/components/exam/ExamResults'
import { Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react'
import type { Question } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function DailyChallengePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [previousScore, setPreviousScore] = useState<number | null>(null)
  const [sessionDone, setSessionDone] = useState(false)
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if already completed today
      const { data: entry } = await supabase
        .from('daily_challenge_entries')
        .select('score, total')
        .eq('user_id', user.id)
        .eq('challenge_date', today)
        .single()

      if (entry) {
        setAlreadyDone(true)
        setPreviousScore(entry.score)
        setLoading(false)
        return
      }

      // Get or create today's challenge
      let { data: challenge } = await supabase
        .from('daily_challenges')
        .select('question_ids')
        .eq('challenge_date', today)
        .single()

      if (!challenge) {
        // No challenge exists for today — use random questions
        const { data: randomQs } = await supabase
          .from('questions')
          .select('id')
          .eq('is_active', true)
          .limit(50)
        const ids = (randomQs ?? []).sort(() => Math.random() - 0.5).slice(0, 10).map((q: { id: string }) => q.id)
        challenge = { question_ids: ids }
      }

      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .in('id', challenge.question_ids)

      setQuestions(qs as Question[])
      setLoading(false)
    }
    load()
  }, [supabase, today])

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
      })
    }
  }

  async function handleNext() {
    const newAnswers = { ...answers, [questions[currentIndex].id]: selectedAnswer! }
    setAnswers(newAnswers)

    if (currentIndex + 1 >= questions.length) {
      const correct = questions.filter((q) => newAnswers[q.id] === q.correct_answer).length
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('daily_challenge_entries').upsert({
          user_id: user.id,
          challenge_date: today,
          score: correct,
          total: questions.length,
          percentage: (correct / questions.length) * 100,
        })
        toast.success('Daily challenge complete!')
      }
      setSessionDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Already Completed!</h1>
          <p className="text-slate-500 mb-6">
            You already finished today&apos;s challenge.
            {previousScore !== null && ` You scored ${previousScore}/${questions.length || 10}.`}
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-500" />
            <p className="text-sm text-slate-600">Come back tomorrow for a new challenge!</p>
          </div>
          <a href="/exam/quick" className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Continue with Quick Review
          </a>
        </div>
      </div>
    )
  }

  if (sessionDone) {
    const correct = questions.filter((q) => answers[q.id] === q.correct_answer).length
    return (
      <ExamResults
        score={correct}
        total={questions.length}
        mode="daily"
        questions={questions}
        answers={answers}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900">Daily Challenge</h1>
          <p className="text-sm text-slate-500">{format(new Date(), 'MMMM d, yyyy')} • {questions.length} questions</p>
        </div>
      </div>

      <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-violet-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {questions[currentIndex] && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <QuestionCard
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            onAnswer={handleAnswer}
            showExplanation={true}
            onNext={handleNext}
          />
        </div>
      )}
    </div>
  )
}
