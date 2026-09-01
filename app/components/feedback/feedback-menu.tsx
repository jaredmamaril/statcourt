"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp, Loader2, MessageSquare, Send, X } from "lucide-react";
import { supabase } from "../supabase-client";

type FeedbackItem = {
  id: string;
  type: FeedbackType;
  title: string;
  details: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  voteCount: number;
  hasVoted: boolean;
};

type FeedbackMenuProps = {
  isSignedIn: boolean;
};

const FEEDBACK_TYPES = [
  { value: "feature_request", label: "Feature" },
  { value: "bug", label: "Bug" },
  { value: "ui_design", label: "UI" },
  { value: "data_issue", label: "Data" },
  { value: "other", label: "Other" },
] as const;

const feedbackTypeLabels = new Map(
  FEEDBACK_TYPES.map((type) => [type.value, type.label]),
);

type FeedbackType = (typeof FEEDBACK_TYPES)[number]["value"];

function getSafeMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return fallback;
  }

  const message = (value as { error?: unknown }).error;

  return typeof message === "string" && message ? message : fallback;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function FeedbackMenu({ isSignedIn }: FeedbackMenuProps) {
  const pathname = usePathname();
  const panelId = "statcourt-feedback-panel";
  const titleId = "statcourt-feedback-title";
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyVoteId, setBusyVoteId] = useState<string | null>(null);
  const [type, setType] = useState<FeedbackType>("feature_request");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers: HeadersInit = session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};

    try {
      const response = await fetch("/api/feedback", {
        headers,
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok) {
        setError(getSafeMessage(payload, "Could not load feedback."));
        return;
      }

      const nextItems =
        payload &&
        typeof payload === "object" &&
        "items" in payload &&
        Array.isArray((payload as { items?: unknown }).items)
          ? ((payload as { items: FeedbackItem[] }).items ?? [])
          : [];

      setItems(nextItems);
    } catch {
      setError("Could not load feedback.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setMessage("");

    const accessToken = await getAccessToken();

    if (!accessToken) {
      setError("Sign in to send feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title,
          details,
          pageUrl: pathname,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok) {
        setError(getSafeMessage(payload, "Could not send feedback."));
        return;
      }

      setTitle("");
      setDetails("");
      setMessage("Feedback sent.");
      await loadFeedback();
    } catch {
      setError("Could not send feedback.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleVote(item: FeedbackItem) {
    if (busyVoteId) return;

    setError("");
    setMessage("");

    const accessToken = await getAccessToken();

    if (!accessToken) {
      setError("Sign in to vote on feedback.");
      return;
    }

    setBusyVoteId(item.id);

    try {
      const response = await fetch("/api/feedback/votes", {
        method: item.hasVoted ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackItemId: item.id }),
      });
      const payload = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok) {
        setError(getSafeMessage(payload, "Could not update feedback vote."));
        return;
      }

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                hasVoted: !currentItem.hasVoted,
                voteCount: currentItem.voteCount + (currentItem.hasVoted ? -1 : 1),
              }
            : currentItem,
        ),
      );
      setMessage(item.hasVoted ? "Vote removed." : "Vote added.");
    } catch {
      setError("Could not update feedback vote.");
    } finally {
      setBusyVoteId(null);
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen((current) => {
            const shouldOpen = !current;

            if (shouldOpen) {
              void loadFeedback();
            }

            return shouldOpen;
          });
        }}
        className="group inline-flex min-h-11 items-center gap-1.5 rounded-md border border-[color:rgb(var(--court-accent-rgb)/0.45)] bg-[color:rgb(var(--court-accent-rgb)/0.08)] px-2.5 py-2 font-michroma text-[7px] uppercase tracking-wide text-[var(--court-accent)] shadow-[0_0_14px_rgb(var(--court-accent-rgb)/0.16)] transition hover:border-[color:rgb(var(--court-accent-rgb)/0.75)] hover:bg-[color:rgb(var(--court-accent-rgb)/0.14)] hover:text-white lg:px-3 lg:text-[9px]"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
      >
        <MessageSquare
          className="h-3 w-3 transition group-hover:brightness-125 lg:h-3.5 lg:w-3.5"
          aria-hidden="true"
        />
        <span className="hidden min-[420px]:inline">Feedback</span>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-labelledby={titleId}
        className={`fixed inset-x-2 top-14 z-999 max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-md border border-[color:rgb(var(--court-accent-rgb)/0.28)] bg-[color:color-mix(in_srgb,var(--court-panel)_96%,black)] p-2.5 shadow-[0_0_28px_rgba(0,0,0,0.45)] transition lg:absolute lg:inset-x-auto lg:right-0 lg:top-12 lg:max-h-[calc(100vh-5rem)] lg:w-[24rem] lg:p-3 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-michroma text-[9px] uppercase text-white lg:text-[10px]"
            >
              Feedback Board
            </h2>
            <p className="mt-0.5 text-[10px] leading-snug text-white/65 lg:text-[11px]">
              Share ideas and vote on what should improve next.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              buttonRef.current?.focus();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:border-[color:rgb(var(--court-accent-rgb)/0.45)] hover:text-white lg:h-9 lg:w-9"
            aria-label="Close feedback"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {message ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100"
          >
            {message}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-100"
          >
            {error}
          </p>
        ) : null}

        <form onSubmit={submitFeedback} className="mt-3 space-y-2">
          <label htmlFor="feedback-type" className="sr-only">
            Feedback type
          </label>
          <select
            id="feedback-type"
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as FeedbackType,
              )
            }
            className="h-9 w-full rounded-md border border-white/15 bg-black/30 px-2.5 font-michroma text-[9px] uppercase text-white outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--court-accent)] lg:h-10 lg:px-3 lg:text-[10px]"
          >
            {FEEDBACK_TYPES.map((feedbackType) => (
              <option
                key={feedbackType.value}
                value={feedbackType.value}
                className="bg-slate-950 text-white"
              >
                {feedbackType.label}
              </option>
            ))}
          </select>

          <label htmlFor="feedback-title" className="sr-only">
            Feedback title
          </label>
          <input
            id="feedback-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="Short title"
            disabled={!isSignedIn || isSubmitting}
            className="h-9 w-full rounded-md border border-white/15 bg-black/30 px-2.5 text-base text-white outline-none transition placeholder:text-white/45 focus-visible:ring-2 focus-visible:ring-[var(--court-accent)] disabled:cursor-not-allowed disabled:opacity-60 lg:h-10 lg:px-3"
          />

          <label htmlFor="feedback-details" className="sr-only">
            Feedback details
          </label>
          <textarea
            id="feedback-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={1200}
            placeholder="What should change?"
            disabled={!isSignedIn || isSubmitting}
            rows={2}
            className="w-full resize-none rounded-md border border-white/15 bg-black/30 px-2.5 py-2 text-sm text-white outline-none transition placeholder:text-white/45 focus-visible:ring-2 focus-visible:ring-[var(--court-accent)] disabled:cursor-not-allowed disabled:opacity-60 lg:px-3"
          />

          {isSignedIn ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[color:rgb(var(--court-accent-rgb)/0.55)] bg-[color:rgb(var(--court-accent-rgb)/0.12)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] transition hover:border-[var(--court-accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-11 lg:text-[9px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Send Feedback
            </button>
          ) : (
            <Link
              href="/signin?next=/community"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-[color:rgb(var(--court-accent-rgb)/0.45)] px-3 py-2 font-michroma text-[8px] uppercase text-[var(--court-accent)] transition hover:border-[var(--court-accent)] hover:text-white lg:min-h-11 lg:text-[9px]"
              onClick={() => setIsOpen(false)}
            >
              Sign In To Send Feedback
            </Link>
          )}
        </form>

        <div className="mt-3 border-t border-white/10 pt-2.5 lg:mt-4 lg:pt-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-michroma text-[9px] uppercase text-white/75">
              Ideas
            </p>
            {isLoading ? (
              <Loader2
                className="h-3.5 w-3.5 animate-spin text-[var(--court-accent)]"
                aria-hidden="true"
              />
            ) : null}
          </div>

          <div
            className="max-h-52 space-y-2 overflow-y-auto pr-1 lg:max-h-72"
            aria-busy={isLoading}
          >
            {isLoading && !items.length ? (
              <p role="status" className="py-5 text-center text-xs text-white/65">
                Loading feedback.
              </p>
            ) : null}

            {!isLoading && !items.length ? (
              <p className="rounded-md border border-white/10 bg-white/5 px-3 py-4 text-center text-xs text-white/65">
                No public feedback yet.
              </p>
            ) : null}

            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-white/10 bg-black/25 p-2.5 lg:p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-michroma text-[8px] uppercase text-[var(--court-accent)]">
                      {feedbackTypeLabels.get(item.type) ?? "Feedback"} -{" "}
                      {formatStatus(item.status)}
                    </p>
                    <h3 className="mt-1 truncate text-[13px] font-semibold text-white lg:text-sm">
                      {item.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => void toggleVote(item)}
                    disabled={busyVoteId === item.id}
                    className={`flex min-h-10 min-w-10 shrink-0 flex-col items-center justify-center rounded-md border px-2 py-1 font-michroma text-[8px] transition disabled:cursor-not-allowed disabled:opacity-60 lg:min-h-11 lg:min-w-11 lg:text-[9px] ${
                      item.hasVoted
                        ? "border-[var(--court-accent)] bg-[color:rgb(var(--court-accent-rgb)/0.14)] text-[var(--court-accent)]"
                        : "border-white/10 text-white/70 hover:border-[color:rgb(var(--court-accent-rgb)/0.5)] hover:text-white"
                    }`}
                    aria-pressed={item.hasVoted}
                    aria-label={
                      item.hasVoted
                        ? `Remove your vote from ${item.title}`
                        : `Vote for ${item.title}`
                    }
                  >
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                    {item.voteCount}
                  </button>
                </div>

                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/70 lg:line-clamp-3 lg:text-xs">
                  {item.details}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
