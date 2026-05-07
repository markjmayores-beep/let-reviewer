'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, Calendar, BookOpen, GraduationCap, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const EXAM_TYPES = [
  { value: 'elementary', label: 'Elementary Education' },
  { value: 'secondary', label: 'Secondary Education' },
]

const MAJORS_SECONDARY = [
  'English', 'Filipino', 'Mathematics', 'Science', 'Social Studies',
  'MAPEH', 'TLE', 'Values Education', 'SPED',
]

const MAJORS_ELEMENTARY = [
  'General Education', 'SPED',
]

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    exam_type: 'elementary',
    major: '',
    target_exam_date: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, exam_type, major, target_exam_date')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile({
          full_name: data.full_name ?? '',
          exam_type: data.exam_type ?? 'elementary',
          major: data.major ?? '',
          target_exam_date: data.target_exam_date ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        exam_type: profile.exam_type,
        major: profile.major,
        target_exam_date: profile.target_exam_date || null,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to save settings')
    } else {
      toast.success('Settings saved!')
    }
    setSaving(false)
  }

  const majors = profile.exam_type === 'secondary' ? MAJORS_SECONDARY : MAJORS_ELEMENTARY

  const daysUntilExam = profile.target_exam_date
    ? Math.ceil((new Date(profile.target_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-xl mb-8" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Update your profile and exam preferences</p>
        </div>
      </div>

      <div className="space-y-5">

        {/* Name */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <GraduationCap className="w-4 h-4 inline mr-1.5 text-indigo-500" />
            Full Name
          </label>
          <input
            type="text"
            value={profile.full_name}
            onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your full name"
          />
        </div>

        {/* Exam Type */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            <BookOpen className="w-4 h-4 inline mr-1.5 text-indigo-500" />
            LET Track
          </label>
          <div className="grid grid-cols-2 gap-3">
            {EXAM_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setProfile(p => ({ ...p, exam_type: t.value, major: '' }))}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  profile.exam_type === t.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Major */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Major / Specialization
          </label>
          <select
            value={profile.major}
            onChange={e => setProfile(p => ({ ...p, major: e.target.value }))}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Select your major</option>
            {majors.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Exam Date */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Target LET Exam Date{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            {profile.target_exam_date && (
              <button
                type="button"
                onClick={() => setProfile(p => ({ ...p, target_exam_date: '' }))}
                className="text-xs text-slate-400 hover:text-red-500 underline transition-colors"
              >
                Clear date
              </button>
            )}
          </div>
          <input
            type="date"
            value={profile.target_exam_date}
            onChange={e => setProfile(p => ({ ...p, target_exam_date: e.target.value }))}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {daysUntilExam !== null && (
            <div className={`mt-3 rounded-xl px-4 py-3 text-sm font-semibold ${
              daysUntilExam <= 7
                ? 'bg-red-50 text-red-700'
                : daysUntilExam <= 30
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {daysUntilExam <= 0
                ? 'Your exam date has passed. Update it!'
                : daysUntilExam === 1
                ? '⚡ Exam is TOMORROW! You got this!'
                : daysUntilExam <= 7
                ? `⚡ ${daysUntilExam} days left — final stretch!`
                : daysUntilExam <= 30
                ? `📅 ${daysUntilExam} days until your exam — keep reviewing!`
                : `📅 ${daysUntilExam} days until your exam — great, stay consistent!`}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-2xl transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
