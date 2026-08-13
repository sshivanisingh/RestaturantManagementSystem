export default function ProductLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Pulsing rings + icon */}
      <div className="relative flex items-center justify-center mb-8">
        <span
          className="absolute inline-flex h-28 w-28 rounded-full opacity-20 animate-ping"
          style={{ background: "hsl(var(--brand-primary))" }}
        />
        <span
          className="absolute inline-flex h-20 w-20 rounded-full opacity-30 animate-ping [animation-delay:0.3s]"
          style={{ background: "hsl(var(--brand-secondary))" }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
          }}
        >
          <span className="text-4xl">🍽️</span>
        </div>
      </div>

      {/* Text */}
      <h2
        className="text-2xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2"
      >
        Loading Dish…
      </h2>
      <p className="text-sm font-poppins text-gray-400 mb-8">
        Fetching delicious details
      </p>

      {/* Bouncing dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{
              background: "hsl(var(--brand-primary))",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
