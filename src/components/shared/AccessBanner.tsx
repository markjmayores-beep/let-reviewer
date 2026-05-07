'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AccessStatus } from '@/lib/subscription'

interface AccessBannerProps {
  status: AccessStatus
  endsAt: string | null // ISO string (serialized from server)
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours >= 48) {
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return `${days}d ${remHours}h`
  }
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function AccessBanner({ status, endsAt }: AccessBannerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    endsAt ? Math.max(0, new Date(endsAt).getTime() - Date.now()) : 0
  )

  useEffect(() => {
    if (!endsAt || status === 'expired') return
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, new Date(endsAt).getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(interval)
  }, [endsAt, status])

  if (status === 'expired' || !endsAt) return null

  if (status === 'trial') {
    return (
      <div className="px-3 py-1.5 border-b border-amber-200 bg-amber-50 flex items-center justify-between gap-2 text-xs">
        <span className="text-amber-700">
          Trial ends in <strong className="font-bold tabular-nums">{formatCountdown(timeLeft)}</strong>
        </span>
        <Link href="/premium" className="text-amber-600 font-semibold hover:underline flex-shrink-0">
          Subscribe
        </Link>
      </div>
    )
  }

  // active subscription — very subtle
  return (
    <div className="px-3 py-1 flex items-center justify-end gap-1 text-xs text-slate-400 border-b border-slate-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
      <span>Access ends in <span className="tabular-nums">{formatCountdown(timeLeft)}</span></span>
    </div>
  )
}
