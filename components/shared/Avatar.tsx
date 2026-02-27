import { Avatar as BaseAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarProps {
    imageUrl?: string;
    name?: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
};

export function Avatar({ imageUrl, name, size = "md" }: AvatarProps) {
    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "?";

    return (
        <BaseAvatar className={sizeClasses[size]}>
            <AvatarImage src={imageUrl} alt={name || "Avatar"} />
            <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
            </AvatarFallback>
        </BaseAvatar>
    );
}
