type DashboardErrorProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function DashboardError({
  title = "Dashboard unavailable",
  message,
  actionLabel,
  onAction
}: DashboardErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-destructive">
          Error
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {actionLabel}
          </button>
        ) : null}
      </section>
    </main>
  );
}
