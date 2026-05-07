export default function AdminLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        <div>
          <div className="h-7 w-32 bg-slate-200 rounded-lg mb-1" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="w-9 h-9 bg-slate-200 rounded-lg mb-3" />
            <div className="h-7 w-12 bg-slate-200 rounded-lg mb-2" />
            <div className="h-3 w-20 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 w-36 bg-slate-200 rounded-lg mb-2" />
              <div className="h-3 w-full bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
