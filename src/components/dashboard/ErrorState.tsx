"use client";

import type { AppErrorPresentation } from "@/types/app-error";
import { ErrorActions } from "./ErrorActions";

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
      <ErrorActions
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      />
    </section>
  );
}
