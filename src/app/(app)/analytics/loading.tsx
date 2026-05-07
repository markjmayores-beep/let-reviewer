export default function AnalyticsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-xl mb-1" />
      <div className="h-4 w-64 bg-slate-100 rounded-lg mb-8" />

      {/* Readiness meter */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6 flex items-center justify-center">
        <div className="w-40 h-40 bg-slate-100 rounded-full" />
      </div>

      {/* Subject breakdown */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="h-5 w-40 bg-slate-200 rounded-lg mb-4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <div className="h-3 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-12 bg-slate-200 rounded" />
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div className="h-2 bg-slate-200 rounded-full" style={{ width: `${40 + i * 15}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="h-5 w-36 bg-slate-200 rounded-lg mb-4" />
        <div className="flex items-end gap-2 h-32">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
