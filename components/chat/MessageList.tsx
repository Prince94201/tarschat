"use client";

import { useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import { EmptyState } from "../shared/EmptyState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { MessageSquarePlus } from "lucide-react";

export function MessageList({ conversationId }: { conversationId: Id<"conversations"> }) {
    const { user } = useUser();
    const messages = useQuery(api.messages.getMessages, { conversationId });
    const scrollRef = useRef<HTMLDivElement>(null);

    const { isAtBottom, scrollToBottom, unreadCount } = useAutoScroll(
        scrollRef,
        messages || [],
        user?.id
    );

    if (messages === undefined) {
        return <LoadingSkeleton />;
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col pt-20 h-full">
                <EmptyState
                    icon={MessageSquarePlus}
                    title="No messages yet"
                    subtitle="Say hello and start the conversation!"
                />
            </div>
        );
    }

    return (
        <div className="relative flex-1 overflow-hidden flex flex-col bg-muted/10 h-full">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 pb-6"
            >
                <div className="flex flex-col justify-end min-h-full space-y-2">
                    {messages.map((message) => (
                        <MessageItem
                            key={message._id}
                            message={message}
                            isOwnMessage={message.senderId === user?.id}
                            currentUserId={user?.id}
                        />
                    ))}

                    <TypingIndicator conversationId={conversationId} />
                </div>
            </div>

            <ScrollToBottomButton
                isVisible={!isAtBottom && (messages.length > 5 || unreadCount > 0)}
                onClick={scrollToBottom}
                unreadCount={unreadCount}
            />
        </div>
    );
}
