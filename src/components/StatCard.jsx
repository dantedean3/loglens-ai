export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  accent = "blue",
}) {
  const styles = {
    blue: {
      card: "from-sky-500/15 via-blue-500/8 to-transparent",
      icon: "from-sky-400 to-blue-500",
      text: "text-sky-300",
      border: "border-sky-400/25",
      shadow: "shadow-sky-500/15",
    },
    amber: {
      card: "from-amber-500/15 via-orange-500/8 to-transparent",
      icon: "from-amber-400 to-orange-500",
      text: "text-amber-300",
      border: "border-amber-400/25",
      shadow: "shadow-amber-500/15",
    },
    green: {
      card: "from-emerald-500/15 via-green-500/8 to-transparent",
      icon: "from-emerald-400 to-green-500",
      text: "text-emerald-300",
      border: "border-emerald-400/25",
      shadow: "shadow-emerald-500/15",
    },
    red: {
      card: "from-red-500/15 via-rose-500/8 to-transparent",
      icon: "from-red-400 to-rose-500",
      text: "text-red-300",
      border: "border-red-400/25",
      shadow: "shadow-red-500/15",
    },
  };

  const current = styles[accent] || styles.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border ${current.border} bg-slate-950/55 p-5 shadow-xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-slate-950/70`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${current.card}`} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-slate-300">{label}</p>

          {Icon && (
            <div
              className={`rounded-2xl bg-gradient-to-br ${current.icon} p-2.5 text-white shadow-lg ${current.shadow}`}
            >
              <Icon size={18} />
            </div>
          )}
        </div>

        <h2 className="text-4xl font-bold tracking-tight text-white">{value}</h2>

        {subtext && <p className="mt-2 text-sm text-slate-400">{subtext}</p>}
      </div>
    </div>
  );
}