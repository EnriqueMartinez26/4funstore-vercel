import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Hero skeleton */}
      <Skeleton className="h-[500px] w-full rounded-none" />

      <div className="container mx-auto px-4 space-y-12 md:space-y-16">
        {/* Platforms section skeleton */}
        <section>
          <Skeleton className="h-10 w-72 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </section>

        {/* Genres section skeleton */}
        <section>
          <Skeleton className="h-10 w-72 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
