export default function AppLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-slate-200 rounded-xl mb-2" />
      <div className="h-4 w-72 bg-slate-100 rounded-lg mb-8" />

      {/* Cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 bg-slate-200 rounded-lg mb-3" />
            <div className="h-7 w-16 bg-slate-200 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Content block */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-4">
        <div className="h-5 w-32 bg-slate-200 rounded-lg mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="h-5 w-40 bg-slate-200 rounded-lg mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
