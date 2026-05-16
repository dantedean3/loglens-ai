import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Activity,
  Bug,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/analyze",
      label: "Analyze Issue",
      icon: Bug,
    },
    {
      path: "/issues",
      label: "Issue History",
      icon: ListChecks,
    },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen text-slate-100">
      <aside className="fixed left-0 top-0 h-full w-72 overflow-hidden border-r border-slate-800/70 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="absolute -left-8 top-16 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-52 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 mb-8 flex items-center gap-3">
          <div className="relative rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 p-3 shadow-lg shadow-cyan-500/20">
            <Activity className="text-white" size={24} />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              LogLens AI
            </h1>
            <p className="text-sm text-slate-400">AI bug triage dashboard</p>
          </div>
        </div>

        <div className="relative z-10 mb-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 shadow-lg shadow-cyan-500/5">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <Sparkles size={16} />
            Gemini-powered
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Analyze logs, classify severity, generate debugging steps, and save
            triage reports.
          </p>
        </div>

        <nav className="relative z-10 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              location.pathname === link.path ||
              (link.path === "/issues" &&
                location.pathname.startsWith("/issues/"));

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 z-10">
          <div className="mb-3 rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                System Status
              </p>
              <ShieldCheck size={15} className="text-emerald-300" />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
              <p className="text-sm text-slate-300">Analyzer online</p>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              AI analysis services available
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="relative ml-72 min-h-screen overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-24 top-12 h-64 w-64 rounded-full bg-cyan-500/6 blur-3xl" />
          <div className="absolute right-8 top-24 h-72 w-72 rounded-full bg-purple-500/6 blur-3xl" />
          <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}