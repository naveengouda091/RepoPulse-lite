import type { DashboardHealth } from "@/types/dashboard";

type HealthScoreCardProps = {
  health: DashboardHealth;
};

function getScoreColor(score: number): string {
  if (score >= 85) {
    return "bg-emerald-600";
  }

  if (score >= 70) {
    return "bg-lime-600";
  }

  if (score >= 55) {
    return "bg-amber-500";
  }

  if (score >= 40) {
    return "bg-orange-600";
  }

  return "bg-red-600";
}

export function HealthScoreCard({ health }: HealthScoreCardProps) {
  const score = Number.isFinite(health.score)
    ? Math.min(100, Math.max(0, health.score))
    : 0;

  return (
    <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Health Score
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-normal">
            {score}
            <span className="text-xl text-muted-foreground">/100</span>
          </p>
        </div>
        <span className="rounded-md border border-border px-3 py-1 text-sm font-medium">
          Grade {health.grade}
        </span>
      </div>
      <div className="mt-6 h-2 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </section>
  );
}
