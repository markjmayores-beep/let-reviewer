import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Flame,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Timer,
  Trophy,
  ArrowRight,
  Brain,
  Zap,
} from 'lucide-react'
import { formatPercent, getDaysUntilExam, getReadinessLabel } from '@/lib/utils'
import { fetchWeakTopics } from '@/lib/questions'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile, streak, and recent stats in parallel
  const [profileRes, streakRes, attemptsRes, sessionsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    supabase
      .from('attempts')
      .select('is_correct')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('exam_sessions')
      .select('percentage, mode, completed_at')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileRes.data
  const streak = streakRes.data
  const weekAttempts = attemptsRes.data ?? []
  const recentSessions = sessionsRes.data ?? []
  const weakTopics = await fetchWeakTopics(user.id)

  const weekCorrect = weekAttempts.filter((a) => a.is_correct).length
  const weekTotal = weekAttempts.length
  const weekAccuracy = weekTotal > 0 ? (weekCorrect / weekTotal) * 100 : 0

  const daysUntil = getDaysUntilExam(profile?.target_exam_date ?? null)
  const readiness = Math.min(Math.round(weekAccuracy * 0.7 + Math.min((streak?.current_streak ?? 0) * 2, 30)), 100)
  const readinessInfo = getReadinessLabel(readiness)

  const examModes = [
    { href: '/exam/quick', icon: Target, label: 'Quick Review', desc: 'Unlimited random questions', color: 'bg-indigo-500' },
    { href: '/exam/timed', icon: Timer, label: 'Timed Exam', desc: '100 questions, 3 hours', color: 'bg-amber-500' },
    { href: '/exam/mock', icon: BookOpen, label: 'Mock Board', desc: 'Full LET simulation', color: 'bg-emerald-500' },
    { href: '/exam/daily', icon: Calendar, label: 'Daily Challenge', desc: '10 questions · today only', color: 'bg-violet-500' },
    { href: '/exam/survival', icon: Flame, label: 'Survival Mode', desc: '1 mistake = restart', color: 'bg-rose-500' },
    { href: '/review', icon: Brain, label: 'Topic Mastery', desc: 'Focus on one subject', color: 'bg-sky-500' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            {profile?.full_name?.split(' ')[0] ?? 'Teacher'} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {daysUntil
              ? `${daysUntil} days until your LET exam. Keep going!`
              : 'Track your progress and review daily.'}
          </p>
        </div>
        {daysUntil && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 text-center">
            <p className="text-3xl font-black text-indigo-600">{daysUntil}</p>
            <p className="text-xs text-indigo-400 font-medium">days to LET</p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-slate-500">Streak</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{streak?.current_streak ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">days in a row</p>
        </div>

        {/* Weekly accuracy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">This Week</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{formatPercent(weekAccuracy, 0)}</p>
          <p className="text-xs text-slate-400 mt-1">{weekTotal} questions answered</p>
        </div>

        {/* LET Readiness */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Readiness</span>
          </div>
          <p className={`text-3xl font-black ${readinessInfo.color}`}>{readiness}%</p>
          <p className="text-xs text-slate-400 mt-1">{readinessInfo.label}</p>
        </div>

        {/* Total study days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Study Days</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{streak?.total_study_days ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">total days studied</p>
        </div>
      </div>

      {/* Weak topics alert */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">Topics Needing Attention</h3>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((t) => (
                  <Link
                    key={`${t.subject}-${t.topic}`}
                    href={`/review?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`}
                    className="flex items-center gap-2 bg-white border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    {t.topic}
                    <span className="text-amber-500">{Math.round(t.accuracy)}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review modes */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">Start Reviewing</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {examModes.map(({ href, icon: Icon, label, desc, color }) => (
          <Link
            key={href}
            href={href}
            className="card-hover bg-white border border-slate-100 rounded-2xl p-5 shadow-sm group"
          >
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-slate-900 text-sm">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Sessions</h2>
            <Link href="/analytics" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session, i) => (
              <div key={i} className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  (session.percentage ?? 0) >= 75 ? 'bg-emerald-500' : 'bg-red-400'
                }`} />
                <span className="text-sm font-medium text-slate-700 flex-1 capitalize">{session.mode} exam</span>
                <span className={`text-sm font-bold ${
                  (session.percentage ?? 0) >= 75 ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {formatPercent(session.percentage ?? 0, 0)}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(session.completed_at!).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upgrade CTA for free users */}
      <div className="mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Upgrade to Premium</span>
          </div>
          <p className="text-indigo-100 text-sm">
            No ads, unlimited review, full mock exams, and advanced analytics. Only ₱199/month.
          </p>
        </div>
        <Link
          href="/premium"
          className="flex-shrink-0 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold rounded-xl transition-colors text-sm"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  )
}
