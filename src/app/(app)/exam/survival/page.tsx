'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import QuestionCard from '@/components/exam/QuestionCard'
import { shuffleArray } from '@/lib/utils'
import type { Question } from '@/types'
import { Heart, Trophy, RefreshCw, Home, Loader2 } from 'lucide-react'
import Link from 'next/link'

const MAX_LIVES = 3

export default function SurvivalModePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const supabase = createClient()

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('questions').select('*').eq('is_active', true).limit(500)
    setQuestions(shuffleArray(data as Question[]))
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  async function handleAnswer(answer: string) {
    const question = questions[currentIndex]
    setSelectedAnswer(answer)
    const isCorrect = answer === question.correct_answer

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

    if (!isCorrect) {
      const newLives = lives - 1
      setLives(newLives)
      if (newLives <= 0) {
        if (currentIndex > highScore) setHighScore(currentIndex)
        setTimeout(() => setGameOver(true), 1200)
      }
    } else {
      setStreak((s) => s + 1)
    }
  }

  function handleNext() {
    if (lives <= 0) {
      setGameOver(true)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedAnswer(null)
  }

  function handleRestart() {
    setLives(MAX_LIVES)
    setCurrentIndex(0)
    setStreak(0)
    setSelectedAnswer(null)
    setGameOver(false)
    loadQuestions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Game Over!</h1>
          <p className="text-slate-500 mb-6">You answered {currentIndex} questions correctly before running out of lives.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-3xl font-black text-indigo-600">{currentIndex}</p>
              <p className="text-xs text-slate-400 mt-1">Questions Survived</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-3xl font-black text-amber-500">{Math.max(streak, highScore)}</p>
              <p className="text-xs text-slate-400 mt-1">Best Score</p>
            </div>
          </div>

          {currentIndex >= 20 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                {currentIndex >= 50 ? 'Amazing survival! You\'re LET-ready.' : 'Good run! Keep practicing to beat your score.'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Play Again
            </button>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-400 transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Lives + score header */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-300'}`}
            />
          ))}
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-slate-900">{currentIndex}</p>
          <p className="text-xs text-slate-400">survived</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-amber-500">{streak}</p>
          <p className="text-xs text-slate-400">streak</p>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={999}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          showExplanation={true}
          onNext={handleNext}
        />
      </div>
    </div>
  )
}
