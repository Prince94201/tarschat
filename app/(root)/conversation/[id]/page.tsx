"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

export default function ConversationPage() {
    const params = useParams();
    const id = params.id as Id<"conversations">;

    return <ChatWindow conversationId={id} />;
}
