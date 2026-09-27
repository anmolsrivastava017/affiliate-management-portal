"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

type Affiliate = {
  _id: string;
  userId?: {
    name?: string;
    email?: string;
  };
  referralCode: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commissionEarned: number;
  monthlyClickTarget: number;
  monthlyConversionTarget: number;
  monthlyRevenueTarget: number;
};

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconDocs = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h6" />
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconLogOut = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconSettings = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.48a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 10a1.7 1.7 0 0 0-.34-1.88L9 8.06l1.42-1.42.06.06A1.7 1.7 0 0 0 12.36 7.04 1.7 1.7 0 0 0 13.4 5.48V5h2v.48a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.03H21v2h-.04A1.7 1.7 0 0 0 19.4 15Z" />
  </svg>
);

const IconX = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="m7 15 3-4 3 2 4-6" />
  </svg>
);

export default function AdminAffiliatesPage() {
  const router = useRouter();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Affiliate | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [metrics, setMetrics] = useState({
    clicks: "",
    conversions: "",
    revenue: "",
    commissionEarned: "",
  });

  const [targets, setTargets] = useState({
    monthlyClickTarget: "",
    monthlyConversionTarget: "",
    monthlyRevenueTarget: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "admin") {
        router.push("/affiliate");
        return;
      }

      fetchAffiliates();
    } catch {
      router.push("/");
    }
  }, [router]);

  const fetchAffiliates = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/admin/affiliates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load affiliates");
      }

      setAffiliates(data.affiliates || []);
    } catch (err: any) {
      setError(err.message || "Unable to load affiliates");
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (affiliate: Affiliate) => {
    setSelected(affiliate);
    setMessage("");
    setError("");

    setMetrics({
      clicks: String(affiliate.clicks),
      conversions: String(affiliate.conversions),
      revenue: String(affiliate.revenue),
      commissionEarned: String(affiliate.commissionEarned),
    });

    setTargets({
      monthlyClickTarget: String(affiliate.monthlyClickTarget),
      monthlyConversionTarget: String(affiliate.monthlyConversionTarget),
      monthlyRevenueTarget: String(affiliate.monthlyRevenueTarget),
    });
  };

  const updateMetrics = async () => {
    if (!selected) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/affiliates/${selected._id}/metrics`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clicks: Number(metrics.clicks),
            conversions: Number(metrics.conversions),
            revenue: Number(metrics.revenue),
            commissionEarned: Number(metrics.commissionEarned),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update metrics");
      }

      setMessage("Performance metrics updated.");
      await fetchAffiliates();
    } catch (err: any) {
      setError(err.message || "Unable to update metrics");
    } finally {
      setSaving(false);
    }
  };

  const updateTargets = async () => {
    if (!selected) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/admin/affiliates/${selected._id}/targets`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            monthlyClickTarget: Number(targets.monthlyClickTarget),
            monthlyConversionTarget: Number(targets.monthlyConversionTarget),
            monthlyRevenueTarget: Number(targets.monthlyRevenueTarget),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update targets");
      }

      setMessage("Monthly targets updated.");
      await fetchAffiliates();
    } catch (err: any) {
      setError(err.message || "Unable to update targets");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0c] text-[#666666]">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#F97316]" />
          Loading affiliates...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#f1ede7]">
      <div className="pointer-events-none fixed left-[240px] right-0 top-0 h-60 bg-[#F97316]/[0.035] blur-3xl" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-white/[0.08] bg-[#111111] lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-white/[0.08] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316] text-sm font-bold text-black shadow-[0_0_28px_rgba(249,115,22,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)]">
            A
          </div>

          <div className="ml-3">
            <p className="text-[15px] font-semibold tracking-tight">
              AffiliateOS
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#666666]">
              Administrator
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555555]">
            Workspace
          </p>

          <button
            onClick={() => router.push("/admin")}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#858585] transition-all duration-300 hover:translate-x-1 hover:bg-[#F97316]/[0.06] hover:text-[#f1ede7] hover:shadow-[inset_3px_0_0_#F97316]"
          >
            <span className="text-[#686868] transition-all duration-300 group-hover:scale-110 group-hover:text-[#F97316]">
              <IconGrid />
            </span>
            Dashboard
          </button>

          <button
            onClick={() => router.push("/admin/applications")}
            className="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#858585] transition-all duration-300 hover:translate-x-1 hover:bg-[#F97316]/[0.06] hover:text-[#f1ede7] hover:shadow-[inset_3px_0_0_#F97316]"
          >
            <span className="text-[#686868] transition-all duration-300 group-hover:scale-110 group-hover:text-[#F97316]">
              <IconDocs />
            </span>
            Applications
          </button>

          <button
            onClick={() => router.push("/admin/affiliates")}
            className="group mt-1 flex w-full items-center gap-3 rounded-xl bg-[#F97316]/[0.08] px-3 py-3 text-left text-sm font-medium text-[#F97316] shadow-[inset_3px_0_0_#F97316]"
          >
            <span className="transition-all duration-300 group-hover:scale-110">
              <IconUsers />
            </span>
            Affiliates
          </button>
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 transition-all duration-300 hover:border-[#F97316]/15 hover:bg-[#F97316]/[0.035]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#F97316]/10 text-sm font-semibold text-[#F97316]">
                A
              </div>

              <div>
                <p className="text-sm font-medium text-[#dedad4]">
                  Affiliate Admin
                </p>
                <p className="mt-0.5 text-[11px] text-[#5e5e5e]">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#666666] transition-all duration-300 hover:translate-x-1 hover:bg-[#F87171]/[0.08] hover:text-[#F87171] hover:shadow-[inset_3px_0_0_#F87171]"
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              <IconLogOut />
            </span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="lg:ml-[240px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0b0b0c]/85 px-5 py-5 backdrop-blur-xl sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F97316]">
            Admin Console
          </p>

          <div className="mt-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Affiliates
              </h1>
              <p className="mt-1 text-xs text-[#666666]">
                Manage your active partner network.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-[#777777] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              {affiliates.length} Active
            </div>
          </div>
        </header>

        <div className="relative p-5 sm:p-8">
          <div className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F97316]">
              Partner Management
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Affiliate performance
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#666666]">
              Manage affiliate performance metrics and monthly targets from
              one workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-[#F87171]/20 bg-[#F87171]/[0.06] p-4 text-sm text-[#F87171]">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-2xl border border-[#4ADE80]/20 bg-[#4ADE80]/[0.06] p-4 text-sm text-[#4ADE80]">
              {message}
            </div>
          )}

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] shadow-[0_20px_70px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-white/[0.12]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold">Approved Affiliates</h3>
                <p className="mt-1 text-xs text-[#666666]">
                  Update performance data and targets for active affiliates.
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#F97316]/15 bg-[#F97316]/[0.06] text-[#F97316]">
                <IconChart />
              </div>
            </div>

            {affiliates.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-[#555555]">
                  <IconUsers />
                </div>

                <p className="mt-4 text-sm font-medium text-[#aaa7a1]">
                  No approved affiliates found
                </p>

                <p className="mt-1 text-xs text-[#555555]">
                  Approved partners will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-white/[0.07] bg-white/[0.015]">
                    <tr className="text-[10px] uppercase tracking-[0.14em] text-[#555555]">
                      <th className="px-6 py-4 font-semibold">Affiliate</th>
                      <th className="px-6 py-4 font-semibold">
                        Referral Code
                      </th>
                      <th className="px-6 py-4 font-semibold">Clicks</th>
                      <th className="px-6 py-4 font-semibold">Conversions</th>
                      <th className="px-6 py-4 font-semibold">Revenue</th>
                      <th className="px-6 py-4 font-semibold">Commission</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {affiliates.map((affiliate) => (
                      <tr
                        key={affiliate._id}
                        className="group border-b border-white/[0.045] transition-all duration-300 hover:bg-[#F97316]/[0.025]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-xs font-semibold text-[#8a8a8a] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#F97316]/25 group-hover:bg-[#F97316]/[0.08] group-hover:text-[#F97316] group-hover:shadow-[0_8px_22px_rgba(249,115,22,0.12)]">
                              {(affiliate.userId?.name || "A")
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#ddd9d2] transition-colors duration-300 group-hover:text-white">
                                {affiliate.userId?.name || "Affiliate"}
                              </p>

                              <p className="mt-1 text-xs text-[#555555]">
                                {affiliate.userId?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-lg border border-[#F97316]/15 bg-[#F97316]/[0.05] px-3 py-1.5 text-xs font-semibold text-[#F97316] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#F97316]/30 group-hover:bg-[#F97316]/[0.1] group-hover:shadow-[0_6px_18px_rgba(249,115,22,0.08)]">
                            {affiliate.referralCode}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-[#aaa7a1] transition-colors group-hover:text-[#dedad4]">
                          {affiliate.clicks.toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5 text-sm text-[#aaa7a1] transition-colors group-hover:text-[#dedad4]">
                          {affiliate.conversions.toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-[#aaa7a1] transition-colors group-hover:text-[#dedad4]">
                          ₹{affiliate.revenue.toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-[#4ADE80]">
                          ₹
                          {affiliate.commissionEarned.toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-5">
                          <button
                            onClick={() => openEditor(affiliate)}
                            className="group/manage flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-[#888888] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F97316]/35 hover:bg-[#F97316]/[0.08] hover:text-[#F97316] hover:shadow-[0_10px_28px_rgba(249,115,22,0.12)] active:translate-y-0 active:scale-[0.98]"
                          >
                            <span className="transition-transform duration-300 group-hover/manage:rotate-45">
                              <IconSettings />
                            </span>
                            Manage
                            <span className="transition-transform duration-300 group-hover/manage:translate-x-1">
                              →
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#111111] shadow-[0_35px_120px_rgba(0,0,0,0.6)]">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/[0.08] bg-[#111111]/95 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F97316]/20 bg-[#F97316]/[0.08] text-sm font-semibold text-[#F97316]">
                  {(selected.userId?.name || "A")
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F97316]">
                    Affiliate Management
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {selected.userId?.name || "Affiliate"}
                  </h3>

                  <p className="mt-1 text-xs text-[#5f5f5f]">
                    {selected.referralCode}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-[#666666] transition-all duration-300 hover:rotate-90 hover:border-[#F87171]/25 hover:bg-[#F87171]/[0.08] hover:text-[#F87171]"
              >
                <IconX />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-white/[0.08] bg-[#141414] p-5 transition-all duration-300 hover:border-[#F97316]/15 hover:shadow-[0_15px_45px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316]/[0.08] text-[#F97316]">
                    <IconChart />
                  </div>

                  <div>
                    <h4 className="font-semibold">Performance Metrics</h4>
                    <p className="mt-0.5 text-xs text-[#5f5f5f]">
                      Current affiliate performance.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["clicks", "Clicks"],
                    ["conversions", "Conversions"],
                    ["revenue", "Revenue"],
                    ["commissionEarned", "Commission Earned"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#555555]">
                        {label}
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={metrics[field as keyof typeof metrics]}
                        onChange={(e) =>
                          setMetrics((current) => ({
                            ...current,
                            [field]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/[0.08] bg-[#0b0b0c] px-4 py-3 text-sm text-[#f1ede7] outline-none transition-all duration-300 hover:border-white/[0.14] focus:border-[#F97316]/45 focus:bg-[#101011] focus:shadow-[0_0_25px_rgba(249,115,22,0.06)]"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={updateMetrics}
                  disabled={saving}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fb8128] hover:shadow-[0_14px_35px_rgba(249,115,22,0.2)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconChart />
                  {saving ? "Updating..." : "Update Metrics"}
                </button>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#141414] p-5 transition-all duration-300 hover:border-[#8FA6C7]/15 hover:shadow-[0_15px_45px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8FA6C7]/[0.08] text-[#8FA6C7]">
                    <IconSettings />
                  </div>

                  <div>
                    <h4 className="font-semibold">Monthly Targets</h4>
                    <p className="mt-0.5 text-xs text-[#5f5f5f]">
                      Set monthly performance goals.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["monthlyClickTarget", "Monthly Click Target"],
                    [
                      "monthlyConversionTarget",
                      "Monthly Conversion Target",
                    ],
                    ["monthlyRevenueTarget", "Monthly Revenue Target"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#555555]">
                        {label}
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={targets[field as keyof typeof targets]}
                        onChange={(e) =>
                          setTargets((current) => ({
                            ...current,
                            [field]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/[0.08] bg-[#0b0b0c] px-4 py-3 text-sm text-[#f1ede7] outline-none transition-all duration-300 hover:border-white/[0.14] focus:border-[#F97316]/45 focus:bg-[#101011] focus:shadow-[0_0_25px_rgba(249,115,22,0.06)]"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={updateTargets}
                  disabled={saving}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-[#999999] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F97316]/35 hover:bg-[#F97316]/[0.08] hover:text-[#F97316] hover:shadow-[0_14px_35px_rgba(249,115,22,0.1)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <IconSettings />
                  {saving ? "Updating..." : "Update Targets"}
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}