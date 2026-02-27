"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "../shared/Avatar";
import { Users, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NewConversationDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const users = useQuery(api.users.getUsers);
    const createGroup = useMutation(api.conversations.createGroupConversation);
    const router = useRouter();

    const toggleUser = (clerkId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(clerkId)
                ? prev.filter((id) => id !== clerkId)
                : [...prev, clerkId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        try {
            setIsCreating(true);
            const conversationId = await createGroup({
                groupName: groupName.trim(),
                participantIds: selectedUsers,
            });
            setIsOpen(false);
            setGroupName("");
            setSelectedUsers([]);
            router.push(`/conversation/${conversationId}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-none bg-muted/50 hover:bg-muted rounded-full transition-all">
                    <Users className="h-5 w-5 text-primary" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input
                        placeholder="GroupName..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="rounded-xl"
                    />
                    <div className="text-sm font-medium text-muted-foreground">Select Members</div>
                    <ScrollArea className="h-48 border rounded-xl bg-muted/20">
                        {users === undefined ? (
                            <div className="p-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                        ) : users.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">No users available</div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {users.map((user) => {
                                    const isSelected = selectedUsers.includes(user.clerkId);
                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleUser(user.clerkId)}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-primary/20" : "hover:bg-muted"
                                                }`}
                                        >
                                            <Avatar imageUrl={user.imageUrl} name={user.name} size="sm" />
                                            <div className="flex-1 truncate text-sm font-medium text-foreground">{user.name}</div>
                                            {isSelected && <div className="h-4 w-4 bg-primary rounded-full flex items-center justify-center shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(id => {
                                const user = users?.find(u => u.clerkId === id);
                                if (!user) return null;
                                return (
                                    <div key={id} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 flex-1 rounded-full max-w-fit">
                                        {user.name}
                                        <X className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" onClick={() => toggleUser(id)} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
                        className="rounded-xl bg-primary"
                    >
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
