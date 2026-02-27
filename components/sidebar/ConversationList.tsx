"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationItem } from "./ConversationItem";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import { EmptyState } from "../shared/EmptyState";
import { MessageSquare } from "lucide-react";

export function ConversationList() {
    const conversations = useQuery(api.conversations.getConversations);

    if (conversations === undefined) {
        return <LoadingSkeleton />;
    }

    if (conversations.length === 0) {
        return (
            <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                subtitle="Search for a user above to start chatting."
            />
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-1 p-2 w-full h-full">
            {conversations.map((conv) => {
                let name = "Unknown";
                let imageUrl = undefined;
                let isOnline = false;

                if (conv.isGroup) {
                    name = conv.groupName || "Group Chat";
                } else if (conv.otherParticipant) {
                    name = conv.otherParticipant.name;
                    imageUrl = conv.otherParticipant.imageUrl;
                    isOnline = conv.otherParticipant.isOnline;
                }

                return (
                    <ConversationItem
                        key={conv._id}
                        id={conv._id}
                        name={name}
                        imageUrl={imageUrl}
                        isOnline={isOnline}
                        lastMessage={conv.lastMessage}
                        isGroup={conv.isGroup}
                    />
                );
            })}
        </div>
    );
}
