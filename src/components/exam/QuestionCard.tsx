'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BookmarkPlus, Flag, ChevronRight, Lightbulb } from 'lucide-react'
import type { Question, Choice } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
  showExplanation: boolean
  onNext: () => void
  onBookmark?: () => void
  isBookmarked?: boolean
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  showExplanation,
  onNext,
  onBookmark,
  isBookmarked,
}: QuestionCardProps) {
  const [reported, setReported] = useState(false)
  const answered = selectedAnswer !== null
  const isCorrect = selectedAnswer === question.correct_answer

  async function handleReport() {
    setReported(true)
    toast.success('Question reported. Thank you!')
  }

  return (
    <div className="animate-slide-up">
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            question.difficulty === 'easy' && 'bg-emerald-100 text-emerald-700',
            question.difficulty === 'medium' && 'bg-amber-100 text-amber-700',
            question.difficulty === 'hard' && 'bg-red-100 text-red-700'
          )}>
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onBookmark && (
            <button
              onClick={onBookmark}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isBookmarked
                  ? 'bg-amber-100 text-amber-600'
                  : 'text-slate-400 hover:bg-slate-100'
              )}
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleReport}
            disabled={reported}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            title="Report this question"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subject + topic */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">
          {question.subject}
        </span>
        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
          {question.topic}
        </span>
      </div>

      {/* Question text */}
      <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed mb-6">
        {question.question_text}
      </p>

      {/* Question image */}
      {question.image_url && (
        <div className="mb-6 rounded-xl overflow-hidden border border-slate-200">
          <Image
            src={question.image_url}
            alt="Question diagram"
            width={600}
            height={300}
            className="w-full object-contain"
          />
        </div>
      )}

      {/* Answer choices */}
      <div className="space-y-3 mb-6">
        {question.choices.map((choice: Choice) => {
          const isSelected = selectedAnswer === choice.key
          const isCorrectChoice = choice.key === question.correct_answer

          let choiceClass =
            'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-left w-full'

          if (!answered) {
            choiceClass += ' border-slate-200 hover:border-indigo-400 hover:bg-indigo-50'
          } else {
            if (isCorrectChoice) {
              choiceClass += ' border-emerald-500 bg-emerald-50 answer-correct'
            } else if (isSelected && !isCorrectChoice) {
              choiceClass += ' border-red-400 bg-red-50 answer-wrong'
            } else {
              choiceClass += ' border-slate-200 bg-slate-50 opacity-60'
            }
          }

          return (
            <button
              key={choice.key}
              onClick={() => !answered && onAnswer(choice.key)}
              disabled={answered}
              className={choiceClass}
            >
              <span className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5',
                !answered && 'bg-slate-100 text-slate-600',
                answered && isCorrectChoice && 'bg-emerald-500 text-white',
                answered && isSelected && !isCorrectChoice && 'bg-red-500 text-white',
                answered && !isCorrectChoice && !isSelected && 'bg-slate-100 text-slate-400'
              )}>
                {choice.key}
              </span>
              <span className={cn(
                'text-sm leading-relaxed',
                answered && isCorrectChoice && 'font-medium text-emerald-800',
                answered && isSelected && !isCorrectChoice && 'text-red-700',
                answered && !isCorrectChoice && !isSelected && 'text-slate-500'
              )}>
                {choice.text}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && showExplanation && question.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-slide-up">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Explanation</p>
              <p className="text-sm text-blue-800 leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result + Next */}
      {answered && (
        <div className="flex items-center justify-between animate-slide-up">
          <div className={cn(
            'flex items-center gap-2 font-semibold text-sm',
            isCorrect ? 'text-emerald-600' : 'text-red-500'
          )}>
            {isCorrect ? '✓ Correct!' : `✗ Correct answer: ${question.correct_answer}`}
          </div>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
