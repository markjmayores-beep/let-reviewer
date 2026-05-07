const steps = [
  {
    step: '01',
    title: 'Create Your Free Account',
    description:
      'Sign up in 30 seconds using Google or email. Choose your LET type (Elementary or Secondary) and your target exam date.',
    color: 'bg-indigo-600',
  },
  {
    step: '02',
    title: 'Set Up Your Profile',
    description:
      'Tell us your major (for Secondary) and when your exam is. We personalize your review plan and show you exactly what to focus on.',
    color: 'bg-violet-600',
  },
  {
    step: '03',
    title: 'Review & Practice Daily',
    description:
      'Complete daily challenges, do quick reviews, or start timed mock exams. Answer 5 questions, earn an unlock, keep going. Build your streak.',
    color: 'bg-purple-600',
  },
  {
    step: '04',
    title: 'Track Your Progress',
    description:
      'Watch your LET Readiness Meter climb. See your strongest and weakest subjects. Get targeted practice where you need it most.',
    color: 'bg-indigo-600',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-indigo-600 font-semibold text-sm uppercase tracking-widest">
            Simple Process
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            From signup to exam day — a clear, structured path.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-[calc(50%-1px)] top-12 bottom-12 w-0.5 bg-slate-200" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className={`flex flex-col lg:flex-row items-center gap-8 ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 card-hover">
                    <span className="text-4xl font-black text-slate-100">{step.step}</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Step indicator */}
                <div
                  className={`relative z-10 w-16 h-16 rounded-full ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <span className="text-white font-bold text-lg">{i + 1}</span>
                </div>

                {/* Empty space for alternating layout */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
