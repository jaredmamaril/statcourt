"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let activeScrollLocks = 0;
let originalBodyOverflow = "";

function lockBodyScroll() {
  if (activeScrollLocks === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  activeScrollLocks += 1;
}

function unlockBodyScroll() {
  activeScrollLocks = Math.max(activeScrollLocks - 1, 0);

  if (activeScrollLocks === 0) {
    document.body.style.overflow = originalBodyOverflow;
    originalBodyOverflow = "";
  }
}

type AccessibleDialogProps = {
  titleId: string;
  descriptionId?: string;
  onClose: () => void;
  children: ReactNode;
  overlayClassName: string;
  dialogClassName: string;
  dialogStyle?: CSSProperties;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => {
      const isHidden =
        element.hidden ||
        element.getAttribute("aria-hidden") === "true" ||
        element.offsetParent === null;

      return !isHidden;
    });
}

export function AccessibleDialog({
  titleId,
  descriptionId,
  onClose,
  children,
  overlayClassName,
  dialogClassName,
  dialogStyle,
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventScroll = true,
}: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const dialog = dialogRef.current;
    const firstFocusable = dialog ? getFocusableElements(dialog)[0] : null;

    window.setTimeout(() => {
      (firstFocusable ?? dialog)?.focus();
    }, 0);

    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    if (!preventScroll) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [preventScroll]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, onClose]);

  return (
    <div
      className={overlayClassName}
      onMouseDown={(event) => {
        if (!closeOnBackdrop || event.target !== event.currentTarget) return;

        onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={dialogClassName}
        style={dialogStyle}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
