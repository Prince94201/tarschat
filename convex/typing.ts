import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        const existingIndicator = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();

        if (args.isTyping) {
            if (existingIndicator) {
                await ctx.db.patch(existingIndicator._id, { updatedAt: Date.now() });
            } else {
                await ctx.db.insert("typingIndicators", {
                    conversationId: args.conversationId,
                    userId,
                    updatedAt: Date.now(),
                });
            }
        } else {
            if (existingIndicator) {
                await ctx.db.delete(existingIndicator._id);
            }
        }
    },
});

export const getTypingUsers = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUserId = identity.subject;

        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        const now = Date.now();
        const typingUsers = [];

        for (const indicator of indicators) {
            if (
                indicator.userId !== currentUserId &&
                now - indicator.updatedAt < 3000
            ) {
                const user = await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", indicator.userId))
                    .first();

                if (user) {
                    typingUsers.push({
                        ...indicator,
                        name: user.name,
                    });
                }
            }
        }

        return typingUsers;
    },
});
