import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Ma. Cristina Santos',
    role: 'Elementary LET Passer • March 2025',
    score: '82%',
    avatar: 'CS',
    color: 'bg-indigo-500',
    text: 'I failed my first LET attempt. After 3 months using this reviewer, I passed with 82%! The weak topic detection was a game-changer — it showed me exactly what to focus on.',
  },
  {
    name: 'John Mark Reyes',
    role: 'Secondary (Math) LET Passer • Sept 2025',
    score: '88%',
    avatar: 'JR',
    color: 'bg-violet-500',
    text: 'The mock board exams felt exactly like the real LET. I did 10 full mock exams in the last week before my exam. Passed on first try with 88%. Worth every centavo!',
  },
  {
    name: 'Lovely Dela Cruz',
    role: 'Elementary LET Passer • March 2025',
    score: '79%',
    avatar: 'LD',
    color: 'bg-rose-500',
    text: 'I reviewed during my commute every day using offline mode. The gamification kept me consistent — I had a 45-day streak before my exam! The explanations are so clear.',
  },
  {
    name: 'Ryan Mendoza',
    role: 'Secondary (English) LET Passer • Sept 2025',
    score: '91%',
    avatar: 'RM',
    color: 'bg-emerald-500',
    text: 'Survival Mode is addicting! It made reviewing fun. I would spend 2-3 hours without noticing. The leaderboard competition with my classmates also kept me motivated.',
  },
  {
    name: 'Ana Patricia Lim',
    role: 'Elementary LET Passer • March 2026',
    score: '85%',
    avatar: 'AL',
    color: 'bg-amber-500',
    text: 'As a working teacher, I only had evenings to review. The daily 15-minute challenge was perfect for my schedule. The readiness meter showed 87% on exam eve — I passed at 85%!',
  },
  {
    name: 'Francis Villanueva',
    role: 'Secondary (Science) LET Topnotcher',
    score: '94%',
    avatar: 'FV',
    color: 'bg-cyan-500',
    text: 'Topped our batch using this reviewer. The hard-difficulty questions are genuinely topnotcher-level. If you can consistently score 80%+ on hard mode, you\'re ready for the exam.',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">
            Success Stories
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
            Real Passers. Real Results.
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Over 12,000 teachers have used LET Reviewer PH to prepare for their licensure exam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card-hover bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 truncate">{t.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-black text-indigo-600">{t.score}</span>
                  <p className="text-xs text-slate-400">LET Score</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
