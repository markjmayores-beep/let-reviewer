'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Check, Zap, CreditCard, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/paymongo'
import toast from 'react-hot-toast'

const premiumFeatures = [
  'No ads — completely ad-free experience',
  'Unlimited questions — review as much as you want',
  'All 6 exam modes including full Mock Board Exam',
  'LET Readiness Meter with advanced analytics',
  'Complete weak topic detection & recommendations',
  'Offline mode — review without internet',
  'Bookmark & Notes system',
  'Leaderboard with full participation',
  'Early access to new features',
  'Priority customer support',
]

export default function PremiumPage() {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [isPremium, setIsPremium] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
      setIsPremium(profile?.is_premium ?? false)

      if (profile?.is_premium) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()
        setSubscription(sub)
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleCheckout() {
    setCheckoutLoading(true)
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
        toast.error('Failed to create checkout. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setCheckoutLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Zap className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re Premium!</h1>
          <p className="text-slate-500 mb-4">
            You have full access to everything. Enjoy ad-free, unlimited reviewing!
          </p>
          {subscription?.ends_at && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600">
                <strong>Plan:</strong> {subscription.plan === 'yearly' ? 'Yearly' : 'Monthly'}<br />
                <strong>Renews:</strong> {new Date(subscription.ends_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
          <a href="/dashboard" className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Upgrade to Premium</h1>
        <p className="text-slate-500">
          Unlimited access to everything. No ads. No limits.
        </p>
      </div>

      {/* Plan selector */}
      <div className="flex gap-3 mb-8">
        {(['monthly', 'yearly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`flex-1 rounded-2xl p-5 border-2 text-left transition-all ${
              plan === p
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <p className={`font-bold capitalize mb-1 ${plan === p ? 'text-indigo-700' : 'text-slate-700'}`}>
              {p}
            </p>
            <p className="text-2xl font-black text-slate-900">
              ₱{p === 'monthly' ? '199' : '999'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {p === 'monthly' ? 'per month' : 'per year'}
            </p>
            {p === 'yearly' && (
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Save ₱1,389
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Features */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Everything Included</h2>
        <ul className="space-y-3">
          {premiumFeatures.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Checkout button */}
      <button
        onClick={handleCheckout}
        disabled={checkoutLoading}
        className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-lg rounded-2xl transition-colors shadow-lg mb-4"
      >
        {checkoutLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ₱{plan === 'monthly' ? '199' : '999'} with GCash / Maya / Card
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Powered by PayMongo • GCash • Maya • Credit/Debit Card • Secure checkout
      </p>
    </div>
  )
}
