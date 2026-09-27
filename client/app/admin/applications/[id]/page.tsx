"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

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
  rejectionReason: string;
  changeRequest: string;
  createdAt: string;
  updatedAt: string;
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

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const IconX = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const IconRefresh = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
  </svg>
);

export default function ApplicationReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState<"reject" | "changes" | null>(null);
  const [reason, setReason] = useState("");

  const loadApplication = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/applications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApplication(data.application);
      } else {
        setMessage(data.message || "Unable to load application");
      }
    } catch {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

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

      loadApplication();
    } catch {
      router.push("/");
    }
  }, [id, router]);

  const performAction = async (
    endpoint: string,
    body: Record<string, string> = {}
  ) => {
    const token = localStorage.getItem("token");

    setActionLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Action failed");
        return;
      }

      setModal(null);
      setReason("");
      setMessage(data.message || "Action completed successfully");
      await loadApplication();
    } catch {
      setMessage("Unable to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const statusStyle = (status: string) => {
    if (status === "APPROVED") {
      return "border-[#4ADE80]/25 bg-[#4ADE80]/10 text-[#4ADE80] shadow-[0_0_20px_rgba(74,222,128,0.05)]";
    }

    if (status === "REJECTED") {
      return "border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171] shadow-[0_0_20px_rgba(248,113,113,0.05)]";
    }

    if (status === "UNDER_REVIEW") {
      return "border-[#F97316]/25 bg-[#F97316]/10 text-[#F97316] shadow-[0_0_20px_rgba(249,115,22,0.05)]";
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0c] text-[#666666]">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-[#F97316]" />
          Loading application...
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0c] text-[#f1ede7]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#141414] text-[#666666]">
            <IconDocs />
          </div>

          <p className="mt-5 text-lg font-semibold">Application not found</p>

          <p className="mt-1 text-sm text-[#666666]">
            The requested application could not be loaded.
          </p>

          <button
            onClick={() => router.push("/admin/applications")}
            className="mt-5 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fb8128] hover:shadow-[0_10px_30px_rgba(249,115,22,0.2)]"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-[#f1ede7]">
      <div className="pointer-events-none fixed left-[240px] right-0 top-0 h-52 bg-[#F97316]/[0.035] blur-3xl" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] border-r border-white/[0.08] bg-[#111111] lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-white/[0.08] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F97316] text-sm font-bold text-black shadow-[0_0_28px_rgba(249,115,22,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_38px_rgba(249,115,22,0.35)]">
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
          <button
            onClick={() => router.push("/admin/applications")}
            className="group flex items-center gap-2 text-xs font-medium text-[#666666] transition-all duration-300 hover:-translate-x-1 hover:text-[#F97316]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <IconArrowLeft />
            </span>
            Back to Applications
          </button>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F97316]/20 bg-[#F97316]/[0.08] text-sm font-semibold text-[#F97316] shadow-[0_0_25px_rgba(249,115,22,0.06)]">
                {application.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F97316]">
                  Application Review
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  {application.fullName}
                </h1>
              </div>
            </div>

            <span
              className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${statusStyle(
                application.status
              )}`}
            >
              {formatStatus(application.status)}
            </span>
          </div>
        </header>

        <div className="relative p-5 sm:p-8">
          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#F97316]/20 bg-[#F97316]/[0.07] px-4 py-3 text-sm text-[#F97316] shadow-[0_10px_30px_rgba(249,115,22,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
              {message}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
            <section className="rounded-2xl border border-white/[0.08] bg-[#141414] shadow-[0_20px_70px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-white/[0.12]">
              <div className="border-b border-white/[0.07] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F97316]">
                  Applicant
                </p>

                <h2 className="mt-1 text-base font-semibold">
                  Applicant Information
                </h2>

                <p className="mt-1 text-xs text-[#666666]">
                  Complete information submitted by the applicant.
                </p>
              </div>

              <div className="grid gap-6 p-6 sm:grid-cols-2">
                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Full Name
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#e1ddd6]">
                    {application.fullName}
                  </p>
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm text-[#b4b0aa]">
                    {application.email}
                  </p>
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Phone
                  </p>
                  <p className="mt-2 text-sm text-[#b4b0aa]">
                    {application.phone}
                  </p>
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Company / Organization
                  </p>
                  <p className="mt-2 text-sm text-[#b4b0aa]">
                    {application.company || "Not provided"}
                  </p>
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Website / Social Media
                  </p>

                  {application.website ? (
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm text-[#F97316] transition-colors hover:text-[#ff914b]"
                    >
                      {application.website}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-[#b4b0aa]">
                      Not provided
                    </p>
                  )}
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Industry
                  </p>
                  <p className="mt-2 text-sm text-[#b4b0aa]">
                    {application.industry}
                  </p>
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Audience Size
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#dedad4]">
                    {application.audienceSize.toLocaleString()}
                  </p>
                </div>

                <div className="group rounded-xl border border-transparent p-2 transition-all duration-300 hover:border-white/[0.07] hover:bg-white/[0.025]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Submitted
                  </p>
                  <p className="mt-2 text-sm text-[#b4b0aa]">
                    {new Date(application.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#555555]">
                    Reason for Joining
                  </p>

                  <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm leading-6 text-[#aaa7a1] transition-all duration-300 hover:border-[#F97316]/15 hover:bg-[#F97316]/[0.025] hover:text-[#c2beb7]">
                    {application.reason}
                  </div>
                </div>
              </div>
            </section>

            <section className="h-fit rounded-2xl border border-white/[0.08] bg-[#141414] shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
              <div className="border-b border-white/[0.07] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F97316]">
                  Decision
                </p>

                <h2 className="mt-1 text-base font-semibold">
                  Review Actions
                </h2>

                <p className="mt-1 text-xs text-[#666666]">
                  Manage the application decision.
                </p>
              </div>

              <div className="space-y-3 p-6">
                {application.status !== "APPROVED" &&
                  application.status !== "REJECTED" && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          performAction(
                            `/api/admin/applications/${id}/review`
                          )
                        }
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#F97316]/20 bg-[#F97316]/[0.08] px-4 py-3 text-sm font-medium text-[#F97316] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F97316]/40 hover:bg-[#F97316]/[0.13] hover:shadow-[0_10px_30px_rgba(249,115,22,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="transition-transform duration-300 group-hover:rotate-180">
                          <IconRefresh />
                        </span>
                        Move to Under Review
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          performAction(
                            `/api/admin/applications/${id}/approve`
                          )
                        }
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#4ADE80] px-4 py-3 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#65e994] hover:shadow-[0_12px_32px_rgba(74,222,128,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="transition-transform duration-300 group-hover:scale-125">
                          <IconCheck />
                        </span>
                        Approve Application
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => setModal("changes")}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#8FA6C7]/20 bg-[#8FA6C7]/[0.07] px-4 py-3 text-sm font-medium text-[#8FA6C7] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8FA6C7]/35 hover:bg-[#8FA6C7]/[0.12] hover:shadow-[0_10px_30px_rgba(143,166,199,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <IconRefresh />
                        Request Changes
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => setModal("reject")}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#F87171]/20 bg-[#F87171]/[0.07] px-4 py-3 text-sm font-medium text-[#F87171] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F87171]/35 hover:bg-[#F87171]/[0.12] hover:shadow-[0_10px_30px_rgba(248,113,113,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="transition-transform duration-300 group-hover:rotate-90">
                          <IconX />
                        </span>
                        Reject Application
                      </button>
                    </>
                  )}

                {application.status === "APPROVED" && (
                  <div className="rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/[0.07] p-4 transition-all duration-300 hover:border-[#4ADE80]/35 hover:bg-[#4ADE80]/[0.1]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4ADE80]/10 text-[#4ADE80]">
                        <IconCheck />
                      </span>

                      <p className="text-sm font-semibold text-[#4ADE80]">
                        Application Approved
                      </p>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[#777777]">
                      This applicant is now an active affiliate.
                    </p>
                  </div>
                )}

                {application.status === "REJECTED" && (
                  <div className="rounded-xl border border-[#F87171]/20 bg-[#F87171]/[0.07] p-4 transition-all duration-300 hover:border-[#F87171]/35 hover:bg-[#F87171]/[0.1]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F87171]/10 text-[#F87171]">
                        <IconX />
                      </span>

                      <p className="text-sm font-semibold text-[#F87171]">
                        Application Rejected
                      </p>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[#777777]">
                      {application.rejectionReason || "No reason provided."}
                    </p>
                  </div>
                )}

                {application.changeRequest && (
                  <div className="rounded-xl border border-[#8FA6C7]/20 bg-[#8FA6C7]/[0.06] p-4 transition-all duration-300 hover:border-[#8FA6C7]/35 hover:bg-[#8FA6C7]/[0.09]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8FA6C7]/10 text-[#8FA6C7]">
                        <IconRefresh />
                      </span>

                      <p className="text-sm font-semibold text-[#8FA6C7]">
                        Requested Changes
                      </p>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[#777777]">
                      {application.changeRequest}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#141414] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    modal === "reject"
                      ? "text-[#F87171]"
                      : "text-[#8FA6C7]"
                  }`}
                >
                  Application Action
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {modal === "reject"
                    ? "Reject Application"
                    : "Request Changes"}
                </h2>

                <p className="mt-2 text-sm leading-5 text-[#666666]">
                  {modal === "reject"
                    ? "Provide a reason for rejecting this application."
                    : "Tell the applicant what needs to be updated before resubmission."}
                </p>
              </div>

              <button
                onClick={() => {
                  setModal(null);
                  setReason("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-[#666666] transition-all duration-300 hover:border-[#F87171]/25 hover:bg-[#F87171]/[0.07] hover:text-[#F87171]"
              >
                <IconX />
              </button>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder={
                modal === "reject"
                  ? "Enter rejection reason..."
                  : "Enter requested changes..."
              }
              className="mt-6 w-full resize-none rounded-xl border border-white/[0.08] bg-[#0b0b0c] p-4 text-sm text-[#f1ede7] outline-none transition-all duration-300 placeholder:text-[#4f4f4f] focus:border-[#F97316]/40 focus:bg-[#101011] focus:shadow-[0_0_25px_rgba(249,115,22,0.06)]"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setModal(null);
                  setReason("");
                }}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm font-medium text-[#777777] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-[#f1ede7]"
              >
                Cancel
              </button>

              <button
                disabled={!reason.trim() || actionLoading}
                onClick={() =>
                  performAction(
                    modal === "reject"
                      ? `/api/admin/applications/${id}/reject`
                      : `/api/admin/applications/${id}/request-changes`,
                    { reason }
                  )
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${
                  modal === "reject"
                    ? "bg-[#F87171] text-black hover:bg-[#fa8a8a] hover:shadow-[0_12px_30px_rgba(248,113,113,0.15)]"
                    : "bg-[#F97316] text-black hover:bg-[#fb8128] hover:shadow-[0_12px_30px_rgba(249,115,22,0.16)]"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : modal === "reject"
                  ? "Reject Application"
                  : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
