// nexus/frontend/src/components/ui/Skeleton.tsx
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-bg-4 border border-border/50',
        className,
      )}
    />
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="glass-panel border border-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12 rounded" />
        <Skeleton className="h-12 rounded" />
      </div>
      <Skeleton className="h-8 rounded" />
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded" />
        ))}
      </div>
      <Skeleton className="h-20 rounded" />
      <Skeleton className="h-10 rounded" />
    </div>
  );
}
