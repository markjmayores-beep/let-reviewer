import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatPercent, getReadinessLabel, getSubjectColor } from '@/lib/utils'
import { TrendingUp, Target, Clock, BookOpen, Brain, Award } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [attemptsRes, sessionsRes, streakRes, profileRes] = await Promise.all([
    supabase.from('attempts').select('is_correct, created_at, questions(subject, topic)').eq('user_id', user.id),
    supabase.from('exam_sessions').select('*').eq('user_id', user.id).eq('is_completed', true).order('completed_at', { ascending: false }).limit(20),
    supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  const attempts = (attemptsRes.data ?? []) as any[]
  const sessions = (sessionsRes.data ?? [])
  const streak = streakRes.data
  const profile = profileRes.data

  // Overall stats
  const totalAttempts = attempts.length
  const totalCorrect = attempts.filter((a) => a.is_correct).length
  const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

  // Subject breakdown
  const subjectMap: Record<string, { total: number; correct: number }> = {}
  for (const a of attempts) {
    const subject = a.questions?.subject ?? 'Unknown'
    if (!subjectMap[subject]) subjectMap[subject] = { total: 0, correct: 0 }
    subjectMap[subject].total++
    if (a.is_correct) subjectMap[subject].correct++
  }
  const subjectStats = Object.entries(subjectMap)
    .map(([subject, stats]) => ({
      subject,
      total: stats.total,
      correct: stats.correct,
      accuracy: (stats.correct / stats.total) * 100,
    }))
    .sort((a, b) => b.total - a.total)

  const strongest = subjectStats.sort((a, b) => b.accuracy - a.accuracy)[0]
  const weakest = subjectStats.sort((a, b) => a.accuracy - b.accuracy)[0]

  // Mock exam scores for readiness
  const mockScores = sessions
    .filter((s: any) => s.mode === 'mock')
    .map((s: any) => s.percentage ?? 0)

  const readiness = Math.min(
    Math.round(
      overallAccuracy * 0.5 +
      Math.min((streak?.current_streak ?? 0) * 2, 20) +
      Math.min(sessions.length * 1.5, 30)
    ),
    100
  )
  const readinessInfo = getReadinessLabel(readiness)

  // Weekly data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const dayAttempts = attempts.filter((a) => a.created_at?.startsWith(dateStr))
    const dayCorrect = dayAttempts.filter((a) => a.is_correct).length
    return {
      date: date.toLocaleDateString('en-PH', { weekday: 'short' }),
      total: dayAttempts.length,
      correct: dayCorrect,
      accuracy: dayAttempts.length > 0 ? (dayCorrect / dayAttempts.length) * 100 : 0,
    }
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm">Your complete performance overview</p>
        </div>
      </div>

      {/* LET Readiness Meter */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium">LET Readiness</p>
            <h2 className="text-4xl font-black mt-1">{readiness}%</h2>
            <p className={`text-lg font-semibold mt-1 ${readinessInfo.color.replace('text-', 'text-').replace('-600', '-200')}`}>
              {readinessInfo.label}
            </p>
          </div>
          <div className="w-24 h-24 relative">
            <svg viewBox="0 0 36 36" className="rotate-[-90deg] w-24 h-24">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="white" strokeWidth="3"
                strokeDasharray={`${readiness}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-8 h-8 text-white/80" />
            </div>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${readiness}%` }}
          />
        </div>
        <p className="text-indigo-200 text-xs mt-2">
          Based on accuracy, consistency, and mock exam performance
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Target, label: 'Total Questions', value: totalAttempts, color: 'bg-indigo-100 text-indigo-600' },
          { icon: TrendingUp, label: 'Overall Accuracy', value: formatPercent(overallAccuracy, 1), color: 'bg-emerald-100 text-emerald-600' },
          { icon: BookOpen, label: 'Sessions Done', value: sessions.length, color: 'bg-amber-100 text-amber-600' },
          { icon: Clock, label: 'Day Streak', value: `${streak?.current_streak ?? 0} days`, color: 'bg-orange-100 text-orange-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly activity */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="font-bold text-slate-900 mb-5">Last 7 Days</h2>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((day) => {
            const height = day.total > 0 ? Math.max((day.total / Math.max(...weeklyData.map((d) => d.total || 1))) * 100, 10) : 5
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex-1 flex items-end">
                  <div
                    className="w-full bg-indigo-200 rounded-t-md hover:bg-indigo-400 transition-colors cursor-default"
                    style={{ height: `${height}%` }}
                    title={`${day.total} questions, ${Math.round(day.accuracy)}% accuracy`}
                  />
                </div>
                <span className="text-xs text-slate-400">{day.date}</span>
                <span className="text-xs font-bold text-slate-600">{day.total}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900">Subject Performance</h2>
          {strongest && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-medium">
              Strongest: {strongest.subject}
            </span>
          )}
        </div>
        {subjectStats.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Answer some questions to see your subject breakdown.</p>
        ) : (
          <div className="space-y-4">
            {subjectStats.map(({ subject, total, correct, accuracy }) => (
              <div key={subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getSubjectColor(subject)}`}>
                    {subject}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{formatPercent(accuracy, 0)}</span>
                    <span className="text-xs text-slate-400 ml-2">{correct}/{total}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${accuracy >= 75 ? 'bg-emerald-500' : accuracy >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weakest subject alert */}
      {weakest && weakest.accuracy < 70 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Brain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Focus Area: {weakest.subject}</p>
            <p className="text-sm text-amber-700 mt-1">
              Your accuracy in {weakest.subject} is {formatPercent(weakest.accuracy, 0)}.
              Practice more to improve before your exam.
            </p>
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mt-8">
          <h2 className="font-bold text-slate-900 mb-4">Recent Exam Sessions</h2>
          <div className="space-y-2">
            {sessions.slice(0, 10).map((session: any) => (
              <div key={session.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full ${(session.percentage ?? 0) >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <span className="flex-1 text-sm text-slate-700 capitalize">{session.mode} exam</span>
                <span className="text-sm font-bold text-slate-900">{Math.round(session.percentage ?? 0)}%</span>
                <span className="text-xs text-slate-400">
                  {new Date(session.completed_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
