import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  className
}: MetricCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm",
        className
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-normal">{value}</p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      ) : null}
    </section>
  );
}
