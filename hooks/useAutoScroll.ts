import { useState, useEffect, RefObject, useCallback, useRef } from "react";

export function useAutoScroll(
    containerRef: RefObject<HTMLDivElement | null>,
    messages: unknown[],
    currentUserId?: string
) {
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const previousMessagesLengthRef = useRef(messages.length);
    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
            setIsAtBottom(true);
            setUnreadCount(0);
        }
    }, [containerRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10;
            setIsAtBottom(isBottom);

            // If user scrolls to bottom manually, reset unread count
            if (isBottom) {
                setUnreadCount(0);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [containerRef]);

    useEffect(() => {
        const newMessagesCount = messages.length - previousMessagesLengthRef.current;

        if (newMessagesCount > 0) {
            // Check if the newest message is from the current user
            // We safely typecast to extract senderId
            const isOwnMessage = (messages[messages.length - 1] as { senderId?: string })?.senderId === currentUserId;

            if (isAtBottom || isOwnMessage) {
                // Instantly scroll down if we were already at bottom or WE sent the message
                // Using a timeout prevents the synchronous setState during render warning
                setTimeout(scrollToBottom, 0);
            } else {
                // User is scrolled up and someone else sent a message, just count it
                setUnreadCount(prev => prev + newMessagesCount);
            }
        } else if (isAtBottom && containerRef.current) {
            // Handle initial load or generic updates
            setTimeout(scrollToBottom, 0);
        }

        previousMessagesLengthRef.current = messages.length;
    }, [messages, isAtBottom, containerRef, currentUserId, scrollToBottom]);

    return { isAtBottom, scrollToBottom, unreadCount };
}
