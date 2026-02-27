"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "../shared/Avatar";
import { OnlineIndicator } from "../shared/OnlineIndicator";
import { formatMessageTime } from "@/lib/formatTime";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationItemProps {
    id: Id<"conversations">;
    name: string;
    imageUrl?: string;
    isOnline?: boolean;
    lastMessage?: { content: string; _creationTime: number; senderId: string } | null;
    isGroup: boolean;
}

export function ConversationItem({ id, name, imageUrl, isOnline, lastMessage, isGroup }: ConversationItemProps) {
    const pathname = usePathname();
    const isActive = pathname === `/conversation/${id}`;

    const unreadCount = useQuery(api.messages.getUnreadCount, { conversationId: id }) || 0;

    return (
        <Link href={`/conversation/${id}`} className="block w-full">
            <div className={`w-full flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${isActive ? "bg-primary/10" : "hover:bg-muted/50"}`}>
                <div className="relative shrink-0">
                    <Avatar imageUrl={imageUrl} name={name} size="md" />
                    {!isGroup && <OnlineIndicator isOnline={isOnline} />}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-sm truncate">{name}</h3>
                        {lastMessage && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                {formatMessageTime(lastMessage._creationTime)}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between items-center gap-2 w-full">
                        <p className="text-xs text-muted-foreground truncate flex-1 block">
                            {lastMessage ? lastMessage.content : "Start a conversation"}
                        </p>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 text-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
