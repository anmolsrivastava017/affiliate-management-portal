"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AffiliateDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);

    if (user.role !== "affiliate") {
      router.push("/admin");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${API_URL}/api/affiliate/dashboard`, {
        headers,
        cache: "no-store",
      }).then((res) => res.json()),
      fetch(`${API_URL}/api/activities/me`, {
        headers,
        cache: "no-store",
      }).then((res) => res.json()),
    ])
      .then(([affiliateData, activityData]) => {
setData(
  affiliateData.affiliate
    ? {
        ...affiliateData.affiliate,
        name: affiliateData.affiliate.userId?.name || "Partner",
      }
    : null
);    setActivities(activityData.activities || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const progress = (actual: number, target: number) =>
    target ? Math.min(100, Math.round((actual / target) * 100)) : 0;

  const conversionRate = data?.clicks
    ? ((data.conversions / data.clicks) * 100).toFixed(2)
    : "0.00";

  const copyReferralCode = async () => {
    if (!data?.referralCode) return;
    await navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090617] text-white">
        <div className="flex flex-col items-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-400" />
          </div>
          <p className="mt-5 text-sm text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090617] px-5 text-white">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-150px] right-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="relative w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.055] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl shadow-xl shadow-violet-500/20">
            ✦
          </div>

          <h1 className="mt-7 text-2xl font-bold tracking-tight">
            Become an Affiliate Partner
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Complete your application to unlock your partner dashboard,
            performance insights and referral tools.
          </p>

          <button
            onClick={() => router.push("/affiliate/application")}
            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-4 text-sm font-semibold shadow-xl shadow-violet-600/20 transition duration-200 hover:-translate-y-1 hover:shadow-violet-500/30 active:scale-[0.97]"
          >
            Start Application
          </button>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Clicks",
      value: data.clicks.toLocaleString("en-IN"),
      subtitle: "Referral traffic",
      icon: "↗",
      gradient: "from-violet-500/20 to-purple-500/5",
      iconBg: "bg-violet-500/15",
      iconText: "text-violet-300",
      border: "hover:border-violet-400/30",
    },
    {
      label: "Conversions",
      value: data.conversions.toLocaleString("en-IN"),
      subtitle: "Successful actions",
      icon: "✓",
      gradient: "from-cyan-500/20 to-blue-500/5",
      iconBg: "bg-cyan-500/15",
      iconText: "text-cyan-300",
      border: "hover:border-cyan-400/30",
    },
    {
      label: "Revenue Generated",
      value: `₹${data.revenue.toLocaleString("en-IN")}`,
      subtitle: "Total generated revenue",
      icon: "₹",
      gradient: "from-fuchsia-500/20 to-pink-500/5",
      iconBg: "bg-fuchsia-500/15",
      iconText: "text-fuchsia-300",
      border: "hover:border-fuchsia-400/30",
    },
    {
      label: "Commission Earned",
      value: `₹${data.commissionEarned.toLocaleString("en-IN")}`,
      subtitle: "Your partner earnings",
      icon: "$",
      gradient: "from-emerald-500/20 to-teal-500/5",
      iconBg: "bg-emerald-500/15",
      iconText: "text-emerald-300",
      border: "hover:border-emerald-400/30",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#090617] text-white selection:bg-violet-500/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-violet-600/[0.12] blur-[130px]" />
        <div className="absolute right-[-180px] top-[15%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.08] blur-[130px]" />
        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/[0.06] blur-[130px]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-white/[0.08] bg-[#0b081b]/90 backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="flex h-[82px] items-center border-b border-white/[0.07] px-6">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-sm font-black shadow-lg shadow-violet-600/25">
            AP
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b081b] bg-emerald-400" />
          </div>

          <div className="ml-3">
            <p className="text-sm font-bold tracking-tight">AffiliateOS</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Partner Network
            </p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Partner Menu
          </p>

          <nav className="mt-3 space-y-2">
            <div className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-violet-400/10 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/[0.05] px-3 py-3.5 text-sm font-semibold text-violet-200 shadow-inner">
              <div className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                ◫
              </span>
              Dashboard
            </div>

            <button
              onClick={() => router.push("/affiliate/application")}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm text-slate-400 transition duration-200 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-slate-500 transition group-hover:bg-violet-500/10 group-hover:text-violet-300">
                ◈
              </span>
              My Application
            </button>

            <button
              onClick={() => router.push("/affiliate/activity")}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm text-slate-400 transition duration-200 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-slate-500 transition group-hover:bg-cyan-500/10 group-hover:text-cyan-300">
                ◷
              </span>
              Activity
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.08] to-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                ✓
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300">
                  Active Partner
                </p>
                <p className="mt-1 truncate text-[10px] tracking-wider text-violet-400">
                  {data.referralCode}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-500 transition duration-200 hover:bg-red-500/[0.08] hover:text-red-400 active:scale-[0.98]"
          >
            <span>↪</span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="relative lg:ml-[270px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090617]/75 backdrop-blur-2xl">
          <div className="flex min-h-[82px] items-center justify-between px-5 sm:px-8 xl:px-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Partner Workspace
                </p>
              </div>

              <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                Performance Overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-4 py-2 text-xs font-semibold text-emerald-400 sm:block">
                ● Active Partner
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/20 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-sm font-bold text-violet-200">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8 xl:p-10">
          <section className="relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-gradient-to-br from-violet-600/[0.17] via-purple-500/[0.08] to-cyan-500/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-9">
            <div className="absolute right-[-80px] top-[-130px] h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[90px]" />
            <div className="absolute bottom-[-100px] left-[35%] h-[250px] w-[250px] rounded-full bg-cyan-500/[0.08] blur-[80px]" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.08] px-3.5 py-2 text-[11px] font-semibold text-violet-300">
                  <span>✦</span>
                  Affiliate Partner
                  <span className="h-1 w-1 rounded-full bg-violet-400" />
                  Active
                </div>

                <div>
  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/70">
    Your Affiliate Workspace
  </p>

  <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
    Welcome back,{" "}
    <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
      {data.name || "Partner"}
    </span>{" "}
    👋
  </h2>

  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
    Your affiliate journey is live. Track your performance, monitor your
    goals, and keep growing your impact from one place.
  </p>
</div>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                  Everything you need to understand your affiliate performance,
                  track your goals and monitor your partner earnings.
                </p>
              </div>

              <button
                onClick={copyReferralCode}
                className="group shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-left backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-black/30 active:scale-[0.97]"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Your Referral Code
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xl font-black tracking-[0.15em] text-violet-300">
                    {data.referralCode}
                  </p>
                  <span className="text-xs text-slate-600 transition group-hover:text-violet-300">
                    {copied ? "✓" : "Copy"}
                  </span>
                </div>
              </button>
            </div>
          </section>

          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <button
                key={metric.label}
                className={`group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-gradient-to-br ${metric.gradient} p-5 text-left transition duration-300 hover:-translate-y-1.5 hover:scale-[1.015] ${metric.border} hover:shadow-2xl hover:shadow-black/20 active:translate-y-0 active:scale-[0.975]`}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.025] blur-2xl transition duration-500 group-hover:scale-150" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      {metric.label}
                    </p>

                    <p className="mt-3 text-[27px] font-bold tracking-tight">
                      {metric.value}
                    </p>

                    <p className="mt-2 text-[10px] text-slate-600">
                      {metric.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.iconBg} ${metric.iconText} text-sm font-bold transition duration-300 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    {metric.icon}
                  </div>
                </div>

                <div className="relative mt-5 h-px w-full overflow-hidden bg-white/[0.05]">
                  <div className="absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-500 group-hover:translate-x-[220px]" />
                </div>
              </button>
            ))}
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-6 shadow-xl shadow-black/10 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Monthly Goals</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Your progress toward this month's targets.
                  </p>
                </div>

                <div className="rounded-full border border-violet-400/10 bg-violet-400/[0.06] px-3 py-1.5 text-[10px] font-semibold text-violet-300">
                  Monthly
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {[
                  {
                    label: "Clicks",
                    actual: data.clicks,
                    target: data.monthlyClickTarget,
                    icon: "↗",
                  },
                  {
                    label: "Conversions",
                    actual: data.conversions,
                    target: data.monthlyConversionTarget,
                    icon: "✓",
                  },
                  {
                    label: "Revenue",
                    actual: data.revenue,
                    target: data.monthlyRevenueTarget,
                    icon: "₹",
                  },
                ].map((item) => {
                  const value = progress(item.actual, item.target);

                  return (
                    <div key={item.label} className="group">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035] text-xs text-slate-400 transition duration-200 group-hover:border-violet-400/15 group-hover:bg-violet-500/10 group-hover:text-violet-300">
                            {item.icon}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-300">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-slate-600">
                              {item.actual.toLocaleString("en-IN")} achieved
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-400">
                            {item.actual.toLocaleString("en-IN")}{" "}
                            <span className="text-slate-700">/</span>{" "}
                            {item.target.toLocaleString("en-IN")}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold text-violet-400">
                            {value}%
                          </p>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400 shadow-lg shadow-violet-500/20 transition-all duration-1000 ease-out"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[28px] border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.12] via-fuchsia-500/[0.05] to-cyan-500/[0.04] p-6 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-500/10 active:scale-[0.99] sm:p-7">
              <div className="absolute right-[-70px] top-[-70px] h-52 w-52 rounded-full bg-violet-500/10 blur-[70px] transition duration-500 group-hover:scale-150 group-hover:bg-violet-500/15" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                      Performance
                    </p>
                    <h3 className="mt-2 text-base font-bold">
                      Conversion Rate
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-violet-500/20">
  %
</div>
                </div>

                <div className="mt-7 flex items-center gap-6">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#d946ef,#22d3ee,#8b5cf6)] p-[7px] shadow-xl shadow-violet-500/10">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#100a20]">
                      <div className="text-center">
                        <p className="text-2xl font-black">{conversionRate}%</p>
                        <p className="text-[9px] text-slate-600">RATE</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-300">
                      Click-to-conversion
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Percentage of your referral clicks that resulted in a
                      conversion.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Clicks
                    </p>
                    <p className="mt-2 text-lg font-bold">
                      {data.clicks.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Converted
                    </p>
                    <p className="mt-2 text-lg font-bold text-cyan-300">
                      {data.conversions.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="relative overflow-hidden rounded-[28px] border border-fuchsia-400/10 bg-gradient-to-br from-fuchsia-500/[0.1] via-violet-500/[0.05] to-white/[0.02] p-6 sm:p-7">
              <div className="absolute bottom-[-80px] right-[-50px] h-52 w-52 rounded-full bg-fuchsia-500/10 blur-[70px]" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300/70">
                      Partner Identity
                    </p>
                    <h3 className="mt-2 text-base font-bold">
                      Referral Code
                    </h3>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold text-emerald-400">
                    ACTIVE
                  </span>
                </div>

                <button
                  onClick={copyReferralCode}
                  className="group mt-7 w-full rounded-2xl border border-white/[0.08] bg-[#0d081a]/70 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/20 hover:shadow-xl hover:shadow-fuchsia-500/5 active:scale-[0.98]"
                >
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600">
                    Unique affiliate identifier
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-2xl font-black tracking-[0.16em] text-transparent bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text">
                      {data.referralCode}
                    </p>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-xs text-slate-500 transition group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-300">
                      {copied ? "✓" : "⧉"}
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-violet-400/10 bg-violet-500/[0.04] p-4">
  <div className="flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
      ↗
    </div>

    <div>
      <p className="text-xs font-semibold text-slate-300">
        Share & start earning
      </p>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
        Share your unique referral code with your audience and track your
        affiliate performance from this dashboard.
      </p>
    </div>
  </div>
</div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
  <p className="text-[10px] text-slate-600">
    {copied ? "Copied to clipboard" : "Click to copy code"}
  </p>

  <span className="text-[10px] font-semibold text-violet-400/70 transition duration-200 group-hover:text-violet-300">
    {copied ? "✓ Copied" : "Copy"}
  </span>
</div>
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Recent Activity</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Your latest partner activity.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/affiliate/activity")}
                  className="rounded-xl border border-white/[0.07] px-3 py-2 text-[10px] font-semibold text-slate-500 transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.05] hover:text-cyan-300 active:scale-95"
                >
                  View all
                </button>
              </div>

              <div className="mt-6">
                {activities.length ? (
                  <div className="relative space-y-3">
                    {activities.slice(0, 4).map((item, index) => (
                      <div
                        key={item._id}
                        className="group flex gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.018] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/10 hover:bg-white/[0.035]"
                      >
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-xs text-violet-300">
                          {index === 0 ? "✦" : "✓"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-5 text-slate-300">
                            {item.description}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-600">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.08] py-10 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] text-slate-600">
                      ◷
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-400">
                      No activity yet
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Your activity will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="mt-10 border-t border-white/[0.05] py-6 text-center text-[10px] text-slate-700">
            AffiliateOS · Partner Performance Workspace
          </footer>
        </div>
      </main>
    </div>
  );
}
