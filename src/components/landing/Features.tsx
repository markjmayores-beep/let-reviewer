import {
  Brain,
  Timer,
  TrendingUp,
  WifiOff,
  Flame,
  Shield,
  Target,
  BookMarked,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'Smart Weak Topic Detection',
    description:
      'Our system automatically identifies your weakest topics and recommends focused review sessions. Stop wasting time on what you already know.',
  },
  {
    icon: Timer,
    color: 'bg-amber-100 text-amber-600',
    title: 'Timed Mock Board Exams',
    description:
      'Full-length LET simulations with real exam structure, countdown timer, and detailed score analysis. Feel the actual pressure before exam day.',
  },
  {
    icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'LET Readiness Meter',
    description:
      'Real-time readiness percentage based on your accuracy, consistency, and mock scores. Know exactly where you stand before the big day.',
  },
  {
    icon: WifiOff,
    color: 'bg-sky-100 text-sky-600',
    title: 'Works Offline',
    description:
      'No internet? No problem. Continue reviewing anywhere — commuting, in province, or with weak signal. Your progress syncs when you reconnect.',
  },
  {
    icon: Flame,
    color: 'bg-orange-100 text-orange-600',
    title: 'Gamified & Addictive',
    description:
      'Streaks, leaderboards, survival mode, daily challenges, and XP points. Makes reviewing feel like a game, not a chore.',
  },
  {
    icon: Shield,
    color: 'bg-purple-100 text-purple-600',
    title: 'Expert-Verified Questions',
    description:
      'Every question is reviewed by licensed teachers. Accurate answers, clear explanations, and content aligned with PRC LET coverage.',
  },
  {
    icon: Target,
    color: 'bg-rose-100 text-rose-600',
    title: 'Spaced Repetition',
    description:
      'Science-backed algorithm resurfaces questions you got wrong at optimal intervals. Proven to improve long-term retention significantly.',
  },
  {
    icon: BookMarked,
    color: 'bg-teal-100 text-teal-600',
    title: 'Bookmarks & Notes',
    description:
      'Save difficult questions, add personal notes, and build your own cheat sheet. Review your bookmarks anytime before the exam.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">
            Why LET Reviewer PH
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
            Everything You Need to Pass
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Built specifically for Filipino teachers taking the LET. Not a generic quiz app —
            a purpose-built exam preparation system.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, color, title, description }) => (
            <div
              key={title}
              className="card-hover bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
