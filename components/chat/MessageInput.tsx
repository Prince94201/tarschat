"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTyping } from "../../hooks/useTyping";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
    conversationId?: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
    const [content, setContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const sendMessage = useMutation(api.messages.sendMessage);
    const setTypingMutation = useMutation(api.typing.setTyping);
    // hook handles debouncing and clearing typing indicator automatically
    const { handleTyping } = useTyping(conversationId as Id<"conversations"> || ("" as any));

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        adjustHeight();

        if (conversationId) {
            handleTyping();
        }
    };

    const handleSend = async () => {
        if (!content.trim() || !conversationId) return;

        const messageContent = content.trim();
        setContent("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            await sendMessage({ conversationId, content: messageContent });
            await setTypingMutation({ conversationId, isTyping: false });
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversationId) {
        return (
            <div className="p-4 bg-background border-t">
                <div className="flex items-center bg-muted/50 rounded-full px-4 py-2 border">
                    <textarea
                        className="w-full bg-transparent resize-none outline-none text-sm min-h-[20px] max-h-[120px] py-1 text-muted-foreground"
                        rows={1}
                        disabled
                        placeholder="Select a conversation to start messaging"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-background border-t">
            <div className="flex items-end gap-2 bg-muted/30 rounded-3xl border pr-2 pl-4 py-2 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent resize-none outline-none text-[15px] min-h-[24px] max-h-[120px] py-1.5 scrollbar-thin overflow-y-auto"
                    rows={1}
                    placeholder="Type a message..."
                />
                <button
                    onClick={handleSend}
                    disabled={!content.trim()}
                    className="mb-0.5 shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                >
                    <SendHorizontal className="h-5 w-5 ml-0.5" />
                </button>
            </div>
        </div>
    );
}
