import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Overall budget */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex items-end gap-2 mb-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-24 mb-1" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-4 w-36 mt-2" />
      </div>

      {/* Category budgets */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
