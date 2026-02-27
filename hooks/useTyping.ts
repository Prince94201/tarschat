import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function useTyping(conversationId: Id<"conversations">) {
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const setTypingMutation = useMutation(api.typing.setTyping);

    const handleTyping = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            setTypingMutation({ conversationId, isTyping: true }).catch(console.error);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingMutation({ conversationId, isTyping: false }).catch(console.error);
        }, 2000);
    }, [conversationId, isTyping, setTypingMutation]);

    return { handleTyping };
}
