export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const severityStyles = {
    Low: "bg-green-500/20 text-green-300 border-green-500/30",
    Medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    High: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Critical: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Triage Report</h2>
          <p className="text-slate-400">
            Structured analysis generated from the issue details.
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${
            severityStyles[analysis.severity] || "bg-slate-700 text-slate-200"
          }`}
        >
          {analysis.severity}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl bg-slate-950 p-4">
          <h3 className="mb-2 font-semibold text-white">Summary</h3>
          <p className="text-slate-300">{analysis.summary}</p>
        </section>

        <section className="rounded-xl bg-slate-950 p-4">
          <h3 className="mb-2 font-semibold text-white">Category</h3>
          <p className="text-slate-300">{analysis.category}</p>
        </section>

        <section className="rounded-xl bg-slate-950 p-4">
          <h3 className="mb-2 font-semibold text-white">Likely Root Cause</h3>
          <p className="text-slate-300">{analysis.likely_root_cause}</p>
        </section>

        <section className="rounded-xl bg-slate-950 p-4">
          <h3 className="mb-2 font-semibold text-white">Affected Component</h3>
          <p className="text-slate-300">{analysis.affected_component}</p>
        </section>
      </div>

      <section className="mt-4 rounded-xl bg-slate-950 p-4">
        <h3 className="mb-2 font-semibold text-white">Suggested Fix</h3>
        <p className="text-slate-300">{analysis.suggested_fix}</p>
      </section>

      <section className="mt-4 rounded-xl bg-slate-950 p-4">
        <h3 className="mb-3 font-semibold text-white">Debugging Steps</h3>
        <ol className="list-decimal space-y-2 pl-5 text-slate-300">
          {analysis.debugging_steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-4 rounded-xl bg-slate-950 p-4">
        <h3 className="mb-3 font-semibold text-white">Tests to Add</h3>
        <ul className="list-disc space-y-2 pl-5 text-slate-300">
          {analysis.tests_to_add.map((test, index) => (
            <li key={index}>{test}</li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-sm text-slate-500">
        Confidence: {Math.round(analysis.confidence * 100)}%
      </p>
    </div>
  );
}