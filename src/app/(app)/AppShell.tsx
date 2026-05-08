'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/shared/Sidebar'
import PWAInstallPrompt from '@/components/shared/PWAInstallPrompt'
import AccessBanner from '@/components/shared/AccessBanner'
import { Menu } from 'lucide-react'
import type { AccessStatus } from '@/lib/subscription'

interface AppShellProps {
  children: React.ReactNode
  accessStatus: AccessStatus
  accessEndsAt: string | null
}

export default function AppShell({ children, accessStatus, accessEndsAt }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar accessStatus={accessStatus} accessEndsAt={accessEndsAt} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} accessStatus={accessStatus} accessEndsAt={accessEndsAt} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-bold text-slate-900">LET Reviewer PH</span>
        </header>

        {/* Access indicator */}
        <AccessBanner status={accessStatus} endsAt={accessEndsAt} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <PWAInstallPrompt />
    </div>
  )
}
