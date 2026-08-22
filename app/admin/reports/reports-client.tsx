"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/app/components/supabase-client";

type AdminReportStatus = "open" | "reviewed" | "resolved" | "dismissed";
type AdminReportFilter = AdminReportStatus | "all";

type ReportProfile = {
  id: string;
  label: string;
  username: string | null;
};

type AdminReport = {
  id: string;
  created_at: string | null;
  reporter_id: string;
  reported_user_id: string;
  reported_username: string | null;
  reason: string;
  details: string | null;
  status: string;
  reporter: ReportProfile;
  reportedUser: ReportProfile;
};

type AdminReportsResponse = {
  reports?: AdminReport[];
  openCount?: number;
  filter?: AdminReportFilter;
};

const reportFilters: { label: string; value: AdminReportFilter }[] = [
  { label: "Open", value: "open" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
  { label: "All", value: "all" },
];

const reportStatuses: AdminReportStatus[] = [
  "open",
  "reviewed",
  "resolved",
  "dismissed",
];

function formatReportDate(value: string | null) {
  if (!value) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status: string) {
  if (status === "open") {
    return "border-yellow-300/35 bg-yellow-300/10 text-yellow-200";
  }

  if (status === "reviewed") {
    return "border-[rgb(var(--court-accent-rgb)/0.35)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)]";
  }

  if (status === "resolved") {
    return "border-emerald-300/35 bg-emerald-300/10 text-emerald-200";
  }

  return "border-white/18 bg-white/8 text-white/60";
}

function getDisplayId(id: string) {
  return id.slice(0, 8);
}

export function AdminReportsClient() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [activeFilter, setActiveFilter] = useState<AdminReportFilter>("open");
  const [openCount, setOpenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        if (!isActive) return;

        setReports([]);
        setErrorMessage("Sign in again to view admin reports.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/reports?status=${activeFilter}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!isActive) return;

      if (!response.ok) {
        setReports([]);
        setErrorMessage("Could not load reports.");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as AdminReportsResponse;

      if (!isActive) return;

      setReports(data.reports ?? []);
      setOpenCount(data.openCount ?? 0);
      setIsLoading(false);
    }

    loadReports().catch((error) => {
      console.warn("Failed to load admin reports", error);

      if (!isActive) return;

      setReports([]);
      setErrorMessage("Could not load reports.");
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [activeFilter, reloadKey]);

  const reportCountLabel = useMemo(() => {
    if (isLoading) return "Loading";

    return `${reports.length} report${reports.length === 1 ? "" : "s"}`;
  }, [isLoading, reports.length]);

  async function updateReportStatus(
    report: AdminReport,
    nextStatus: AdminReportStatus,
  ) {
    if (nextStatus === report.status) return;

    if (
      (nextStatus === "resolved" || nextStatus === "dismissed") &&
      !window.confirm(`Mark this report as ${nextStatus}?`)
    ) {
      return;
    }

    setUpdatingReportId(report.id);
    setErrorMessage("");
    setStatusMessage("Updating report status...");

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      setErrorMessage("Sign in again to update reports.");
      setStatusMessage("");
      setUpdatingReportId(null);
      return;
    }

    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId: report.id,
        status: nextStatus,
      }),
    });

    if (!response.ok) {
      setErrorMessage("Could not update report.");
      setStatusMessage("");
      setUpdatingReportId(null);
      return;
    }

    setReports((currentReports) =>
      currentReports.map((currentReport) =>
        currentReport.id === report.id
          ? { ...currentReport, status: nextStatus }
          : currentReport,
      ),
    );
    setStatusMessage("Report status updated.");
    setUpdatingReportId(null);
    setReloadKey((current) => current + 1);
  }

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-background px-3 py-6 text-white lg:px-6 lg:py-10">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "var(--court-pattern)",
          backgroundPosition: "top left",
          backgroundSize: "900px auto",
        }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="rounded-lg border border-[rgb(var(--court-accent-rgb)/0.25)] bg-[color:color-mix(in_srgb,var(--court-panel)_91%,black)] p-4 shadow-[0_0_24px_rgba(0,0,0,0.28)] lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[rgb(var(--court-accent-rgb)/0.1)] text-[var(--court-accent)]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </div>

                <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)] lg:text-[10px]">
                  StatCourt Admin
                </p>
              </div>

              <h1 className="mt-3 font-michroma text-xl uppercase leading-tight text-white lg:text-3xl">
                Report Review
              </h1>

              <p className="mt-2 max-w-2xl font-michroma text-[8px] leading-relaxed text-white/55 lg:text-[11px]">
                Review public profile reports and update moderation status.
                This dashboard does not perform bans, suspensions, or account
                actions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-72">
              <div className="rounded-md border border-yellow-300/25 bg-yellow-300/8 p-3">
                <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[8px]">
                  Open Reports
                </p>
                <p className="mt-1 font-michroma text-lg text-yellow-200 lg:text-2xl">
                  {openCount}
                </p>
              </div>

              <div className="rounded-md border border-white/12 bg-black/22 p-3">
                <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[8px]">
                  Current View
                </p>
                <p className="mt-1 font-michroma text-sm uppercase text-white lg:text-lg">
                  {reportCountLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Report filters">
          {reportFilters.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`h-9 rounded-md border px-3 font-michroma text-[7px] uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--court-accent-rgb)/0.75)] focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:text-[9px] ${
                  isActive
                    ? "border-[rgb(var(--court-accent-rgb)/0.5)] bg-[rgb(var(--court-accent-rgb)/0.18)] text-[var(--court-accent)]"
                    : "border-white/12 bg-black/20 text-white/48 hover:border-white/24 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {(statusMessage || errorMessage) && (
          <p
            className={`mt-4 rounded-md border px-3 py-2 font-michroma text-[8px] uppercase lg:text-[10px] ${
              errorMessage
                ? "border-red-300/25 bg-red-300/8 text-red-200"
                : "border-emerald-300/25 bg-emerald-300/8 text-emerald-200"
            }`}
            role={errorMessage ? "alert" : "status"}
          >
            {errorMessage || statusMessage}
          </p>
        )}

        {isLoading ? (
          <div
            className="mt-4 rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_84%,black)] p-5 text-center"
            aria-busy="true"
          >
            <p className="font-michroma text-[9px] uppercase text-white/55">
              Loading reports...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-4 rounded-lg border border-white/10 bg-[color:color-mix(in_srgb,var(--court-panel)_84%,black)] p-8 text-center">
            <CheckCircle2
              className="mx-auto h-8 w-8 text-emerald-200/70"
              aria-hidden="true"
            />
            <p className="mt-4 font-michroma text-[10px] uppercase text-white lg:text-sm">
              No reports found.
            </p>
            <p className="mx-auto mt-2 max-w-md font-michroma text-[8px] leading-relaxed text-white/45 lg:text-[10px]">
              There are no reports in this moderation filter.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-lg border border-white/12 bg-[color:color-mix(in_srgb,var(--court-panel)_89%,black)] p-3 shadow-[0_0_18px_rgba(0,0,0,0.22)] lg:p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded border px-2 py-1 font-michroma text-[7px] uppercase lg:text-[8px] ${getStatusClass(
                          report.status,
                        )}`}
                      >
                        {report.status}
                      </span>

                      <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[9px]">
                        Report {getDisplayId(report.id)}
                      </p>
                    </div>

                    <h2 className="mt-3 font-michroma text-[11px] uppercase text-white lg:text-base">
                      {report.reason}
                    </h2>

                    <p className="mt-1 font-michroma text-[8px] text-white/45 lg:text-[10px]">
                      {formatReportDate(report.created_at)}
                    </p>
                  </div>

                  <div className="grid gap-1.5 lg:min-w-56">
                    <label
                      htmlFor={`report-status-${report.id}`}
                      className="font-michroma text-[7px] uppercase text-white/45 lg:text-[8px]"
                    >
                      Moderation Status
                    </label>
                    <select
                      id={`report-status-${report.id}`}
                      value={report.status}
                      disabled={updatingReportId === report.id}
                      onChange={(event) =>
                        updateReportStatus(
                          report,
                          event.target.value as AdminReportStatus,
                        )
                      }
                      className="h-10 rounded-md border border-[rgb(var(--court-accent-rgb)/0.25)] bg-black px-3 font-michroma text-[8px] uppercase text-white outline-none transition focus:border-[rgb(var(--court-accent-rgb)/0.65)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--court-accent-rgb)/0.75)] disabled:cursor-not-allowed disabled:opacity-55 lg:text-[10px]"
                    >
                      {reportStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 lg:grid-cols-2">
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[8px]">
                      Reporter
                    </p>
                    <p className="mt-1 truncate font-michroma text-[9px] text-white lg:text-[11px]">
                      {report.reporter.label}
                    </p>
                    <p className="mt-1 font-michroma text-[7px] text-white/38 lg:text-[8px]">
                      {report.reporter.username
                        ? `@${report.reporter.username}`
                        : report.reporter.id}
                    </p>
                  </div>

                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[8px]">
                      Reported User
                    </p>
                    <p className="mt-1 truncate font-michroma text-[9px] text-white lg:text-[11px]">
                      {report.reportedUser.label}
                    </p>
                    <p className="mt-1 font-michroma text-[7px] text-white/38 lg:text-[8px]">
                      {report.reportedUser.username
                        ? `@${report.reportedUser.username}`
                        : report.reportedUser.id}
                    </p>
                  </div>
                </div>

                {report.details ? (
                  <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-yellow-200"
                        aria-hidden="true"
                      />
                      <p className="font-michroma text-[7px] uppercase text-white/45 lg:text-[8px]">
                        Details
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words font-michroma text-[8px] leading-relaxed text-white/65 lg:text-[10px]">
                      {report.details}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
