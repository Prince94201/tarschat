"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "../shared/Avatar";
import { OnlineIndicator } from "../shared/OnlineIndicator";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { LoadingSkeleton } from "../shared/LoadingSkeleton";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

export function ChatWindow({ conversationId }: { conversationId: Id<"conversations"> }) {
    const { user } = useUser();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const conversation = useQuery(api.conversations.getConversationById, { conversationId });
    const markRead = useMutation(api.messages.markConversationRead);
    const deleteConversation = useMutation(api.conversations.deleteConversation);

    useEffect(() => {
        if (conversationId) {
            markRead({ conversationId }).catch(console.error);
        }
    }, [conversationId, markRead]);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteConversation({ conversationId });
            router.push("/");
        } catch (error) {
            console.error("Failed to delete conversation:", error);
            setIsDeleting(false);
        }
    };

    if (conversation === undefined) {
        return (
            <div className="flex-1 flex flex-col h-full bg-background">
                <div className="h-[72px] border-b p-4">
                    <LoadingSkeleton />
                </div>
                <div className="flex-1 p-4">
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-background">
                <p className="text-muted-foreground">Conversation not found</p>
                <Button variant="link" onClick={() => router.push("/")}>Go back home</Button>
            </div>
        );
    }

    let name = "Unknown";
    let imageUrl = undefined;
    let isOnline = false;

    if (conversation.isGroup) {
        name = conversation.groupName || "Group Chat";
    } else {
        const otherParticipant = conversation.participants.find(p => p.clerkId !== user?.id);
        if (otherParticipant) {
            name = otherParticipant.name;
            imageUrl = otherParticipant.imageUrl;
            isOnline = otherParticipant.isOnline;
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full w-full bg-background overflow-hidden relative">
            <div className="h-[76px] shrink-0 border-b flex items-center justify-between px-4 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Link href="/" className="md:hidden">
                        <Button variant="ghost" size="icon" className="shrink-0 -ml-2 rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>

                    <div className="relative shrink-0">
                        <Avatar imageUrl={imageUrl} name={name} size="md" />
                        {!conversation.isGroup && <OnlineIndicator isOnline={isOnline} />}
                    </div>

                    <div className="flex flex-col">
                        <h2 className="font-semibold text-base sm:text-lg text-foreground line-clamp-1 break-all">{name}</h2>
                        {!conversation.isGroup && (
                            <span className="text-[13px] text-muted-foreground font-medium">
                                {isOnline ? "Online" : "Offline"}
                            </span>
                        )}
                        {conversation.isGroup && (
                            <span className="text-[13px] text-muted-foreground line-clamp-1">
                                {conversation.participants.map(p => p.name.split(" ")[0]).join(", ")}
                            </span>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-muted transition-colors" disabled={isDeleting}>
                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer flex items-center gap-2"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? "Deleting..." : "Delete Chat"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <MessageList conversationId={conversationId} />

            <MessageInput conversationId={conversationId} />
        </div>
    );
}
