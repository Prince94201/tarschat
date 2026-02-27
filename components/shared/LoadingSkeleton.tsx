import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4 w-full h-full">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full max-w-[250px]" />
                        <Skeleton className="h-4 w-full max-w-[200px]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
