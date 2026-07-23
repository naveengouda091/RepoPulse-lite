"use client";

import type { AppErrorPresentation } from "@/types/app-error";
import { ErrorActions } from "./ErrorActions";

type DashboardErrorProps = AppErrorPresentation;

export function DashboardError({
  eyebrow,
  title,
  message,
  details,
  primaryAction,
  secondaryAction
}: DashboardErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-destructive">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
        {details ? (
          <p className="mt-4 rounded-md border border-border bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
            {details}
          </p>
        ) : null}
        <ErrorActions
          primaryAction={primaryAction}
          secondaryAction={secondaryAction}
        />
      </section>
    </main>
  );
}
