import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  ListChecks,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [environmentFilter, setEnvironmentFilter] = useState("All");

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
      console.error("Issue history load error:", error);
      setLoading(false);
      return;
    }

    setIssues(data || []);
    setLoading(false);
  }

  async function updateStatus(issueId, status) {
    const { error } = await supabase
      .from("issues")
      .update({ status })
      .eq("id", issueId);

    if (error) {
      alert(error.message);
      return;
    }

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status } : issue
      )
    );
  }

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const analysis = issue.issue_analysis?.[0];

      const searchMatch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.environment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.tech_stack?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis?.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const severityMatch =
        severityFilter === "All" || analysis?.severity === severityFilter;

      const statusMatch =
        statusFilter === "All" || issue.status === statusFilter;

      const environmentMatch =
        environmentFilter === "All" || issue.environment === environmentFilter;

      return searchMatch && severityMatch && statusMatch && environmentMatch;
    });
  }, [issues, searchTerm, severityFilter, statusFilter, environmentFilter]);

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
          Loading issues...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 grid gap-5 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/25 backdrop-blur xl:col-span-2">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -bottom-16 right-40 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
              <ListChecks size={15} />
              Saved triage reports
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white">
              Issue History
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300">
              Search, filter, and manage saved AI bug triage reports across
              environments, severities, and statuses.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-5 shadow-xl shadow-black/20 backdrop-blur">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 mb-4 flex items-center justify-between">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
              <SlidersHorizontal size={18} />
            </div>

            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              {filteredIssues.length} shown
            </span>
          </div>

          <h3 className="relative z-10 text-lg font-semibold text-white">
            Report Controls
          </h3>

          <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-400">
            Filter issues by severity, status, environment, or keyword.
          </p>

          <Link
            to="/analyze"
            className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
          >
            <Plus size={16} />
            Analyze New Issue
          </Link>
        </div>
      </div>

      <div className="relative mb-5 overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-5 shadow-xl shadow-black/20 backdrop-blur">
        <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-400/8 blur-3xl" />

        <div className="relative z-10 mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
            <Filter size={18} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">Filters</h2>
            <p className="text-sm text-slate-400">
              Showing {filteredIssues.length} of {issues.length} saved issues.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </label>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-11 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400"
                placeholder="Search issues, stack, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Severity
            </label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Ignored</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Environment
            </label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white focus:border-cyan-400"
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
            >
              <option>All</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Local</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-4 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-cyan-400/8 blur-3xl" />

        <div className="relative z-10 mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Saved Issues</h2>
            <p className="text-sm text-slate-400">
              Click an issue title to open the full AI triage report.
            </p>
          </div>
        </div>

        <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-slate-300">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {filteredIssues.map((issue) => {
                const analysis = issue.issue_analysis?.[0];

                return (
                  <tr
                    key={issue.id}
                    className="border-t border-white/10 transition hover:bg-cyan-400/5"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
                      >
                        {issue.title}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3 text-slate-300">
                      {analysis?.category || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {issue.environment}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200 focus:border-cyan-400"
                        value={issue.status}
                        onChange={(e) => updateStatus(issue.id, e.target.value)}
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Ignored</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {filteredIssues.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan="6">
                    No issues match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}