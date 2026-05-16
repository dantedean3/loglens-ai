import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bug,
  Code2,
  Database,
  FileText,
  Loader2,
  Save,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import AnalysisResult from "../components/AnalysisResult";
import { supabase } from "../lib/supabaseClient";

export default function Analyze() {
  const [form, setForm] = useState({
    title: "",
    source_type: "Stack Trace",
    environment: "Production",
    tech_stack: "React, Flask, PostgreSQL",
    raw_input: "",
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedIssueId, setSavedIssueId] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAnalyze(e) {
    e.preventDefault();

    if (!form.title || !form.raw_input) {
      alert("Add an issue title and paste the error/log text first.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setSavedIssueId(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message = data.details || data.error || "Analysis failed";
        alert(message);
        console.error("Backend error:", data);
        return;
      }

      setAnalysis(data);
    } catch (error) {
      alert("Could not connect to the backend. Make sure Flask is running.");
      console.error("Frontend error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveIssue() {
    if (!analysis) return;

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You need to log in before saving issues.");
        setSaving(false);
        return;
      }

      const { data: issueData, error: issueError } = await supabase
        .from("issues")
        .insert({
          user_id: user.id,
          title: form.title,
          source_type: form.source_type,
          environment: form.environment,
          tech_stack: form.tech_stack,
          raw_input: form.raw_input,
          status: "Open",
        })
        .select()
        .single();

      if (issueError) {
        alert(issueError.message);
        console.error("Issue save error:", issueError);
        setSaving(false);
        return;
      }

      const { data: analysisData, error: analysisError } = await supabase
        .from("issue_analysis")
        .insert({
          issue_id: issueData.id,
          summary: analysis.summary,
          severity: analysis.severity,
          category: analysis.category,
          likely_root_cause: analysis.likely_root_cause,
          affected_component: analysis.affected_component,
          suggested_fix: analysis.suggested_fix,
          confidence: analysis.confidence,
        })
        .select()
        .single();

      if (analysisError) {
        alert(analysisError.message);
        console.error("Analysis save error:", analysisError);
        setSaving(false);
        return;
      }

      const steps = [
        ...(analysis.debugging_steps || []).map((step) => ({
          analysis_id: analysisData.id,
          step_type: "debugging_step",
          step_text: step,
        })),
        ...(analysis.tests_to_add || []).map((test) => ({
          analysis_id: analysisData.id,
          step_type: "test_case",
          step_text: test,
        })),
      ];

      if (steps.length > 0) {
        const { error: stepsError } = await supabase
          .from("analysis_steps")
          .insert(steps);

        if (stepsError) {
          alert(stepsError.message);
          console.error("Steps save error:", stepsError);
          setSaving(false);
          return;
        }
      }

      setSavedIssueId(issueData.id);
    } catch (error) {
      alert("Something went wrong while saving the issue.");
      console.error("Save issue error:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-5 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/25 backdrop-blur xl:col-span-2">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -bottom-16 right-40 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
              <Sparkles size={15} />
              Gemini-powered analysis
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white">
              Analyze Issue
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300">
              Paste a log, stack trace, or bug report and generate a structured
              production triage report with severity, root cause, debugging
              steps, and test recommendations.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-5 shadow-xl shadow-black/20 backdrop-blur">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 mb-4 flex items-center justify-between">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
              <TerminalSquare size={18} />
            </div>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Ready
            </span>
          </div>

          <h3 className="relative z-10 text-lg font-semibold text-white">
            Triage Pipeline
          </h3>

          <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-400">
            Detect backend errors, database issues, API failures, auth problems,
            and deployment bugs.
          </p>

          <div className="relative z-10 mt-4 grid grid-cols-4 gap-2">
            <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
              <Bug size={18} />
            </div>
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
              <Code2 size={18} />
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
              <Database size={18} />
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-300">
              <AlertTriangle size={18} />
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleAnalyze}
        className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-5 shadow-2xl shadow-black/25 backdrop-blur"
      >
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/8 blur-3xl" />

        <div className="relative z-10 mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">
              Issue Intake Form
            </h2>
            <p className="text-sm text-slate-400">
              Add enough context for the AI to produce a useful triage report.
            </p>
          </div>
        </div>

        <div className="relative z-10 mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Issue Title
          </label>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Example: Login API returns 500 error"
          />
        </div>

        <div className="relative z-10 mb-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Source Type
            </label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400"
              value={form.source_type}
              onChange={(e) => updateField("source_type", e.target.value)}
            >
              <option>Stack Trace</option>
              <option>Log</option>
              <option>Bug Report</option>
              <option>User Complaint</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Environment
            </label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white focus:border-cyan-400"
              value={form.environment}
              onChange={(e) => updateField("environment", e.target.value)}
            >
              <option>Production</option>
              <option>Staging</option>
              <option>Local</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Tech Stack
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400"
              value={form.tech_stack}
              onChange={(e) => updateField("tech_stack", e.target.value)}
              placeholder="Example: React, Flask, PostgreSQL"
            />
          </div>
        </div>

        <div className="relative z-10">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Raw Log / Stack Trace / Bug Report
          </label>
          <textarea
            className="min-h-52 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-cyan-400"
            value={form.raw_input}
            onChange={(e) => updateField("raw_input", e.target.value)}
            placeholder="Paste error log here..."
          />
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-3">
          <button
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze Bug
              </>
            )}
          </button>

          <p className="text-sm text-slate-500">
            Results usually generate in a few seconds.
          </p>
        </div>
      </form>

      <AnalysisResult analysis={analysis} />

      {analysis && (
        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={handleSaveIssue}
            disabled={saving || savedIssueId}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02] disabled:opacity-60"
          >
            <Save size={18} />
            {savedIssueId ? "Saved" : saving ? "Saving..." : "Save Issue"}
          </button>

          {savedIssueId && (
            <Link
              to={`/issues/${savedIssueId}`}
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
            >
              View saved issue
            </Link>
          )}
        </div>
      )}
    </div>
  );
}