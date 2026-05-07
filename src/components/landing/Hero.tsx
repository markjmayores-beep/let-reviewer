'use client'

import Link from 'next/link'
import { ArrowRight, Star, Users, BookOpen, Trophy } from 'lucide-react'

const stats = [
  { icon: BookOpen, value: '5,000+', label: 'Questions' },
  { icon: Users, value: '12,000+', label: 'Reviewees' },
  { icon: Trophy, value: '89%', label: 'Pass Rate' },
  { icon: Star, value: '4.9/5', label: 'Rating' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen hero-gradient flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          #1 LET Reviewer Platform in the Philippines
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Pass the LET on Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            First Try
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
          Smart, gamified reviewer with 5,000+ LET questions, AI-powered weak topic detection,
          mock board exams, and offline support. Designed for Filipino teachers.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg rounded-xl shadow-xl transition-all hover:scale-105 hover:shadow-amber-500/30"
          >
            Start Reviewing Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-lg rounded-xl transition-all backdrop-blur-sm"
          >
            See How It Works
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
            >
              <Icon className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-sm text-white/60">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Question Preview */}
      <div className="relative z-10 mt-16 w-full max-w-lg mx-auto">
        <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="text-sm font-semibold text-amber-400">Today&apos;s Question</span>
          </div>
          <p className="text-sm font-medium leading-relaxed mb-4 text-white/90">
            According to Bloom&apos;s Taxonomy, which cognitive level requires students to break
            information into its component parts?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {['A. Knowledge', 'B. Comprehension', 'C. Analysis', 'D. Synthesis'].map((opt) => (
              <div
                key={opt}
                className="text-xs px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg cursor-pointer transition-colors"
              >
                {opt}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 mt-3 text-center">Sign up to see the answer & explanation</p>
        </div>
      </div>
    </section>
  )
}
