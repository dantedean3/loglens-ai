import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bug,
  Clipboard,
  ClipboardCheck,
  FileCode2,
  FlaskConical,
  Layers,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssue();
  }, [id]);

  async function loadIssue() {
    setLoading(true);

    const { data: issueData, error: issueError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", id)
      .single();

    if (issueError) {
      console.error("Issue load error:", issueError);
      setLoading(false);
      return;
    }

    setIssue(issueData);

    const { data: analysisData, error: analysisError } = await supabase
      .from("issue_analysis")
      .select("*")
      .eq("issue_id", id)
      .single();

    if (analysisError) {
      console.error("Analysis load error:", analysisError);
      setLoading(false);
      return;
    }

    setAnalysis(analysisData);

    const { data: stepData, error: stepsError } = await supabase
      .from("analysis_steps")
      .select("*")
      .eq("analysis_id", analysisData.id)
      .order("id", { ascending: true });

    if (stepsError) {
      console.error("Steps load error:", stepsError);
    } else {
      setSteps(stepData || []);
    }

    setLoading(false);
  }

  async function updateStatus(status) {
    const { error } = await supabase
      .from("issues")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setIssue((prev) => ({ ...prev, status }));
  }

  async function deleteIssue() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue? This will also delete the saved AI analysis and steps."
    );

    if (!confirmed) return;

    const { error } = await supabase.from("issues").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/issues");
  }

  const debuggingSteps = steps.filter(
    (step) => step.step_type === "debugging_step"
  );

  const testCases = steps.filter((step) => step.step_type === "test_case");

  function copyMarkdownReport() {
    if (!issue || !analysis) return;

    const debuggingText =
      debuggingSteps.length > 0
        ? debuggingSteps
            .map((step, index) => `${index + 1}. ${step.step_text}`)
            .join("\n")
        : "No debugging steps saved.";

    const testsText =
      testCases.length > 0
        ? testCases.map((test) => `- ${test.step_text}`).join("\n")
        : "No test cases saved.";

    const markdown = `# ${issue.title}

## Status
${issue.status}

## Severity
${analysis.severity}

## Environment
${issue.environment}

## Source Type
${issue.source_type}

## Tech Stack
${issue.tech_stack || "Not provided"}

## Summary
${analysis.summary}

## Category
${analysis.category}

## Likely Root Cause
${analysis.likely_root_cause}

## Affected Component
${analysis.affected_component}

## Suggested Fix
${analysis.suggested_fix}

## Debugging Steps
${debuggingText}

## Tests to Add
${testsText}

## Original Input
\`\`\`
${issue.raw_input}
\`\`\`

## AI Confidence
${Math.round((analysis.confidence || 0) * 100)}%
`;

    navigator.clipboard.writeText(markdown);
    alert("Markdown report copied to clipboard.");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-cyan-400/15 bg-slate-950/60 px-6 py-4 text-slate-300 shadow-lg shadow-black/20">
          Loading issue...
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-8 shadow-2xl shadow-black/25 backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Issue not found</h1>
        <p className="mt-2 text-slate-400">
          This issue may not exist or you may not have access to it.
        </p>

        <Link
          to="/issues"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Back to Issue History
        </Link>
      </div>
    );
  }

  const severityStyles = {
    Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    High: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    Critical: "bg-red-500/15 text-red-300 border-red-500/30",
  };

  return (
    <div>
      <div className="relative mb-5 overflow-hidden rounded-[26px] border border-cyan-400/15 bg-slate-950/55 p-5 shadow-xl shadow-black/20 backdrop-blur">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute -bottom-16 right-40 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              >
                <ArrowLeft size={16} />
                Back to Issue History
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                <Bug size={15} />
                AI triage report
              </span>

              {analysis?.severity && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    severityStyles[analysis.severity] ||
                    "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  {analysis.severity}
                </span>
              )}

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                {issue.status}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              {issue.title}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {issue.environment} · {issue.source_type} ·{" "}
              {new Date(issue.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyMarkdownReport}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
            >
              <Clipboard size={16} />
              Copy Markdown
            </button>

            <select
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-slate-200 focus:border-cyan-400"
              value={issue.status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Ignored</option>
            </select>

            <button
              onClick={deleteIssue}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {analysis && (
            <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/25 backdrop-blur">
              <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-400/8 blur-3xl" />

              <div className="relative z-10 mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    AI Triage Report
                  </h2>
                  <p className="text-sm text-slate-400">
                    Structured analysis generated from the saved issue.
                  </p>
                </div>
              </div>

              <div className="relative z-10 grid gap-4 md:grid-cols-2">
                <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="mb-2 font-semibold text-white">Summary</h3>
                  <p className="text-slate-300">{analysis.summary}</p>
                </section>

                <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="mb-2 font-semibold text-white">Category</h3>
                  <p className="text-slate-300">{analysis.category}</p>
                </section>

                <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="mb-2 font-semibold text-white">
                    Likely Root Cause
                  </h3>
                  <p className="text-slate-300">
                    {analysis.likely_root_cause}
                  </p>
                </section>

                <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="mb-2 font-semibold text-white">
                    Affected Component
                  </h3>
                  <p className="text-slate-300">
                    {analysis.affected_component}
                  </p>
                </section>
              </div>

              <section className="relative z-10 mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <h3 className="mb-2 font-semibold text-white">Suggested Fix</h3>
                <p className="text-slate-300">{analysis.suggested_fix}</p>
              </section>

              <p className="relative z-10 mt-4 text-sm text-slate-500">
                Confidence: {Math.round((analysis.confidence || 0) * 100)}%
              </p>
            </div>
          )}

          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                <Layers size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Debugging Steps
                </h2>
                <p className="text-sm text-slate-400">
                  Ordered checks to reproduce, isolate, and resolve the issue.
                </p>
              </div>
            </div>

            {debuggingSteps.length > 0 ? (
              <ol className="list-decimal space-y-3 pl-5 text-slate-300">
                {debuggingSteps.map((step) => (
                  <li key={step.id}>{step.step_text}</li>
                ))}
              </ol>
            ) : (
              <p className="text-slate-400">No debugging steps saved.</p>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                <FlaskConical size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Tests to Add
                </h2>
                <p className="text-sm text-slate-400">
                  Regression checks to prevent the issue from coming back.
                </p>
              </div>
            </div>

            {testCases.length > 0 ? (
              <ul className="list-disc space-y-3 pl-5 text-slate-300">
                {testCases.map((test) => (
                  <li key={test.id}>{test.step_text}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No test cases saved.</p>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Issue Details
            </h2>

            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-slate-500">Status</p>
                <p className="mt-1 text-slate-200">{issue.status}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-slate-500">Environment</p>
                <p className="mt-1 text-slate-200">{issue.environment}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-slate-500">Source Type</p>
                <p className="mt-1 text-slate-200">{issue.source_type}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-slate-500">Tech Stack</p>
                <p className="mt-1 text-slate-200">
                  {issue.tech_stack || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                <FileCode2 size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Original Input
                </h2>
                <p className="text-sm text-slate-400">
                  Raw log, stack trace, or bug report.
                </p>
              </div>
            </div>

            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-300">
              {issue.raw_input}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}