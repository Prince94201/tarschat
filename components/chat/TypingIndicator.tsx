"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function TypingIndicator({ conversationId }: { conversationId: Id<"conversations"> }) {
    const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });

    if (!typingUsers || typingUsers.length === 0) return null;

    const names = typingUsers.map((u) => u.name).join(", ");
    const text = typingUsers.length === 1 ? `${names} is typing` : `${names} are typing`;

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 ml-10">
            <span>{text}</span>
            <div className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
            </div>
        </div>
    );
}
