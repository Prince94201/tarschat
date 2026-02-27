import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-background">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm">{subtitle}</p>
        </div>
    );
}
