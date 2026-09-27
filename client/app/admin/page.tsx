"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Application = {
  _id: string;
  fullName: string;
  email: string;
  company: string;
  industry: string;
  audienceSize: number;
  status: string;
  createdAt: string;
};

type Summary = {
  totalApplications: number;
  pendingApplications: number;
  approvedAffiliates: number;
  rejectedApplications: number;
};

const ORANGE = "#F97316";
const GREEN = "#4ADE80";
const RED = "#F87171";
const BLUE = "#8FA6C7";

export default function AdminDashboard() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedAffiliates: 0,
    rejectedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);

    if (user.role !== "admin") {
      router.push("/affiliate");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${API_URL}/api/admin/dashboard`, {
        headers,
        cache: "no-store",
      }).then((res) => res.json()),
      fetch(`${API_URL}/api/admin/applications`, {
        headers,
        cache: "no-store",
      }).then((res) => res.json()),
    ])
      .then(([dashboardData, applicationData]) => {
        const data =
          dashboardData.summary ||
          dashboardData.dashboard ||
          dashboardData;

        setSummary({
          totalApplications:
            data.totalApplications ??
            data.total ??
            dashboardData.totalApplications ??
            0,
          pendingApplications:
            data.pendingApplications ??
            data.pending ??
            dashboardData.pendingApplications ??
            0,
          approvedAffiliates:
            data.approvedAffiliates ??
            data.approved ??
            dashboardData.approvedAffiliates ??
            0,
          rejectedApplications:
            data.rejectedApplications ??
            data.rejected ??
            dashboardData.rejectedApplications ??
            0,
        });

        setApplications(applicationData.applications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const pipeline = useMemo(
    () => ({
      submitted: applications.filter((x) => x.status === "SUBMITTED").length,
      review: applications.filter((x) => x.status === "UNDER_REVIEW").length,
      changes: applications.filter(
        (x) => x.status === "CHANGES_REQUESTED"
      ).length,
      approved: applications.filter((x) => x.status === "APPROVED").length,
      rejected: applications.filter((x) => x.status === "REJECTED").length,
    }),
    [applications]
  );

  const approvalRate =
    summary.totalApplications > 0
      ? Math.round(
          (summary.approvedAffiliates / summary.totalApplications) * 100
        )
      : 0;

  const recentApplications = applications.slice(0, 5);

  const statusColor = (status: string) => {
    if (status === "APPROVED") return GREEN;
    if (status === "REJECTED") return RED;
    if (status === "UNDER_REVIEW") return BLUE;
    if (status === "CHANGES_REQUESTED") return ORANGE;
    return "#9a9a9a";
  };

  const statusName = (status: string) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (x) => x.toUpperCase());

  const initials = (name: string) =>
    name
      .split(" ")
      .map((x) => x[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0c] text-[#f1ede7]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: `${ORANGE}55`, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#f1ede7]">
      <div className="pointer-events-none fixed left-[240px] right-0 top-0 h-48 bg-[#F97316]/[0.04] blur-3xl" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-white/[0.08] bg-[#111111] lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-white/[0.08] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316] text-sm font-bold text-black shadow-[0_0_28px_rgba(249,115,22,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(249,115,22,0.35)]">
            A
          </div>

          <div className="ml-3">
            <p className="text-[15px] font-semibold tracking-tight">
              AffiliateOS
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#666666]">
              Admin panel
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555555]">
            Workspace
          </p>

          <div className="group flex items-center gap-3 rounded-xl border border-[#F97316]/15 bg-[#F97316]/[0.09] px-3 py-3 text-sm font-medium text-[#F97316] shadow-[inset_3px_0_0_#F97316,0_8px_25px_rgba(249,115,22,0.04)]">
            <span className="transition-transform duration-300 group-hover:scale-110">
              <IconGrid className="h-[18px] w-[18px]" />
            </span>
            Overview
          </div>

          <button
            onClick={() => router.push("/admin/applications")}
            className="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#858585] transition-all duration-300 hover:translate-x-1 hover:bg-[#F97316]/[0.06] hover:text-[#f1ede7] hover:shadow-[inset_3px_0_0_#F97316]"
          >
            <span className="text-[#686868] transition-all duration-300 group-hover:scale-110 group-hover:text-[#F97316]">
              <IconDocs className="h-[18px] w-[18px]" />
            </span>

            Applications

            {summary.pendingApplications > 0 && (
              <span className="ml-auto rounded-full border border-[#F97316]/20 bg-[#F97316]/10 px-2 py-0.5 text-[10px] font-medium text-[#F97316] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                {summary.pendingApplications}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push("/admin/affiliates")}
            className="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#858585] transition-all duration-300 hover:translate-x-1 hover:bg-[#F97316]/[0.06] hover:text-[#f1ede7] hover:shadow-[inset_3px_0_0_#F97316]"
          >
            <span className="text-[#686868] transition-all duration-300 group-hover:scale-110 group-hover:text-[#F97316]">
              <IconUsers className="h-[18px] w-[18px]" />
            </span>
            Affiliates
          </button>
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 transition-all duration-300 hover:border-[#F97316]/15 hover:bg-[#F97316]/[0.035]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#F97316]/10 text-sm font-semibold text-[#F97316] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_18px_rgba(249,115,22,0.12)]">
                A
              </div>

              <div>
                <p className="text-sm font-medium text-[#dedad4]">
                  Affiliate Admin
                </p>
                <p className="mt-0.5 text-[11px] text-[#5e5e5e]">Online</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#666666] transition-all duration-300 hover:translate-x-1 hover:bg-[#F87171]/[0.08] hover:text-[#F87171] hover:shadow-[inset_3px_0_0_#F87171]"
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              <IconLogOut className="h-[17px] w-[17px]" />
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
                Command Center
              </h1>
            </div>

            <button
              onClick={() => router.push("/admin/applications")}
              className="rounded-xl border border-[#F97316]/20 bg-[#F97316]/[0.08] px-4 py-2.5 text-xs font-medium text-[#F97316] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F97316]/40 hover:bg-[#F97316]/[0.12] hover:shadow-[0_0_22px_rgba(249,115,22,0.15)] active:scale-95"
            >
              Review Queue
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8">
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] transition-all duration-300 hover:border-white/[0.12]">
            <div className="grid lg:grid-cols-[1fr_320px]">
              <div className="p-8 sm:p-10">
                <p className="text-xs font-medium" style={{ color: ORANGE }}>
                  Partner network
                </p>

                <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight sm:text-[38px]">
                  Every affiliate,
                  <br />
                  one clear view.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-[#a8a8a8]">
                  Track applications as they come in, act on what needs
                  attention, and keep your partner network moving.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/admin/applications")}
                    className="rounded-lg px-5 py-2.5 text-sm font-medium text-[#0b0b0c] transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] active:scale-95"
                    style={{ background: ORANGE }}
                  >
                    Open Applications
                  </button>

                  <button
                    onClick={() => router.push("/admin/affiliates")}
                    className="rounded-lg border border-white/[0.12] px-5 py-2.5 text-sm text-[#f1ede7] transition-all duration-200 hover:scale-[1.04] hover:border-white/30 hover:bg-white/[0.04] active:scale-95"
                  >
                    Affiliate Network
                  </button>
                </div>
              </div>

              <div className="group border-t border-white/[0.08] p-8 sm:p-10 lg:border-l lg:border-t-0">
                <p className="text-xs text-[#8a8a8a]">Approval rate</p>

                <div className="relative mx-auto mt-6 flex h-36 w-36 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="6"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={ORANGE}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${approvalRate * 2.64} 264`}
                      className="transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                    />
                  </svg>

                  <div className="absolute text-center">
                    <p className="text-3xl font-semibold">{approvalRate}%</p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/[0.08] px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4ADE80]/40 hover:bg-white/[0.03]">
                    <p className="text-[10px] text-[#8a8a8a]">Partners</p>
                    <p
                      className="mt-1 text-lg font-semibold"
                      style={{ color: GREEN }}
                    >
                      {summary.approvedAffiliates}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/[0.08] px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F97316]/40 hover:bg-white/[0.03]">
                    <p className="text-[10px] text-[#8a8a8a]">Pending</p>
                    <p
                      className="mt-1 text-lg font-semibold"
                      style={{ color: ORANGE }}
                    >
                      {summary.pendingApplications}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Applications"
              value={summary.totalApplications}
              icon={<IconDocs className="h-4 w-4" />}
              accent={ORANGE}
            />

            <MetricCard
              label="Pending Review"
              value={summary.pendingApplications}
              icon={<IconClock className="h-4 w-4" />}
              accent={ORANGE}
            />

            <MetricCard
              label="Active Affiliates"
              value={summary.approvedAffiliates}
              icon={<IconCheck className="h-4 w-4" />}
              accent={GREEN}
            />

            <MetricCard
              label="Rejected"
              value={summary.rejectedApplications}
              icon={<IconX className="h-4 w-4" />}
              accent={RED}
            />
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
            <div className="rounded-2xl border border-white/[0.08] bg-[#141414] p-6 transition-colors duration-300 hover:border-white/[0.12] sm:p-7">
              <p className="text-sm font-semibold">Pipeline</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                <Stage
                  label="Submitted"
                  value={pipeline.submitted}
                  color="#9a9a9a"
                />
                <Stage
                  label="Review"
                  value={pipeline.review}
                  color={BLUE}
                />
                <Stage
                  label="Changes"
                  value={pipeline.changes}
                  color={ORANGE}
                />
                <Stage
                  label="Approved"
                  value={pipeline.approved}
                  color={GREEN}
                />
                <Stage
                  label="Rejected"
                  value={pipeline.rejected}
                  color={RED}
                />
              </div>

              <div className="mt-7 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
                {[
                  { v: pipeline.submitted, c: "#9a9a9a" },
                  { v: pipeline.review, c: BLUE },
                  { v: pipeline.changes, c: ORANGE },
                  { v: pipeline.approved, c: GREEN },
                  { v: pipeline.rejected, c: RED },
                ].map((seg, i) => (
                  <div
                    key={i}
                    className="h-full transition-all duration-700 hover:brightness-125"
                    style={{
                      width: `${
                        summary.totalApplications
                          ? (seg.v / summary.totalApplications) * 100
                          : 0
                      }%`,
                      background: seg.c,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(249,115,22,0.15)] sm:p-7"
              style={{
                borderColor: `${ORANGE}30`,
                background: "#141414",
              }}
            >
              <p className="text-sm font-semibold">Needs attention</p>

              <p
                className="mt-5 text-4xl font-semibold"
                style={{ color: ORANGE }}
              >
                {summary.pendingApplications}
              </p>

              <p className="mt-2 text-xs leading-5 text-[#a8a8a8]">
                applications are waiting on a decision.
              </p>

              <button
                onClick={() => router.push("/admin/applications")}
                className="mt-6 w-full rounded-lg py-2.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_18px_rgba(249,115,22,0.3)] active:scale-95"
                style={{
                  background: `${ORANGE}18`,
                  border: `1px solid ${ORANGE}40`,
                  color: ORANGE,
                }}
              >
                Go to Review Queue
              </button>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] transition-colors duration-300 hover:border-white/[0.12]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 sm:px-7">
              <p className="text-sm font-semibold">Recent applications</p>

              <button
                onClick={() => router.push("/admin/applications")}
                className="text-xs text-[#8a8a8a] transition-colors duration-200 hover:text-[#F97316]"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {recentApplications.map((application) => {
                const c = statusColor(application.status);

                return (
                  <button
                    key={application._id}
                    onClick={() =>
                      router.push(`/admin/applications/${application._id}`)
                    }
                    className="group relative flex w-full items-center gap-4 overflow-hidden px-6 py-4 text-left transition-colors duration-200 hover:bg-white/[0.035] sm:px-7"
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-200 group-hover:scale-y-100"
                      style={{ background: c }}
                    />

                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `${c}18`, color: c }}
                    >
                      {initials(application.fullName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm">
                          {application.fullName}
                        </p>

                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ background: `${c}18`, color: c }}
                        >
                          {statusName(application.status)}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#8a8a8a]">
                        <span>{application.email}</span>
                        <span>{application.company || "Independent"}</span>
                        <span>{application.industry}</span>
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] text-[#8a8a8a]">Audience</p>
                      <p className="text-xs">
                        {application.audienceSize.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <IconChevron className="h-4 w-4 text-[#8a8a8a] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#F97316]" />
                  </button>
                );
              })}

              {recentApplications.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm text-[#8a8a8a]">
                    No applications yet — new submissions will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <footer className="flex flex-col gap-1 py-7 text-xs text-[#8a8a8a] sm:flex-row sm:justify-between">
            <span>AffiliateOS Admin</span>
            <span>Session encrypted and active</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="group rounded-2xl border border-white/[0.08] bg-[#141414] p-5 transition-all duration-300 hover:-translate-y-1.5"
      style={{ boxShadow: "none" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${accent}22`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}55`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8a8a8a]">{label}</p>

        <div
          className="flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>

      <p className="mt-5 text-2xl font-semibold transition-colors duration-300">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function Stage({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/[0.08] p-3 transition-all duration-200 hover:-translate-y-0.5"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}55`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
      }}
    >
      <p className="truncate text-[10px] text-[#8a8a8a]">{label}</p>

      <p className="mt-3 text-xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconDocs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 3.5V8h4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 12.5h6M9 16h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.5 20a5.5 5.5 0 0 1 11 0"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="17"
        cy="9"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M15.5 14a5 5 0 0 1 5.2 4.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 12.5l2.3 2.3L15.5 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9.5 9.5l5 5M14.5 9.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogOut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="m16 17 5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
