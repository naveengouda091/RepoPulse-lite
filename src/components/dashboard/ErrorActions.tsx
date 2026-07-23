"use client";

import type { AppErrorAction } from "@/types/app-error";

type ErrorActionsProps = {
  primaryAction?: AppErrorAction;
  secondaryAction?: AppErrorAction;
};

export function ErrorActions({
  primaryAction,
  secondaryAction
}: ErrorActionsProps) {
  if (!primaryAction && !secondaryAction) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      {primaryAction ? (
        <button
          type="button"
          onClick={primaryAction.onClick}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {primaryAction.label}
        </button>
      ) : null}
      {secondaryAction ? (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {secondaryAction.label}
        </button>
      ) : null}
    </div>
  );
}
