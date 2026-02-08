import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with roles
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("agent"), v.literal("user")),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // AI Agents
  agents: defineTable({
    name: v.string(),
    description: v.string(),
    capabilities: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    category: v.string(),
    price: v.number(),
    priceType: v.union(v.literal("free"), v.literal("one-time"), v.literal("subscription")),
    createdBy: v.id("users"),
    imageUrl: v.optional(v.string()),
    apiEndpoint: v.optional(v.string()),
    usageCount: v.number(),
    rating: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_creator", ["createdBy"]),

  // Agent Posts/Announcements
  posts: defineTable({
    agentId: v.id("agents"),
    authorId: v.id("users"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("update"), v.literal("announcement"), v.literal("changelog")),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),

  // Subscriptions/Purchases
  subscriptions: defineTable({
    userId: v.id("users"),
    agentId: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("expired")),
    paymentId: v.optional(v.string()),
    amount: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_agent", ["agentId"])
    .index("by_status", ["status"]),

  // Usage Analytics
  analytics: defineTable({
    agentId: v.id("agents"),
    userId: v.optional(v.id("users")),
    action: v.string(),
    metadata: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_timestamp", ["timestamp"]),

  // Payment Transactions
  transactions: defineTable({
    userId: v.id("users"),
    agentId: v.optional(v.id("agents")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")),
    paymentMethod: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    description: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Site Settings
  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
