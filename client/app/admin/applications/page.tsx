
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Application = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  industry: string;
  audienceSize: number;
  reason: string;
  status: string;
  createdAt: string;
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

const IconChevron = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const IconLogOut = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

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

      const loadApplications = async () => {
        try {
          const response = await fetch(`${API_URL}/api/admin/applications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          });

          const data = await response.json();

          if (response.ok) {
            setApplications(data.applications || []);
          }
        } catch {
          setApplications([]);
        } finally {
          setLoading(false);
        }
      };

      loadApplications();
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const filteredApplications =
    filter === "ALL"
      ? applications
      : applications.filter((application) => application.status === filter);

  const statusStyle = (status: string) => {
    if (status === "APPROVED") {
      return "border-[#4ADE80]/25 bg-[#4ADE80]/10 text-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.05)]";
    }

    if (status === "REJECTED") {
      return "border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171] shadow-[0_0_15px_rgba(248,113,113,0.05)]";
    }

    if (status === "UNDER_REVIEW") {
      return "border-[#F97316]/25 bg-[#F97316]/10 text-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.05)]";
    }

    if (status === "CHANGES_REQUESTED") {
      return "border-[#8FA6C7]/25 bg-[#8FA6C7]/10 text-[#8FA6C7]";
    }

    return "border-white/10 bg-white/[0.04] text-[#8FA6C7]";
  };

  const formatStatus = (status: string) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#f1ede7]">
      <div className="pointer-events-none fixed left-[240px] right-0 top-0 h-48 bg-[#F97316]/[0.04] blur-3xl" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-white/[0.08] bg-[#111111] lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-white/[0.08] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316] text-sm font-bold text-black shadow-[0_0_28px_rgba(249,115,22,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(249,115,22,0.35)]">
            A
          </div>

          <div className="ml-3">
            <p className="text-[15px] font-semibold tracking-tight">AffiliateOS</p>
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

          <div className="group mt-1 flex items-center gap-3 rounded-xl border border-[#F97316]/15 bg-[#F97316]/[0.09] px-3 py-3 text-sm font-medium text-[#F97316] shadow-[inset_3px_0_0_#F97316,0_8px_25px_rgba(249,115,22,0.04)]">
            <span className="transition-transform duration-300 group-hover:scale-110">
              <IconDocs />
            </span>
            Applications
          </div>

          <button
            onClick={() => router.push("/admin/affiliates")}
            className="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#858585] transition-all duration-300 hover:translate-x-1 hover:bg-[#F97316]/[0.06] hover:text-[#f1ede7] hover:shadow-[inset_3px_0_0_#F97316]"
          >
            <span className="text-[#686868] transition-all duration-300 group-hover:scale-110 group-hover:text-[#F97316]">
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
                <p className="text-sm font-medium text-[#dedad4]">Affiliate Admin</p>
                <p className="mt-0.5 text-[11px] text-[#5e5e5e]">Administrator</p>
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
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0b0b0c]/85 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F97316]">
                AffiliateOS / Workspace
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Applications
              </h1>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2 transition-all duration-300 hover:border-[#4ADE80]/20 hover:bg-[#4ADE80]/[0.04] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_9px_rgba(74,222,128,0.6)]" />
              <span className="text-[11px] text-[#777777]">System operational</span>
            </div>
          </div>
        </header>

        <div className="relative p-5 sm:p-8">
          <div className="mb-8">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#666666]">
                  Review Queue
                </p>

                <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Every application, one clear view.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#777777]">
                  Review incoming affiliate applications and manage their approval status.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="group rounded-2xl border border-white/[0.08] bg-[#141414] px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-[#181818] hover:shadow-[0_14px_35px_rgba(0,0,0,0.3)]">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#5f5f5f]">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-semibold transition-colors duration-300 group-hover:text-[#F97316]">
                    {applications.length}
                  </p>
                </div>

                <div className="group rounded-2xl border border-[#F97316]/15 bg-[#F97316]/[0.045] px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#F97316]/35 hover:bg-[#F97316]/[0.08] hover:shadow-[0_14px_35px_rgba(249,115,22,0.13)]">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#8a674e]">
                    Showing
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[#F97316]">
                    {filteredApplications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] shadow-[0_20px_70px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-white/[0.11]">
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Application pipeline</h3>

                  <p className="mt-1 text-xs text-[#666666]">
                    {filteredApplications.length} application
                    {filteredApplications.length !== 1 ? "s" : ""} in the current view
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    "ALL",
                    "SUBMITTED",
                    "UNDER_REVIEW",
                    "APPROVED",
                    "REJECTED",
                    "CHANGES_REQUESTED",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`rounded-lg border px-3 py-2 text-[11px] font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                        filter === item
                          ? "border-[#F97316]/35 bg-[#F97316]/10 text-[#F97316] shadow-[0_8px_25px_rgba(249,115,22,0.12)]"
                          : "border-white/[0.07] bg-white/[0.025] text-[#686868] hover:border-[#F97316]/30 hover:bg-[#F97316]/[0.07] hover:text-[#F97316] hover:shadow-[0_8px_25px_rgba(249,115,22,0.08)]"
                      }`}
                    >
                      {item === "ALL" ? "All" : formatStatus(item)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555555]">
                      Applicant
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555555]">
                      Company
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555555]">
                      Industry
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555555]">
                      Audience
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555555]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555555]">
                      Date
                    </th>

                    <th className="px-4 py-4" />
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="mx-auto flex w-fit items-center gap-3 text-sm text-[#666666]">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#F97316]" />
                          Loading applications...
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredApplications.map((application) => (
                      <tr
                        key={application._id}
                        onClick={() =>
                          router.push(`/admin/applications/${application._id}`)
                        }
                        className="group cursor-pointer border-b border-white/[0.05] transition-all duration-300 hover:bg-white/[0.035]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-xs font-semibold text-[#bdb8b0] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-[#F97316]/35 group-hover:bg-[#F97316]/[0.1] group-hover:text-[#F97316] group-hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]">
                              {application.fullName
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#e3ded7] transition-colors duration-300 group-hover:text-white">
                                {application.fullName}
                              </p>

                              <p className="mt-1 text-xs text-[#5e5e5e]">
                                {application.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-[#8b8985] transition-colors duration-300 group-hover:text-[#b7b3ad]">
                          {application.company || "—"}
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-xs text-[#8b8985] transition-all duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.045] group-hover:text-[#b7b3ad]">
                            {application.industry}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-sm text-[#8b8985] transition-colors duration-300 group-hover:text-[#b7b3ad]">
                          {application.audienceSize.toLocaleString()}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all duration-300 group-hover:-translate-y-0.5 ${statusStyle(
                              application.status
                            )}`}
                          >
                            {formatStatus(application.status)}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-xs text-[#626262] transition-colors duration-300 group-hover:text-[#858585]">
                          {new Date(application.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-[#555555] transition-all duration-300 group-hover:translate-x-1 group-hover:border-[#F97316]/30 group-hover:bg-[#F97316]/[0.08] group-hover:text-[#F97316] group-hover:shadow-[0_0_18px_rgba(249,115,22,0.12)]">
                            <IconChevron />
                          </span>
                        </td>
                      </tr>
                    ))}

                  {!loading && filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-[#555555]">
                          <IconDocs />
                        </div>

                        <p className="mt-4 text-sm font-medium text-[#8b8985]">
                          No applications found
                        </p>

                        <p className="mt-1 text-xs text-[#555555]">
                          Try selecting a different status filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

