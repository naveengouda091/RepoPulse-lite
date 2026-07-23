import { DashboardError } from "@/components/dashboard/DashboardError";

export default function NotFound() {
  return (
    <DashboardError
      kind="not-found"
      eyebrow="Not Found"
      title="This page could not be found."
      message="Check the URL and return to the dashboard when you are ready to analyze a repository."
    />
  );
}
