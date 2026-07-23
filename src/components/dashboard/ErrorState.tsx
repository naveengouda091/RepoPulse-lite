"use client";

import type { AppErrorPresentation } from "@/types/app-error";

type ErrorStateProps = AppErrorPresentation & {
  compact?: boolean;
};

export function ErrorState({
  eyebrow,
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
  compact = false
}: ErrorStateProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-destructive">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-normal">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
      {!compact && details ? (
        <p className="mt-4 rounded-md border border-border bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
          {details}
        </p>
      ) : null}
      {primaryAction || secondaryAction ? (
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
      ) : null}
    </section>
  );
}
