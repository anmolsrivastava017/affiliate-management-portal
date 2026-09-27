"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

export default function Home() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      if (isRegister) {
        setMessage("Account created successfully. Please sign in.");
        setIsRegister(false);
        setName("");
        setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/affiliate");
        }
      }
    } catch {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between border-r border-white/10 bg-[#091525] p-12 xl:p-16">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/30">
                AP
              </div>
              <div>
                <p className="font-semibold tracking-tight">Affiliate Portal</p>
                <p className="text-xs text-slate-500">Partner Management</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Built for modern partnerships
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
              Grow your reach.
              <span className="block text-blue-400">Track your impact.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
              Manage affiliate applications, performance metrics, targets and
              partnership activity from one centralized platform.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                <p className="text-2xl font-semibold">24/7</p>
                <p className="mt-1 text-xs text-slate-500">Access</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                <p className="text-2xl font-semibold">100%</p>
                <p className="mt-1 text-xs text-slate-500">Centralized</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
                <p className="text-2xl font-semibold">Live</p>
                <p className="mt-1 text-xs text-slate-500">Insights</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-600">
            © 2026 Affiliate Portal
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold">
                  AP
                </div>
                <div>
                  <p className="font-semibold">Affiliate Portal</p>
                  <p className="text-xs text-slate-500">Partner Management</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-medium text-blue-400">
                {isRegister ? "Get started" : "Welcome back"}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                {isRegister ? "Create your account" : "Sign in to your portal"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isRegister
                  ? "Join the affiliate network and start managing your partnership."
                  : "Access your applications, performance and partnership activity."}
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setMessage("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  !isRegister
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setMessage("");
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isRegister
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anmol Srivastava"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/[0.06]"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/[0.06]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:bg-white/[0.06]"
                />
              </div>

              {message && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                  ? "Create Account"
                  : "Sign In"}
                {!loading && <span className="transition group-hover:translate-x-1">→</span>}
              </button>
            </form>

            <p className="mt-7 text-center text-xs leading-5 text-slate-600">
              By continuing, you agree to use the portal responsibly and keep
              your account credentials secure.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}