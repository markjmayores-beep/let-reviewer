'use client'

import { useState, useEffect } from 'react'
import { Play, Zap, X } from 'lucide-react'
import Link from 'next/link'

interface RewardedAdGateProps {
  questionsAnswered: number // how many questions in this session
  onUnlock: () => void     // called after ad watched or skipped (premium)
  isPremium: boolean
}

const BATCH_SIZE = 5 // questions per batch before ad

export default function RewardedAdGate({
  questionsAnswered,
  onUnlock,
  isPremium,
}: RewardedAdGateProps) {
  const [adWatching, setAdWatching] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [unlocked, setUnlocked] = useState(false)

  // Premium users never see the gate
  if (isPremium || unlocked || questionsAnswered % BATCH_SIZE !== 0 || questionsAnswered === 0) {
    return null
  }

  function handleWatchAd() {
    setAdWatching(true)
    setCountdown(5)
  }

  function handleUnlockAfterAd() {
    setUnlocked(true)
    onUnlock()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        {!adWatching ? (
          <>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Play className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Great job! {questionsAnswered} questions done.
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Watch a short ad to unlock the next {BATCH_SIZE} questions for free.
            </p>

            <button
              onClick={handleWatchAd}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors mb-3"
            >
              Watch Ad & Continue
            </button>

            <Link
              href="/premium"
              className="flex items-center justify-center gap-2 w-full py-3 bg-amber-50 border-2 border-amber-200 text-amber-700 font-semibold rounded-xl hover:bg-amber-100 transition-colors text-sm"
            >
              <Zap className="w-4 h-4" />
              Go Premium — No Ads Ever
            </Link>
          </>
        ) : (
          <AdCountdown seconds={countdown} onFinish={handleUnlockAfterAd} />
        )}
      </div>
    </div>
  )
}

function AdCountdown({ seconds, onFinish }: { seconds: number; onFinish: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onFinish()
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onFinish])

  return (
    <>
      {/* Simulated ad area */}
      <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center mb-5 border border-dashed border-slate-300">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Advertisement</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{remaining}s</p>
        </div>
      </div>
      <p className="text-slate-500 text-sm mb-4">
        {remaining > 0
          ? `Ad ends in ${remaining} second${remaining !== 1 ? 's' : ''}…`
          : 'Ad finished! Unlocking questions…'}
      </p>
      {remaining === 0 && (
        <button
          onClick={onFinish}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
        >
          Continue Reviewing →
        </button>
      )}
    </>
  )
}
