"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { StatMode } from "../court-data";
import {
  buildRedditShareUrl,
  buildXShareUrl,
  trackShare,
  withModeParam,
  type ShareMethod,
} from "../../lib/share";

type ShareButtonProps = {
  // Page path to share (e.g. the player's canonical path or "/rankings"); the stat
  // mode is added as ?mode=.
  path: string;
  mode: StatMode;
  slug: string | null;
  title: string;
  text: string;
  // Share card image for "Download image" (player pages only).
  imagePath?: string;
};

const STATUS_CLEAR_MS = 2_500;

// Copies text to the clipboard, falling back to a hidden textarea where the async
// Clipboard API isn't available (e.g. older browsers or non-secure contexts).
export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback.
    }
  }

  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

// The native share sheet is used on touch devices; desktop gets the menu instead.
function canUseNativeShare() {
  return (
    typeof navigator.share === "function" &&
    window.matchMedia?.("(pointer: coarse)").matches === true
  );
}

export function ShareButton({ path, mode, slug, title, text, imagePath }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const statusTimeoutRef = useRef<number | null>(null);
  const menuId = useId();

  function getShareUrl() {
    return new URL(withModeParam(path, mode), window.location.origin).toString();
  }

  function showStatus(message: string) {
    setStatus(message);

    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);

    statusTimeoutRef.current = window.setTimeout(() => setStatus(""), STATUS_CLEAR_MS);
  }

  function track(method: ShareMethod) {
    trackShare(method, mode, slug);
  }

  useEffect(() => {
    if (!isOpen) return;

    firstItemRef.current?.focus();

    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    },
    [],
  );

  async function handleShareClick() {
    if (!canUseNativeShare()) {
      setIsOpen((open) => !open);
      return;
    }

    try {
      await navigator.share({ title, text, url: getShareUrl() });
      track("native");
    } catch (error) {
      // Closing the share sheet isn't an error; anything else falls back to the menu.
      if ((error as DOMException)?.name !== "AbortError") setIsOpen(true);
    }
  }

  async function handleCopy() {
    const copied = await copyText(getShareUrl());

    setIsOpen(false);
    showStatus(copied ? "Link copied" : "Couldn't copy the link");

    if (copied) track("copy");
  }

  function openShareWindow(url: string, method: ShareMethod) {
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    track(method);
  }

  async function handleDownload() {
    if (!imagePath) return;

    setIsOpen(false);

    try {
      const response = await fetch(imagePath);

      if (!response.ok) throw new Error(`Image request failed: ${response.status}`);

      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `${slug ?? "statcourt"}-${mode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      track("download");
    } catch {
      showStatus("Couldn't download the image");
    }
  }

  const menuItemClass =
    "block w-full cursor-pointer px-3 py-2 text-left font-michroma text-[8px] uppercase text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none lg:text-[10px]";

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleShareClick}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className="rounded-md border border-[rgb(var(--court-accent-rgb)/0.55)] bg-[rgb(var(--court-accent-rgb)/0.12)] px-2.5 py-1.5 font-michroma text-[7px] uppercase text-[var(--court-accent)] transition hover:scale-[1.03] hover:bg-[rgb(var(--court-accent-rgb)/0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--court-accent)] lg:px-3 lg:text-[9px]"
      >
        Share
      </button>

      <span role="status" aria-live="polite" className="font-michroma text-[7px] text-white/60 lg:text-[9px]">
        {status}
      </span>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Share options"
          className="absolute left-0 top-full z-80 mt-1.5 w-max min-w-40 rounded-md border border-white/20 bg-[var(--court-panel-alt)] py-1 shadow-[0_0_18px_rgba(0,0,0,0.45)] animate-[dropdownIn_140ms_ease-out_both]"
        >
          <button ref={firstItemRef} type="button" role="menuitem" className={menuItemClass} onClick={handleCopy}>
            Copy link
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => openShareWindow(buildXShareUrl({ url: getShareUrl(), text }), "x")}
          >
            Share on X
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() =>
              openShareWindow(buildRedditShareUrl({ url: getShareUrl(), title: text }), "reddit")
            }
          >
            Share on Reddit
          </button>
          {imagePath && (
            <button type="button" role="menuitem" className={menuItemClass} onClick={handleDownload}>
              Download image
            </button>
          )}
        </div>
      )}
    </div>
  );
}
