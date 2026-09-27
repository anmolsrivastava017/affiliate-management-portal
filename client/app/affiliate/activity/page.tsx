"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Activity = {
  _id: string;
  action: string;
  description: string;
  createdAt: string;
};

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(user);

    if (parsedUser.role !== "affiliate") {
      router.push("/admin");
      return;
    }

    const fetchActivities = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/activities/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [router]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (action: string) => {
    if (action.includes("APPROVED")) return "✓";
    if (action.includes("REJECTED")) return "×";
    if (action.includes("CHANGES")) return "!";
    if (action.includes("REVIEW")) return "↗";
    if (action.includes("SUBMITTED")) return "↑";
    if (action.includes("RESUBMITTED")) return "↻";
    return "•";
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0a0f1c] lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="text-xs font-semibold tracking-[0.22em] text-cyan-400">
            AFFILIATE PORTAL
          </div>
          <div className="mt-2 text-lg font-semibold">Partner Dashboard</div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <Link
            href="/affiliate"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/affiliate/application"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <span>▣</span>
            My Application
          </Link>

          <Link
            href="/affiliate/activity"
            className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300"
          >
            <span>◷</span>
            Activity
          </Link>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/");
            }}
            className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-64">
        <div className="border-b border-white/10 bg-[#080d18]/80 px-6 py-5 backdrop-blur-xl lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
                AFFILIATE PORTAL
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Activity History
              </h1>
            </div>

            <Link
              href="/affiliate"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-cyan-400">
              ACCOUNT ACTIVITY
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Everything in one place
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Track your application journey, review updates, and important
              account activity.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-sm text-slate-400">
                  Loading activity...
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-slate-400">
                  ◷
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  No activity yet
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Your application and account activity will appear here.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute bottom-4 left-[21px] top-4 w-px bg-white/10" />

                <div className="space-y-7">
                  {activities.map((activity) => (
                    <div key={activity._id} className="relative flex gap-5">
                      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-[#0c1423] text-sm font-semibold text-cyan-300 shadow-lg shadow-cyan-500/5">
                        {getIcon(activity.action)}
                      </div>

                      <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#0b111e] p-5 transition hover:border-white/20 hover:bg-white/[0.04]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-white">
                              {activity.action
                                .replaceAll("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                )}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-400">
                              {activity.description}
                            </p>
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <p className="text-xs font-medium text-slate-300">
                              {formatDate(activity.createdAt)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}