import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGetConversation = mutation({
    args: { participantId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUserId = identity.subject;

        const existingConversations = await ctx.db
            .query("conversationMembers")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .collect();

        for (const membership of existingConversations) {
            const conv = await ctx.db.get(membership.conversationId);
            if (conv && !conv.isGroup && conv.participantIds.includes(args.participantId)) {
                return conv._id;
            }
        }

        const conversationId = await ctx.db.insert("conversations", {
            participantIds: [currentUserId, args.participantId],
            isGroup: false,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: currentUserId,
            lastReadTime: Date.now(),
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.participantId,
            lastReadTime: Date.now(),
        });

        return conversationId;
    },
});

export const getConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUserId = identity.subject;

        const memberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .collect();

        const conversationsWithDetails = await Promise.all(
            memberships.map(async (membership) => {
                const conversation = await ctx.db.get(membership.conversationId);
                if (!conversation) return null;

                const participants = await Promise.all(
                    conversation.participantIds.map(async (id) => {
                        return await ctx.db
                            .query("users")
                            .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
                            .first();
                    })
                );

                const otherParticipants = participants.filter(
                    (p) => p && p.clerkId !== currentUserId
                );
                const otherParticipant = !conversation.isGroup && otherParticipants.length > 0 ? otherParticipants[0] : null;

                let lastMessage = null;
                if (conversation.lastMessageId) {
                    lastMessage = await ctx.db.get(conversation.lastMessageId);
                }

                return {
                    ...conversation,
                    otherParticipant,
                    participants: participants.filter((p) => p !== null),
                    lastMessage,
                };
            })
        );

        const validConversations = conversationsWithDetails.filter((c) => c !== null);

        return validConversations.sort((a, b) => {
            const timeA = a.lastMessage?._creationTime ?? a._creationTime;
            const timeB = b.lastMessage?._creationTime ?? b._creationTime;
            return timeB - timeA;
        });
    },
});

export const getConversationById = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        if (!conversation.participantIds.includes(identity.subject)) {
            throw new Error("Unauthorized");
        }

        const participants = await Promise.all(
            conversation.participantIds.map(async (id) => {
                return await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
                    .first();
            })
        );

        return {
            ...conversation,
            participants: participants.filter(p => p !== null),
        };
    },
});

export const createGroupConversation = mutation({
    args: { participantIds: v.array(v.string()), groupName: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUserId = identity.subject;
        const allParticipantIds = [...new Set([...args.participantIds, currentUserId])];

        const conversationId = await ctx.db.insert("conversations", {
            participantIds: allParticipantIds,
            isGroup: true,
            groupName: args.groupName,
        });

        await Promise.all(
            allParticipantIds.map((userId) =>
                ctx.db.insert("conversationMembers", {
                    conversationId,
                    userId,
                    lastReadTime: Date.now(),
                })
            )
        );

        return conversationId;
    },
});

export const deleteConversation = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUserId = identity.subject;

        // Verify the user is part of the conversation
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", currentUserId)
            )
            .first();

        if (!membership) {
            throw new Error("Unauthorized to delete this conversation");
        }

        // 1. Delete all messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        // 2. Delete all typing indicators
        const typingIndicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
        for (const indicator of typingIndicators) {
            await ctx.db.delete(indicator._id);
        }

        // 3. Delete all conversation members
        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();
        for (const member of members) {
            await ctx.db.delete(member._id);
        }

        // 4. Delete the conversation itself
        await ctx.db.delete(args.conversationId);
    },
});
