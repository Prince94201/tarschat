"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { MessageCircle } from "lucide-react";

export default function RootPage() {
    return (
        <div className="hidden md:flex flex-1 h-full w-full bg-muted/10">
            <EmptyState
                icon={MessageCircle}
                title="Welcome to ChatApp"
                subtitle="Select a conversation or search for a user to start chatting"
            />
        </div>
    );
}
