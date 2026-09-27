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
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED";
  rejectionReason?: string;
  changeRequest?: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  industry: string;
  audienceSize: string;
  reason: string;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  industry: "",
  audienceSize: "",
  reason: "",
};

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    description: string;
    icon: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    description: "Your application has been saved but has not been submitted.",
    icon: "◷",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    description: "Your application has been submitted and is waiting for review.",
    icon: "↑",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    description: "Our team is currently reviewing your application.",
    icon: "◌",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    description: "Your affiliate application has been approved.",
    icon: "✓",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-red-400/20 bg-red-400/10 text-red-300",
    description: "Your application was not approved.",
    icon: "×",
  },
  CHANGES_REQUESTED: {
    label: "Changes Requested",
    className: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    description: "Please review the requested changes and resubmit your application.",
    icon: "!",
  },
};

export default function AffiliateApplicationPage() {
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);

  useEffect(() => {
    const loadApplication = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.push("/");
        return;
      }

      try {
        const user = JSON.parse(userData);

        if (user.role !== "affiliate") {
          router.push("/admin");
          return;
        }

        setForm((current) => ({
          ...current,
          fullName: user.name || "",
          email: user.email || "",
        }));

        const response = await fetch(`${API_URL}/api/applications/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load application");
        }

        const app = data.application || null;

        setApplication(app);

        if (app) {
          setForm({
            fullName: app.fullName || "",
            email: app.email || "",
            phone: app.phone || "",
            company: app.company || "",
            website: app.website || "",
            industry: app.industry || "",
            audienceSize: String(app.audienceSize ?? ""),
            reason: app.reason || "",
          });
        }
      } catch (err: any) {
        setError(err.message || "Unable to load application");
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [router]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.industry.trim() ||
      !form.audienceSize ||
      !form.reason.trim()
    ) {
      setError("Please complete all required fields.");
      return false;
    }

    if (Number(form.audienceSize) < 0) {
      setError("Audience size cannot be negative.");
      return false;
    }

    return true;
  };

  const createApplication = async (shouldSubmit = false) => {
    if (!validateForm()) return;

    setSaving(!shouldSubmit);
    setSubmitting(shouldSubmit);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          audienceSize: Number(form.audienceSize),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create application");
      }

      setApplication(data.application);

      if (shouldSubmit) {
        const submitResponse = await fetch(
          `${API_URL}/api/applications/${data.application._id}/submit`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const submitData = await submitResponse.json();

        if (!submitResponse.ok) {
          throw new Error(
            submitData.message || "Failed to submit application"
          );
        }

        setApplication(submitData.application);
        setMessage("Application submitted successfully.");
      } else {
        setMessage("Application saved successfully.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to create application");
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (!application) {
      await createApplication(false);
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/applications/${application._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            audienceSize: Number(form.audienceSize),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save application");
      }

      setApplication(data.application);
      setMessage("Application saved successfully.");
    } catch (err: any) {
      setError(err.message || "Unable to save application");
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async () => {
    if (!application) {
      await createApplication(true);
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const updateResponse = await fetch(
        `${API_URL}/api/applications/${application._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            audienceSize: Number(form.audienceSize),
          }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateData.message || "Failed to update application"
        );
      }

      const submitResponse = await fetch(
        `${API_URL}/api/applications/${application._id}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(
          submitData.message || "Failed to submit application"
        );
      }

      setApplication(submitData.application);
      setMessage("Application submitted successfully.");
    } catch (err: any) {
      setError(err.message || "Unable to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const canEdit =
    !application ||
    application.status === "DRAFT" ||
    application.status === "CHANGES_REQUESTED";

  const config = application
    ? statusConfig[application.status] || statusConfig.DRAFT
    : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090617] text-white">
        <div className="flex flex-col items-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-400" />
          </div>
          <p className="mt-5 text-sm text-slate-400">
            Loading your application...
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-2xl border border-white/[0.07] bg-[#0d081a]/80 px-4 py-3.5 text-sm text-white outline-none transition duration-200 placeholder:text-slate-700 hover:border-white/[0.13] hover:bg-[#100b20] focus:border-violet-400/40 focus:bg-[#100b20] focus:ring-4 focus:ring-violet-500/[0.06]";

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
            <button
              onClick={() => router.push("/affiliate")}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm text-slate-400 transition duration-200 hover:translate-x-1 hover:bg-white/[0.04] hover:text-white active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-slate-500 transition group-hover:bg-violet-500/10 group-hover:text-violet-300">
                ◫
              </span>
              Dashboard
            </button>

            <div className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-violet-400/10 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/[0.05] px-3 py-3.5 text-sm font-semibold text-violet-200 shadow-inner">
              <div className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 transition group-hover:scale-110">
                ◈
              </span>
              My Application
            </div>

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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                ◈
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300">
                  Partnership
                </p>
                <p className="mt-1 truncate text-[10px] text-slate-600">
                  Application workspace
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
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Partnership Workspace
                </p>
              </div>

              <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                My Application
              </h1>
            </div>

            {config && (
              <div
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${config.className}`}
              >
                <span>{config.icon}</span>
                {config.label}
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-[1450px] p-5 sm:p-8 xl:p-10">
          <div className="mb-7 flex items-center justify-between">
            <button
              onClick={() => router.push("/affiliate")}
              className="group flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-500 transition duration-200 hover:-translate-x-1 hover:text-white"
            >
              <span className="transition group-hover:-translate-x-1">←</span>
              Back to Dashboard
            </button>

            {application && (
              <span className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-700 sm:block">
                ID · {application._id.slice(-8)}
              </span>
            )}
          </div>

          <section className="relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-gradient-to-br from-violet-600/[0.17] via-purple-500/[0.08] to-cyan-500/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-9">
            <div className="absolute right-[-80px] top-[-130px] h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[90px]" />
            <div className="absolute bottom-[-100px] left-[35%] h-[250px] w-[250px] rounded-full bg-cyan-500/[0.08] blur-[80px]" />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.08] px-3.5 py-2 text-[11px] font-semibold text-violet-300">
                  <span>✦</span>
                  Affiliate Partnership
                  <span className="h-1 w-1 rounded-full bg-violet-400" />
                  Application
                </div>

                <h2 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Build your path to{" "}
                  <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                    partnership.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                  Tell us about yourself, your audience and how you plan to
                  create value through the AffiliateOS partner network.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-black/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  {config?.icon || "✦"}
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                    Current Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {config?.label || "Not Started"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/[0.06] p-4 text-sm text-red-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                !
              </span>
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] p-4 text-sm text-emerald-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                ✓
              </span>
              {message}
            </div>
          )}

          {!application ? (
            <section className="mt-7 overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] shadow-xl shadow-black/10">
              <div className="border-b border-white/[0.07] bg-gradient-to-r from-violet-500/[0.06] to-transparent px-6 py-6 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300 shadow-lg shadow-violet-500/10">
                    ✦
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                      Get Started
                    </p>
                    <h3 className="mt-1 text-lg font-bold">
                      Become an Affiliate Partner
                    </h3>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500">
                  Complete your profile and tell us about your audience. Your
                  application will be reviewed by our partnership team.
                </p>
              </div>

              <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
                {[
                  ["fullName", "Full Name", "Enter your full name", true],
                  ["email", "Email Address", "you@example.com", true],
                  ["phone", "Phone Number", "+91 98765 43210", true],
                  ["company", "Company / Organization", "Company or organization", false],
                  ["website", "Website / Social Media", "https://example.com", false],
                  ["industry", "Industry / Category", "Technology, Education, Finance...", true],
                  ["audienceSize", "Audience Size", "e.g. 10000", true],
                ].map(([field, label, placeholder, required]) => (
                  <div key={field as string} className="group">
                    <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-slate-400">
                      {label as string}
                      {required && <span className="text-violet-400">*</span>}
                    </label>

                    <input
                      type={field === "audienceSize" ? "number" : field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                      min={field === "audienceSize" ? "0" : undefined}
                      value={form[field as keyof FormState]}
                      onChange={(e) =>
                        updateField(field as keyof FormState, e.target.value)
                      }
                      placeholder={placeholder as string}
                      className={inputClass}
                    />
                  </div>
                ))}

                <div className="group md:col-span-2">
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                      Why do you want to join our affiliate program?
                      <span className="text-violet-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-700">
                      {form.reason.length}/1000
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={form.reason}
                    maxLength={1000}
                    onChange={(e) => updateField("reason", e.target.value)}
                    placeholder="Tell us about your audience, promotion strategy, and why this partnership is a good fit..."
                    className={`${inputClass} resize-none leading-6`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/[0.07] bg-black/[0.08] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                  onClick={() => createApplication(false)}
                  disabled={saving || submitting}
                  className="rounded-2xl border border-white/[0.08] px-6 py-3.5 text-sm font-semibold text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-white/[0.04] hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  onClick={() => createApplication(true)}
                  disabled={saving || submitting}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold shadow-xl shadow-violet-600/20 transition duration-200 hover:-translate-y-1 hover:shadow-violet-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </section>
          ) : (
            <>
              {config && (
                <section className="mt-7 rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-5 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.11] sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${config.className} transition duration-300 hover:scale-105`}
                      >
                        {config.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold">{config.label}</p>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${config.className}`}
                          >
                            Status
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {config.description}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-[10px] text-slate-600">
                      Application · {application._id.slice(-8)}
                    </div>
                  </div>
                </section>
              )}

              {application.status === "CHANGES_REQUESTED" &&
                application.changeRequest && (
                  <section className="group relative mt-5 overflow-hidden rounded-[26px] border border-orange-400/15 bg-gradient-to-br from-orange-500/[0.09] to-fuchsia-500/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:shadow-xl hover:shadow-orange-500/5">
                    <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-orange-500/10 blur-[60px]" />
                    <div className="relative flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                        !
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
                          Changes Requested
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {application.changeRequest}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

              {application.status === "REJECTED" &&
                application.rejectionReason && (
                  <section className="group relative mt-5 overflow-hidden rounded-[26px] border border-red-400/15 bg-gradient-to-br from-red-500/[0.08] to-fuchsia-500/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-red-400/25 hover:shadow-xl hover:shadow-red-500/5">
                    <div className="relative flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                        ×
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">
                          Rejection Reason
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {application.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

              <section className="mt-7 overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] shadow-xl shadow-black/10">
                <div className="border-b border-white/[0.07] bg-gradient-to-r from-violet-500/[0.05] to-transparent px-6 py-6 sm:px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                      ◈
                    </div>
                    <div>
                      <h3 className="text-base font-bold">
                        Applicant Information
                      </h3>
                      <p className="mt-1 text-xs text-slate-600">
                        Keep your information accurate and up to date.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
                  {[
                    ["fullName", "Full Name", "text"],
                    ["email", "Email Address", "email"],
                    ["phone", "Phone Number", "tel"],
                    ["company", "Company / Organization", "text"],
                    ["website", "Website / Social Media", "text"],
                    ["industry", "Industry / Category", "text"],
                    ["audienceSize", "Audience Size", "number"],
                  ].map(([field, label, type]) => (
                    <div key={field} className="group">
                      <label className="mb-2.5 block text-sm font-medium text-slate-400">
                        {label}
                      </label>
                      <input
                        type={type}
                        min={type === "number" ? "0" : undefined}
                        value={form[field as keyof FormState]}
                        onChange={(e) =>
                          updateField(field as keyof FormState, e.target.value)
                        }
                        disabled={!canEdit}
                        className={`${inputClass} disabled:cursor-not-allowed disabled:border-white/[0.04] disabled:bg-black/10 disabled:text-slate-500`}
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <div className="mb-2.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-400">
                        Why do you want to join our affiliate program?
                      </label>
                      <span className="text-[10px] text-slate-700">
                        {form.reason.length}/1000
                      </span>
                    </div>

                    <textarea
                      rows={6}
                      maxLength={1000}
                      value={form.reason}
                      onChange={(e) => updateField("reason", e.target.value)}
                      disabled={!canEdit}
                      className={`${inputClass} resize-none leading-6 disabled:cursor-not-allowed disabled:border-white/[0.04] disabled:bg-black/10 disabled:text-slate-500`}
                    />
                  </div>
                </div>

                {canEdit && (
                  <div className="flex flex-col gap-3 border-t border-white/[0.07] bg-black/[0.08] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                    <button
                      onClick={saveDraft}
                      disabled={saving || submitting}
                      className="rounded-2xl border border-white/[0.08] px-6 py-3.5 text-sm font-semibold text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-white/[0.04] hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      onClick={submitApplication}
                      disabled={saving || submitting}
                      className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold shadow-xl shadow-violet-600/20 transition duration-200 hover:-translate-y-1 hover:shadow-violet-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Submitting..."
                        : application.status === "CHANGES_REQUESTED"
                        ? "Resubmit Application"
                        : "Submit Application"}
                    </button>
                  </div>
                )}
              </section>

              <section className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="group rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/15 hover:bg-violet-500/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition duration-300 group-hover:scale-110">
                      +
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                        Created
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-300">
                        {new Date(application.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/15 hover:bg-cyan-500/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 transition duration-300 group-hover:scale-110">
                      ↻
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                        Last Updated
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-300">
                        {new Date(application.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          <footer className="mt-10 border-t border-white/[0.05] py-6 text-center text-[10px] text-slate-700">
            AffiliateOS · Partner Partnership Workspace
          </footer>
        </div>
      </main>
    </div>
  );
}

