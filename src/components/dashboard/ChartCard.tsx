"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({
  title,
  description,
  children,
  className
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm",
        className
      )}
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-4 h-72 w-full">{children}</div>
    </section>
  );
}
