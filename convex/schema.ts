import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participantIds: v.array(v.string()),  // stores clerkIds
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    lastMessageId: v.optional(v.id("messages")),
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),          // clerkId
    content: v.string(),
    isDeleted: v.boolean(),
    reactions: v.array(v.object({
      userId: v.string(),
      emoji: v.string(),
    })),
  }).index("by_conversation", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),            // clerkId
    lastReadTime: v.number(),
  })
  .index("by_conversation", ["conversationId"])
  .index("by_user", ["userId"])
  .index("by_conversation_user", ["conversationId", "userId"]),
});