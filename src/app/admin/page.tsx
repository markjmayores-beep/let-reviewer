import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Users, TrendingUp, Flag, Database, Settings } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const [questionsRes, usersRes, reportsRes, attemptsRes] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('question_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('attempts').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ])

  const stats = [
    { icon: BookOpen, label: 'Total Questions', value: questionsRes.count ?? 0, color: 'bg-indigo-100 text-indigo-600', href: '/admin/questions' },
    { icon: Users, label: 'Total Users', value: usersRes.count ?? 0, color: 'bg-emerald-100 text-emerald-600', href: '/admin/users' },
    { icon: Flag, label: 'Pending Reports', value: reportsRes.count ?? 0, color: 'bg-red-100 text-red-600', href: '/admin/reports' },
    { icon: TrendingUp, label: 'Attempts Today', value: attemptsRes.count ?? 0, color: 'bg-amber-100 text-amber-600', href: '/admin' },
  ]

  const adminLinks = [
    { href: '/admin/questions', icon: BookOpen, label: 'Manage Questions', desc: 'Add, edit, delete questions and explanations' },
    { href: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View users, grant premium, manage admins' },
    { href: '/admin/questions?filter=reported', icon: Flag, label: 'Reported Questions', desc: 'Review and resolve user-reported issues' },
    { href: '/analytics', icon: TrendingUp, label: 'Platform Analytics', desc: 'Usage stats, retention, top topics' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 text-sm">LET Reviewer PH Management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, href }) => (
          <Link key={label} href={href} className="card-hover bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="card-hover flex items-start gap-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="text-sm text-slate-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Admin tip:</strong> Use the database icon in Supabase to bulk import questions via CSV.
          Table: <code className="bg-blue-100 px-1 rounded">questions</code> — see the SQL migration for the schema.
        </p>
      </div>
    </div>
  )
}
