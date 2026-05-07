export default function LeaderboardLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-40 bg-slate-200 rounded-xl mb-1" />
      <div className="h-4 w-60 bg-slate-100 rounded-lg mb-8" />
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50">
            <div className="w-7 h-5 bg-slate-200 rounded" />
            <div className="w-9 h-9 bg-slate-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded-lg mb-1" />
              <div className="h-3 w-20 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-5 w-16 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
