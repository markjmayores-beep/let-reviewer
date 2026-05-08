import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { SUBJECTS } from '@/types'
import { getSubjectColor } from '@/lib/utils'
export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('exam_type').eq('id', user.id).single()
  const examType = (profile?.exam_type ?? 'elementary') as 'elementary' | 'secondary'
  const subjects = SUBJECTS[examType]

  // Get topic accuracy from last 30 days
  const { data: attempts } = await supabase
    .from('attempts')
    .select('is_correct, questions(subject, topic)')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const topicStats: Record<string, { total: number; correct: number }> = {}
  for (const a of (attempts ?? []) as any[]) {
    const key = `${a.questions?.subject}|||${a.questions?.topic}`
    if (!topicStats[key]) topicStats[key] = { total: 0, correct: 0 }
    topicStats[key].total++
    if (a.is_correct) topicStats[key].correct++
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Topic Mastery</h1>
          <p className="text-slate-500 text-sm capitalize">{examType} LET · last 30 days</p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(subjects).map(([subject, topics]) => (
          <div key={subject}>
            <h2 className="font-bold text-slate-900 mb-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getSubjectColor(subject)}`}>
                {subject}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(topics as readonly string[]).map((topic) => {
                const keys = Object.keys(topicStats).filter((k) => k.includes(topic))
                let stat: { total: number; correct: number } | null = null
                for (const k of keys) {
                  if (!stat) stat = { ...topicStats[k] }
                  else {
                    stat.total += topicStats[k].total
                    stat.correct += topicStats[k].correct
                  }
                }
                const accuracy = stat && stat.total > 0 ? (stat.correct / stat.total) * 100 : null

                return (
                  <div
                    key={topic}
                    className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{topic}</p>
                      {accuracy !== null ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${accuracy >= 75 ? 'bg-emerald-500' : accuracy >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold tabular-nums ${accuracy >= 75 ? 'text-emerald-600' : accuracy >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                            {Math.round(accuracy)}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">Not started</p>
                      )}
                    </div>
                    {stat && (
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {stat.correct}/{stat.total}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
