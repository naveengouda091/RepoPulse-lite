"use client";

import { DashboardError } from "@/components/dashboard/DashboardError";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <DashboardError
      message={error.message || "The dashboard could not be rendered."}
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
