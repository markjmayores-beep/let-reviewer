'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Calendar, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const EXAM_TYPES = [
  { value: 'elementary', label: 'Elementary', desc: 'Grade 1–6' },
  { value: 'secondary', label: 'Secondary', desc: 'Grade 7–12' },
]

const MAJORS_SECONDARY = [
  'English', 'Filipino', 'Mathematics', 'Science - Biological',
  'Science - Physical', 'Social Studies', 'MAPEH', 'TLE',
  'Values Education', 'ICT', 'Agriculture', 'SPED',
]

const MAJORS_ELEMENTARY = [
  'General Education', 'SPED',
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [examType, setExamType] = useState<'elementary' | 'secondary'>('elementary')
  const [major, setMajor] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [skipDate, setSkipDate] = useState(false)
  const [saving, setSaving] = useState(false)

  const majors = examType === 'secondary' ? MAJORS_SECONDARY : MAJORS_ELEMENTARY

  async function handleComplete() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      exam_type: examType,
      major: major || null,
      target_exam_date: (!skipDate && targetDate) ? targetDate : null,
      onboarding_done: true,
    })

    if (error) {
      toast.error('Could not save your profile. Please try again.')
      setSaving(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Welcome to LET Reviewer!</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Let&apos;s set up your profile to personalize your review plan.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">

          {/* LET Track */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3">
              Which LET track are you taking?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {EXAM_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { setExamType(t.value as 'elementary' | 'secondary'); setMajor('') }}
                  className={`py-4 px-4 rounded-xl border-2 text-left transition-colors ${
                    examType === t.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <p className={`font-bold text-sm ${examType === t.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Major / Specialization{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select your major</option>
              {majors.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Target exam date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Target LET Exam Date
              </label>
              <button
                type="button"
                onClick={() => { setSkipDate(!skipDate); setTargetDate('') }}
                className="text-xs text-slate-400 hover:text-indigo-600 underline transition-colors"
              >
                {skipDate ? 'Add a date' : "Skip for now"}
              </button>
            </div>
            {skipDate ? (
              <p className="text-sm text-slate-400 italic py-2 px-1">
                No problem — you can add this later in Settings.
              </p>
            ) : (
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleComplete}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-colors text-base"
          >
            <CheckCircle className="w-5 h-5" />
            {saving ? 'Saving…' : "Let's Go!"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          You can change these anytime in Settings.
        </p>
      </div>
    </div>
  )
}
