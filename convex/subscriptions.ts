import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Enrich with agent data
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const agent = await ctx.db.get(sub.agentId);
        return { ...sub, agent };
      })
    );

    return enriched;
  },
});

export const checkSubscription = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return subscription.find(
      (s) => s.agentId === args.agentId && s.status === "active"
    ) || null;
  },
});

export const create = mutation({
  args: {
    agentId: v.id("agents"),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    // Check for existing active subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const hasActive = existing.find(
      (s) => s.agentId === args.agentId && s.status === "active"
    );

    if (hasActive) throw new Error("Already subscribed");

    const now = Date.now();
    const endDate = agent.priceType === "subscription"
      ? now + 30 * 24 * 60 * 60 * 1000 // 30 days
      : undefined;

    return await ctx.db.insert("subscriptions", {
      userId,
      agentId: args.agentId,
      status: "active",
      paymentId: args.paymentId,
      amount: agent.price,
      startDate: now,
      endDate,
      createdAt: now,
    });
  },
});

export const cancel = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subscription = await ctx.db.get(args.id);
    if (!subscription) throw new Error("Subscription not found");

    if (subscription.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "admin") return [];

    const subscriptions = await ctx.db.query("subscriptions").collect();

    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const agent = await ctx.db.get(sub.agentId);
        const userProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", sub.userId))
          .first();
        return { ...sub, agent, userProfile };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});
