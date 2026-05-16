import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Cpu,
  Plus,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import StatCard from "../components/StatCard";
import SeverityChart from "../components/SeverityChart";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  async function loadIssues() {
    setLoading(true);

    const { data, error } = await supabase
      .from("issues")
      .select(`
        *,
        issue_analysis (
          severity,
          category,
          confidence
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Dashboard load error:", error);
      setLoading(false);
      return;
    }

    setIssues(data || []);
    setLoading(false);
  }

  const total = issues.length;
  const open = issues.filter((issue) => issue.status === "Open").length;
  const resolved = issues.filter((issue) => issue.status === "Resolved").length;
  const critical = issues.filter((issue) =>
    issue.issue_analysis?.some((analysis) => analysis.severity === "Critical")
  ).length;

  const avgConfidence =
    issues.length === 0
      ? 0
      : Math.round(
          (issues.reduce((sum, issue) => {
            const confidence = issue.issue_analysis?.[0]?.confidence || 0;
            return sum + confidence;
          }, 0) /
            issues.length) *
            100
        );

  const severityStyles = {
    Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    High: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    Critical: "bg-red-500/15 text-red-300 border-red-500/30",
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/60 px-6 py-4 text-slate-300 shadow-lg shadow-black/20">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-[34px] border border-cyan-400/15 bg-slate-950/55 p-8 shadow-2xl shadow-black/25 backdrop-blur xl:col-span-2">
          <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -bottom-20 right-40 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                <BarChart3 size={15} />
                Production triage overview
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-white">
                Dashboard
              </h1>

              <p className="mt-3 text-lg leading-relaxed text-slate-300">
                Monitor AI-analyzed bugs, track open incidents, and review issue
                severity across saved triage reports.
              </p>
            </div>

            <Link
              to="/analyze"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 px-6 py-4 font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:scale-[1.02]"
            >
              <Plus size={18} />
              Analyze New Issue
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-400/10 blur-3xl" />

            <div className="relative z-10 mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 p-3 text-white shadow-lg shadow-fuchsia-500/20">
                <Sparkles size={18} />
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Online
              </span>
            </div>

            <h3 className="relative z-10 text-lg font-semibold text-white">
              AI Engine
            </h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-400">
              Analysis pipeline is active and ready to classify new incidents.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative z-10 mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
                <WandSparkles size={18} />
              </div>

              <span className="text-3xl font-bold text-cyan-300">
                {avgConfidence}%
              </span>
            </div>

            <h3 className="relative z-10 text-lg font-semibold text-white">
              Avg AI Confidence
            </h3>
            <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-400">
              Average confidence across saved triage reports.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Issues"
          value={total}
          subtext="All saved reports"
          icon={BarChart3}
          accent="blue"
        />
        <StatCard
          label="Open"
          value={open}
          subtext="Needs attention"
          icon={Clock3}
          accent="amber"
        />
        <StatCard
          label="Resolved"
          value={resolved}
          subtext="Fixed issues"
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="Critical"
          value={critical}
          subtext="Highest severity"
          icon={AlertTriangle}
          accent="red"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/25 backdrop-blur xl:col-span-2">
          <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-cyan-400/8 blur-3xl" />

          <div className="relative z-10 mb-5 flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Cpu size={14} />
                Recent activity
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Recent Issues
              </h2>
              <p className="text-sm text-slate-400">
                Latest saved AI triage reports.
              </p>
            </div>

            <Link
              to="/issues"
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              View all
            </Link>
          </div>

          <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Environment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>

              <tbody>
                {issues.slice(0, 6).map((issue) => {
                  const analysis = issue.issue_analysis?.[0];

                  return (
                    <tr
                      key={issue.id}
                      className="border-t border-white/10 transition hover:bg-cyan-400/5"
                    >
                      <td className="p-4">
                        <Link
                          to={`/issues/${issue.id}`}
                          className="font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
                        >
                          {issue.title}
                        </Link>
                      </td>

                      <td className="p-4">
                        {analysis?.severity ? (
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              severityStyles[analysis.severity] ||
                              "border-slate-700 bg-slate-800 text-slate-300"
                            }`}
                          >
                            {analysis.severity}
                          </span>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>

                      <td className="p-4 text-slate-300">
                        {analysis?.category || "N/A"}
                      </td>

                      <td className="p-4 text-slate-300">
                        {issue.environment}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">
                          {issue.status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-400">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}

                {issues.length === 0 && (
                  <tr>
                    <td className="p-6 text-slate-400" colSpan="6">
                      No saved issues yet. Analyze and save your first bug.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <SeverityChart issues={issues} />
      </div>
    </div>
  );
}