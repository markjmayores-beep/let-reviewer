import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookmarkPlus, BookOpen } from 'lucide-react'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*, questions(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = (bookmarks ?? []) as any[]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <BookmarkPlus className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookmarks</h1>
          <p className="text-slate-500 text-sm">{items.length} saved questions</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
          <BookmarkPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="font-semibold text-slate-700 mb-2">No bookmarks yet</h2>
          <p className="text-slate-400 text-sm mb-6">
            While reviewing, tap the bookmark icon on any question to save it here.
          </p>
          <Link href="/exam/quick" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
            Start Reviewing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((bookmark: any) => {
            const q = bookmark.questions
            if (!q) return null
            return (
              <div key={bookmark.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                {/* Subject/topic */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                    {q.subject}
                  </span>
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {q.topic}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                    q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                {/* Question */}
                <p className="text-sm font-medium text-slate-900 mb-4 leading-relaxed">
                  {q.question_text}
                </p>

                {/* Correct answer */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-3">
                  <p className="text-xs text-emerald-600 font-semibold mb-1">Correct Answer: {q.correct_answer}</p>
                  <p className="text-sm text-emerald-800">
                    {q.choices?.find((c: any) => c.key === q.correct_answer)?.text}
                  </p>
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <p className="text-xs text-slate-500 leading-relaxed">{q.explanation}</p>
                )}

                {/* User note */}
                {bookmark.note && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-yellow-800">📝 {bookmark.note}</p>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3">
                  Saved {new Date(bookmark.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
