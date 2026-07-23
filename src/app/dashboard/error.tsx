"use client";

import { DashboardError } from "@/components/dashboard/DashboardError";
import { createErrorPresentation } from "@/lib/errors/presentation";

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({
  error,
  reset
}: DashboardErrorPageProps) {
  return <DashboardError {...createErrorPresentation(error, reset)} />;
}
