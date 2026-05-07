import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Medal, Crown } from 'lucide-react'
import { formatPercent } from '@/lib/utils'
export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: leaderboard } = await supabase
    .from('leaderboard_weekly')
    .select('*, profiles(full_name, avatar_url, exam_type)')
    .eq('week_start', weekStartStr)
    .order('points', { ascending: false })
    .limit(50)

  const entries = (leaderboard ?? []) as any[]
  const myEntry = entries.find((e) => e.user_id === user.id)
  const myRank = entries.findIndex((e) => e.user_id === user.id) + 1

  const rankIcons: Record<number, any> = {
    1: Crown,
    2: Medal,
    3: Trophy,
  }

  const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700']

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-slate-500 text-sm">Weekly ranking — resets every Monday</p>
        </div>
      </div>

      {/* My rank */}
      {myEntry && (
        <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-6">
          <p className="text-indigo-200 text-sm font-medium mb-1">Your Rank This Week</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black">#{myRank}</span>
              <div>
                <p className="font-semibold">You</p>
                <p className="text-indigo-200 text-xs">{myEntry.total_questions} questions · {formatPercent(myEntry.accuracy ?? 0, 0)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{myEntry.points}</p>
              <p className="text-indigo-200 text-xs">points</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="font-semibold text-slate-700 mb-2">No rankings yet this week</h2>
          <p className="text-slate-400 text-sm mb-6">Complete exams and daily challenges to appear on the leaderboard.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          {entries.map((entry: any, i: number) => {
            const rank = i + 1
            const RankIcon = rankIcons[rank]
            const isMe = entry.user_id === user.id
            const name = entry.profiles?.full_name ?? 'Anonymous'
            const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 ${isMe ? 'bg-indigo-50' : ''}`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {RankIcon ? (
                    <RankIcon className={`w-5 h-5 mx-auto ${rankColors[rank - 1]}`} />
                  ) : (
                    <span className="text-sm font-bold text-slate-400">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isMe ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                  {initials}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isMe ? 'text-indigo-700' : 'text-slate-900'}`}>
                    {isMe ? `${name} (You)` : name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {entry.total_questions} questions · {formatPercent(entry.accuracy ?? 0, 0)} accuracy
                  </p>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-slate-900">{entry.points}</p>
                  <p className="text-xs text-slate-400">pts</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">
        Points = correct answers × 10 + streak bonus. Resets every Monday.
      </p>
    </div>
  )
}
