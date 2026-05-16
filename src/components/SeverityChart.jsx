import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Radar } from "lucide-react";

export default function SeverityChart({ issues }) {
  const severities = ["Low", "Medium", "High", "Critical"];

  const colorMap = {
    Low: "#10b981",
    Medium: "#f59e0b",
    High: "#38bdf8",
    Critical: "#ef4444",
  };

  const data = severities.map((severity) => {
    const count = issues.filter((issue) =>
      issue.issue_analysis?.some((analysis) => analysis.severity === severity)
    ).length;

    return {
      severity,
      count,
      fill: colorMap[severity],
    };
  });

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/25 backdrop-blur">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative z-10 mb-5 flex items-start justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <Radar size={14} />
            Severity scan
          </div>

          <h2 className="text-2xl font-semibold text-white">
            Issues by Severity
          </h2>
          <p className="text-sm text-slate-400">
            Breakdown of saved AI triage reports.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
          <Activity size={18} />
        </div>
      </div>

      <div className="relative z-10 mb-5 grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div
            key={item.severity}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shadow"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs font-medium text-slate-400">
                {item.severity}
              </span>
            </div>
            <p className="mt-1 text-xl font-semibold text-white">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis dataKey="severity" stroke="#94a3b8" tickLine={false} />
            <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(34, 211, 238, 0.08)" }}
              contentStyle={{
                backgroundColor: "#06131f",
                border: "1px solid rgba(34, 211, 238, 0.25)",
                borderRadius: "16px",
                color: "#e5faff",
                boxShadow: "0 20px 40px rgba(0,0,0,.35)",
              }}
            />
            <Bar dataKey="count" radius={[12, 12, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.severity} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}