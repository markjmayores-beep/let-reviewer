import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Flag } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: reports } = await supabase
    .from('question_reports')
    .select('id, reason, details, created_at, status, question_id, user_id')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <Flag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reported Questions</h1>
          <p className="text-slate-500 text-sm">Review and resolve user-reported issues</p>
        </div>
      </div>

      <div className="space-y-4">
        {reports?.map((report) => (
          <div key={report.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {report.reason || 'No reason'}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    report.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {report.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-1">
                  <span className="font-medium">Question ID:</span>{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{report.question_id}</code>
                </p>
                {report.details && (
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3">{report.details}</p>
                )}
              </div>
              <p className="text-xs text-slate-400 whitespace-nowrap">
                {report.created_at ? new Date(report.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        ))}
        {(!reports || reports.length === 0) && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
            <Flag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No reports yet</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          To resolve a report: go to Supabase → Table Editor → <code className="bg-blue-100 px-1 rounded">question_reports</code> → set status to <code className="bg-blue-100 px-1 rounded">resolved</code>.
        </p>
      </div>
    </div>
  )
}
