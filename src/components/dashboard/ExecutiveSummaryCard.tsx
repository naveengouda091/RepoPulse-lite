import type { DashboardExecutiveSummary } from "@/types/dashboard";

type ExecutiveSummaryCardProps = {
  summary: DashboardExecutiveSummary;
};

const summaryItems = [
  {
    key: "developmentMomentum",
    label: "Development Momentum"
  },
  {
    key: "operationalRisks",
    label: "Operational Risks"
  },
  {
    key: "commitHygiene",
    label: "Commit Hygiene"
  }
] as const;

export function ExecutiveSummaryCard({ summary }: ExecutiveSummaryCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">
        Executive Summary
      </p>
      <div className="mt-4 grid gap-4">
        {summaryItems.map((item) => (
          <div
            key={item.key}
            className="border-t border-border pt-4 first:border-t-0 first:pt-0"
          >
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {summary[item.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
