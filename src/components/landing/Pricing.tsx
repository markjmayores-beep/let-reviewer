'use client'

import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const freeFeatures = [
  '5 questions per batch (ad-supported)',
  'Quick Review mode',
  'Daily Challenge (1/day)',
  'Basic progress tracking',
  'Google & Facebook login',
  'Mobile-first PWA',
]

const premiumFeatures = [
  'No ads — ever',
  'Unlimited questions',
  'All 6 exam modes',
  'Full Mock Board Exams',
  'LET Readiness Meter',
  'Advanced analytics dashboard',
  'Bookmark & Notes system',
  'Offline mode (full)',
  'Weak topic AI detection',
  'Leaderboard + streaks',
  'Priority support',
  'New questions weekly',
]

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')

  return (
    <section id="pricing" className="py-24 bg-slate-50 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
            Start Free. Unlock Everything.
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Review for free with ads, or go Premium for unlimited access.
            Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-200 rounded-xl p-1 mt-8">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billing === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Save 58%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Free</h3>
              <p className="text-slate-500 text-sm mt-1">Great for getting started</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-slate-900">₱0</span>
                <span className="text-slate-400 ml-2">forever</span>
              </div>
            </div>

            <Link
              href="/register"
              className="block w-full text-center py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors mb-8"
            >
              Get Started Free
            </Link>

            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 shadow-xl text-white overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold">Premium</h3>
              <p className="text-indigo-200 text-sm mt-1">Everything you need to pass</p>
              <div className="mt-4">
                {billing === 'yearly' ? (
                  <>
                    <span className="text-4xl font-black">₱999</span>
                    <span className="text-indigo-200 ml-2">/year</span>
                    <p className="text-indigo-200 text-sm mt-1">
                      <s>₱2,388/year</s> — save ₱1,389
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-black">₱199</span>
                    <span className="text-indigo-200 ml-2">/month</span>
                  </>
                )}
              </div>
            </div>

            <Link
              href="/register?plan=premium"
              className="block w-full text-center py-3 bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold rounded-xl transition-colors mb-8 shadow-lg"
            >
              Start Premium — Pay with GCash
            </Link>

            <p className="text-xs text-indigo-200 text-center mb-6">
              GCash • Maya • Credit Card • Debit Card
            </p>

            <ul className="space-y-3">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-indigo-100">
                  <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Powered by PayMongo • Secure Philippine payment gateway • Cancel anytime
        </p>
      </div>
    </section>
  )
}
