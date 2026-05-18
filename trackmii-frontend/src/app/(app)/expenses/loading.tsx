import { Skeleton } from "@/components/ui/skeleton";

export default function ExpensesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-28 rounded-lg" />
      </div>

      {/* Expense rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="h-3 w-3 rounded-full shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
