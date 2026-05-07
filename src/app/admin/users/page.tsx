import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin, is_premium, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm">View and manage registered users</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {u.full_name || 'No name'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.is_admin ? (
                      <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">Admin</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">User</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {u.is_premium ? (
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Premium</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full">Free</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
          To grant premium or admin: go to Supabase → Table Editor → profiles → edit the row directly.
        </div>
      </div>
    </div>
  )
}
