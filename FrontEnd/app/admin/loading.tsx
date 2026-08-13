export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5">
      <svg
        className="animate-spin"
        width="80"
        height="80"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--brand-primary))" />
            <stop offset="100%" stopColor="hsl(var(--brand-secondary))" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="10" />
        {/* Gradient arc — 270° */}
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="url(#spinnerGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="236 314"
          strokeDashoffset="0"
        />
      </svg>

      <p className="text-sm font-poppins text-gray-400">Loading…</p>
    </div>
  )
}
