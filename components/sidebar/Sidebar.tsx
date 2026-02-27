"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { UserSearch } from "./UserSearch";
import { ConversationList } from "./ConversationList";
import { NewConversationDialog } from "./NewConversationDialog";
import { Avatar } from "../shared/Avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Sidebar() {
    const { user } = useUser();
    const { signOut } = useClerk();

    return (
        <div className="flex flex-col w-full h-full bg-background border-r">
            {/* Header */}
            <div className="p-4 border-b space-y-4 shadow-sm z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar imageUrl={user?.imageUrl} name={user?.fullName || "User"} size="md" />
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

            {/* Footer / Sign out */}
            <div className="p-4 border-t bg-muted/10">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-red-500 rounded-xl transition-colors"
                    onClick={() => signOut({ redirectUrl: '/sign-in' })}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                </Button>
            </div>
        </div>
    );
}
