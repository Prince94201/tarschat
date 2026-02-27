"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "../shared/Avatar";
import { formatMessageTime } from "@/lib/formatTime";
import { Trash2 } from "lucide-react";

interface Reaction {
    emoji: string;
    userId: string;
}

interface Message {
    _id: Id<"messages">;
    _creationTime: number;
    content: string;
    isDeleted: boolean;
    reactions: Reaction[];
    senderId: string;
    sender: any; // User object
}

interface MessageItemProps {
    message: Message;
    isOwnMessage: boolean;
    currentUserId: string | undefined;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export function MessageItem({ message, isOwnMessage, currentUserId }: MessageItemProps) {
    const [showPicker, setShowPicker] = useState(false);

    const deleteMessage = useMutation(api.messages.deleteMessage);
    const addReaction = useMutation(api.messages.addReaction);

    const handleDelete = () => {
        deleteMessage({ messageId: message._id }).catch(console.error);
    };

    const handleFocus = () => setShowPicker(true);
    const handleBlur = () => setShowPicker(false);
    const handleReaction = (emoji: string) => {
        addReaction({ messageId: message._id, emoji }).catch(console.error);
        setShowPicker(false);
    };

    const groupedReactions = message.reactions.reduce((acc, current) => {
        if (!acc[current.emoji]) acc[current.emoji] = [];
        acc[current.emoji].push(current.userId);
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <div
            className={`flex w-full mt-4 group ${isOwnMessage ? "justify-end" : "justify-start"}`}
            onMouseEnter={handleFocus}
            onMouseLeave={handleBlur}
        >
            <div className={`flex gap-3 max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                {!isOwnMessage && (
                    <div className="flex-shrink-0 mt-1">
                        <Avatar imageUrl={message.sender?.imageUrl} name={message.sender?.name} size="sm" />
                    </div>
                )}

                <div className={`flex flex-col relative ${isOwnMessage ? "items-end" : "items-start"}`}>
                    {!isOwnMessage && message.sender && (
                        <span className="text-xs text-muted-foreground ml-1 mb-1 font-medium">{message.sender.name}</span>
                    )}

                    <div className={`flex items-center gap-2 group relative w-full ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>

                        <div
                            className={`px-4 py-2 shadow-sm rounded-3xl ${message.isDeleted
                                ? "bg-muted text-muted-foreground italic border border-muted"
                                : isOwnMessage
                                    ? "bg-blue-600 text-white rounded-tr-sm"
                                    : "bg-muted/80 text-foreground rounded-tl-sm"
                                }`}
                        >
                            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                                {message.isDeleted ? "This message was deleted" : message.content}
                            </p>
                        </div>

                        {showPicker && !message.isDeleted && (
                            <div className={`flex items-center gap-1 bg-background/95 border shadow-sm rounded-full p-1 opacity-100 transition-opacity whitespace-nowrap z-10 ${isOwnMessage ? "mr-2" : "ml-2"}`}>
                                <div className={`flex gap-1 px-1 ${isOwnMessage ? "border-r pr-2" : ""}`}>
                                    {EMOJIS.map(e => (
                                        <button key={e} onClick={() => handleReaction(e)} className="hover:scale-125 transition-transform px-1 text-base">{e}</button>
                                    ))}
                                </div>
                                {isOwnMessage && (
                                    <button onClick={handleDelete} className="p-1 pl-1 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={`flex flex-wrap items-center gap-2 mt-1 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[10px] text-muted-foreground/70 font-medium">
                            {formatMessageTime(message._creationTime)}
                        </span>

                        {Object.keys(groupedReactions).length > 0 && (
                            <div className={`flex gap-1 flex-wrap ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                                {Object.entries(groupedReactions).map(([emoji, userIds]) => {
                                    const hasReacted = currentUserId && userIds.includes(currentUserId);
                                    return (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${hasReacted ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20" : "border-border bg-background hover:bg-muted"
                                                }`}
                                        >
                                            <span>{emoji}</span>
                                            <span className={hasReacted ? "text-blue-600 dark:text-blue-400 font-medium" : "text-muted-foreground"}>{userIds.length}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
