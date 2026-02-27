"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollToBottomButtonProps {
    onClick: () => void;
    isVisible: boolean;
    unreadCount?: number;
}

export function ScrollToBottomButton({ onClick, isVisible, unreadCount = 0 }: ScrollToBottomButtonProps) {
    if (!isVisible) return null;

    return (
        <div className="absolute bottom-20 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
            <Button
                onClick={onClick}
                size="sm"
                className="rounded-full shadow-lg gap-2 bg-primary hover:bg-primary/90 transition-all text-primary-foreground font-medium px-4"
            >
                <ArrowDown className="h-4 w-4" />
                {unreadCount > 0 ? `${unreadCount} New message${unreadCount > 1 ? 's' : ''}` : 'New messages'}
            </Button>
        </div>
    );
}
