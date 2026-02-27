"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar } from "../shared/Avatar";
import { useRouter } from "next/navigation";
import { Search, Loader2, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "../shared/EmptyState";

export function UserSearch() {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const users = useQuery(api.users.getUsers);
    const createConversation = useMutation(api.conversations.createOrGetConversation);

    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredUsers = users?.filter(
        (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase())
    ) || [];

    const handleSelectUser = async (participantId: string) => {
        try {
            setIsCreating(true);
            const conversationId = await createConversation({ participantId });
            setIsOpen(false);
            setQuery("");
            router.push(`/conversation/${conversationId}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-9 bg-muted/50 border-none rounded-full"
                />
            </div>

            {isOpen && query.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden p-2">
                    {users === undefined ? (
                        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                icon={UserX}
                                title="No users found"
                                subtitle={`We couldn't find anyone matching "${query}"`}
                            />
                        </div>
                    ) : (
                        <div className="py-2">
                            {filteredUsers.map((user) => (
                                <button
                                    key={user._id}
                                    disabled={isCreating}
                                    onClick={() => handleSelectUser(user.clerkId)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/70 rounded-xl transition-all text-left"
                                >
                                    <Avatar imageUrl={user.imageUrl} name={user.name} size="sm" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
