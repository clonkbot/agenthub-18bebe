import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let agents = await ctx.db.query("agents").collect();

    if (args.status) {
      agents = agents.filter((a) => a.status === args.status);
    }
    if (args.category) {
      agents = agents.filter((a) => a.category === args.category);
    }

    return agents.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    capabilities: v.array(v.string()),
    category: v.string(),
    price: v.number(),
    priceType: v.union(v.literal("free"), v.literal("one-time"), v.literal("subscription")),
    imageUrl: v.optional(v.string()),
    apiEndpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.role !== "admin" && profile.role !== "agent")) {
      throw new Error("Only admins and agents can create agents");
    }

    const now = Date.now();
    return await ctx.db.insert("agents", {
      ...args,
      status: profile.role === "admin" ? "active" : "pending",
      createdBy: userId,
      usageCount: 0,
      rating: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    capabilities: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    priceType: v.optional(v.union(v.literal("free"), v.literal("one-time"), v.literal("subscription"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))),
    imageUrl: v.optional(v.string()),
    apiEndpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    const isOwner = agent.createdBy === userId;
    const isAdmin = profile?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "admin") {
      throw new Error("Only admins can delete agents");
    }

    await ctx.db.delete(args.id);
  },
});

export const incrementUsage = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");

    await ctx.db.patch(args.id, {
      usageCount: agent.usageCount + 1,
      updatedAt: Date.now(),
    });
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const categories = new Set(agents.map((a) => a.category));
    return Array.from(categories);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const agents = await ctx.db.query("agents").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const transactions = await ctx.db.query("transactions").collect();

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status === "active").length,
      pendingAgents: agents.filter((a) => a.status === "pending").length,
      totalSubscriptions: subscriptions.filter((s) => s.status === "active").length,
      totalRevenue: transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0),
      totalUsage: agents.reduce((sum, a) => sum + a.usageCount, 0),
    };
  },
});
