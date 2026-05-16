import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/dashboard");
      }
    }

    checkExistingSession();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Enter your email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    let result;

    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
      });
    }

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. You can log in now.");
      setMode("login");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-[34px] border border-cyan-400/15 bg-slate-950/55 p-8 shadow-2xl shadow-black/25 backdrop-blur">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-3 text-white shadow-lg shadow-cyan-500/20">
                <Activity size={26} />
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  LogLens AI
                </h1>
                <p className="text-sm text-slate-400">
                  AI production bug triage
                </p>
              </div>
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
              <Sparkles size={15} />
              Gemini-powered workflow
            </div>

            <h2 className="max-w-xl text-5xl font-bold tracking-tight text-white">
              Turn messy logs into clean engineering reports.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
              Analyze stack traces, classify severity, identify likely root
              causes, save reports, and export triage summaries as markdown.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <WandSparkles className="mb-3 text-cyan-300" size={20} />
                <p className="text-sm font-semibold text-white">AI Analysis</p>
                <p className="mt-1 text-xs text-slate-500">
                  Structured reports
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <ShieldCheck className="mb-3 text-emerald-300" size={20} />
                <p className="text-sm font-semibold text-white">
                  Saved History
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Supabase storage
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <Lock className="mb-3 text-blue-300" size={20} />
                <p className="text-sm font-semibold text-white">Secure Auth</p>
                <p className="mt-1 text-xs text-slate-500">
                  User-scoped data
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[34px] border border-cyan-400/15 bg-slate-950/55 p-8 shadow-2xl shadow-black/25 backdrop-blur">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>

            <p className="mt-2 text-slate-400">
              {mode === "login"
                ? "Sign in to continue analyzing and tracking production issues."
                : "Create an account to save AI triage reports."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-11 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-11 py-3 text-white placeholder:text-slate-600 focus:border-cyan-400"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            {message && (
              <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {message}
              </p>
            )}

            <button
              className="mt-6 text-sm font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
              onClick={() => {
                setMessage("");
                setMode(mode === "login" ? "signup" : "login");
              }}
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}