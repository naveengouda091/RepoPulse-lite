type EmptyChartStateProps = {
  message?: string;
};

export function EmptyChartState({
  message = "Chart data is not available yet."
}: EmptyChartStateProps) {
  return (
    <div className="flex h-full min-h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 px-4 text-center">
      <p className="max-w-xs text-sm leading-6 text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
