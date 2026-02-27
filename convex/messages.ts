import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const senderId = identity.subject;

        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", senderId)
            )
            .first();

        if (!membership) {
            throw new Error("Not a member of this conversation");
        }

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId,
            content: args.content,
            isDeleted: false,
            reactions: [],
        });

        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
        });

        return messageId;
    },
});

export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUserId = identity.subject;
        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", currentUserId)
            )
            .first();

        if (!membership) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .order("asc")
            .collect();

        const messagesWithSender = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", msg.senderId))
                    .first();
                return {
                    ...msg,
                    sender,
                };
            })
        );

        return messagesWithSender;
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        if (message.senderId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.messageId, {
            isDeleted: true,
        });
    },
});

export const addReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const existingReactionIndex = message.reactions.findIndex(
            (r) => r.userId === userId && r.emoji === args.emoji
        );

        let newReactions = [...message.reactions];
        if (existingReactionIndex !== -1) {
            newReactions.splice(existingReactionIndex, 1);
        } else {
            newReactions.push({ userId, emoji: args.emoji });
        }

        await ctx.db.patch(args.messageId, { reactions: newReactions });
    },
});

export const markConversationRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", userId)
            )
            .first();

        if (membership) {
            await ctx.db.patch(membership._id, {
                lastReadTime: Date.now(),
            });
        }
    },
});

export const getUnreadCount = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const userId = identity.subject;

        const membership = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", userId)
            )
            .first();

        if (!membership) return 0;

        const lastReadTime = membership.lastReadTime;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        let unreadCount = 0;
        for (const msg of messages) {
            if (msg._creationTime > lastReadTime && msg.senderId !== userId) {
                unreadCount++;
            }
        }

        return unreadCount;
    },
});
