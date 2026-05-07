'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  BarChart3,
  Bookmark,
  Trophy,
  Crown,
  Flame,
  Calendar,
  Target,
  LogOut,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/review', icon: BookOpen, label: 'Review Subjects' },
  { href: '/exam/quick', icon: Target, label: 'Quick Review' },
  { href: '/exam/timed', icon: Timer, label: 'Timed Exam' },
  { href: '/exam/mock', icon: BookOpen, label: 'Mock Board Exam' },
  { href: '/exam/daily', icon: Calendar, label: 'Daily Challenge' },
  { href: '/exam/survival', icon: Flame, label: 'Survival Mode' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/premium', icon: Crown, label: 'Go Premium' },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg" onClick={onClose}>
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span>LET Reviewer</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          const isPremium = href === '/premium'

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : isPremium
                  ? 'text-amber-400 hover:bg-amber-400/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {isPremium && (
                <span className="ml-auto text-xs bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                  ✦
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
