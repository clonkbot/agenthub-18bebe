import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return transactions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    amount: v.number(),
    currency: v.string(),
    paymentMethod: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("transactions", {
      userId,
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("refunded")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Only admins can update transaction status (in production, this would be done by webhook)
    if (!profile || profile.role !== "admin") {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { status: args.status });
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

    const transactions = await ctx.db.query("transactions").collect();

    const enriched = await Promise.all(
      transactions.map(async (t) => {
        const userProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", t.userId))
          .first();
        const agent = t.agentId ? await ctx.db.get(t.agentId) : null;
        return { ...t, userProfile, agent };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});
