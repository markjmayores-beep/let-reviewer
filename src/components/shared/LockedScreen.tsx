'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LockedScreen() {
  const [loading, setLoading] = useState<'weekly' | 'monthly' | null>(null)

  async function handleSubscribe(plan: 'weekly' | 'monthly') {
    setLoading(plan)
    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error('Failed to start checkout. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Ended</h2>
        <p className="text-slate-500 text-sm mb-8">
          Subscribe to keep reviewing. Full access across all exam modes.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSubscribe('weekly')}
            disabled={loading !== null}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'weekly' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>1 Week — ₱99</>
            )}
          </button>

          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={loading !== null}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading === 'monthly' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>1 Month — ₱299</>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Powered by PayMongo · GCash · Maya · Card
        </p>
      </div>
    </div>
  )
}
