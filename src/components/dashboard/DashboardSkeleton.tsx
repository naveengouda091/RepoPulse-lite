function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="border-b border-border pb-6">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-3 h-10 w-full max-w-sm" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-xs" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-64" />
        </div>
      </div>
    </main>
  );
}
