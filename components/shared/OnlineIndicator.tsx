interface OnlineIndicatorProps {
    isOnline?: boolean;
}

export function OnlineIndicator({ isOnline }: OnlineIndicatorProps) {
    return (
        <span
            className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background ${isOnline ? "bg-green-500" : "bg-muted-foreground"
                }`}
        />
    );
}
