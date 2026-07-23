import type { DashboardRepository } from "@/types/dashboard";

type RepositoryHeaderProps = {
  repository: DashboardRepository;
};

export function RepositoryHeader({ repository }: RepositoryHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Repository
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          {repository.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {repository.fullName}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:min-w-72">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stars
          </p>
          <p className="mt-1 text-2xl font-semibold">{repository.stars}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Forks
          </p>
          <p className="mt-1 text-2xl font-semibold">{repository.forks}</p>
        </div>
      </div>
    </header>
  );
}
