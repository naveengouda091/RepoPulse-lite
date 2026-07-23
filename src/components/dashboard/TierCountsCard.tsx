import type { DashboardTierCounts } from "@/types/dashboard";

type TierCountsCardProps = {
  tierCounts: DashboardTierCounts;
};

const tiers = [
  {
    key: "tier1",
    label: "Tier 1",
    detail: "Low change volume"
  },
  {
    key: "tier2",
    label: "Tier 2",
    detail: "Moderate complexity"
  },
  {
    key: "tier3",
    label: "Tier 3",
    detail: "Large or risky"
  }
] as const;

export function TierCountsCard({ tierCounts }: TierCountsCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Tier Counts</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.key} className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">{tier.label}</p>
            <p className="mt-2 text-3xl font-semibold">
              {tierCounts[tier.key]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{tier.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
