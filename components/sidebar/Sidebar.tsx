"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { UserSearch } from "./UserSearch";
import { ConversationList } from "./ConversationList";
import { NewConversationDialog } from "./NewConversationDialog";

export function Sidebar() {
    const { user } = useUser();

    return (
        <div className="flex flex-col w-full h-full bg-background border-r">
            {/* Header */}
            <div className="p-4 border-b space-y-4 shadow-sm z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            appearance={{
                                elements: {
                                    avatarBox: "h-10 w-10",
                                }
                            }}
                        />
                        <h2 className="font-semibold text-lg text-foreground">{user?.fullName || "ChatApp"}</h2>
                    </div>
                    <NewConversationDialog />
                </div>
                <UserSearch />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-hidden flex flex-col pt-2 w-full">
                <ConversationList />
            </div>
        </div>
    );
}
