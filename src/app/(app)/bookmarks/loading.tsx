export default function BookmarksLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-36 bg-slate-200 rounded-xl mb-1" />
      <div className="h-4 w-52 bg-slate-100 rounded-lg mb-8" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="h-4 w-full bg-slate-200 rounded-lg mb-2" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
