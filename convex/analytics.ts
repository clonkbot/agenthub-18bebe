import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const track = mutation({
  args: {
    agentId: v.id("agents"),
    action: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("analytics", {
      agentId: args.agentId,
      userId: userId || undefined,
      action: args.action,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

export const getAgentAnalytics = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;

    const isOwner = agent.createdBy === userId;
    const isAdmin = profile?.role === "admin";

    if (!isOwner && !isAdmin) return null;

    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      total: analytics.length,
      last24Hours: analytics.filter((a) => a.timestamp > dayAgo).length,
      lastWeek: analytics.filter((a) => a.timestamp > weekAgo).length,
      lastMonth: analytics.filter((a) => a.timestamp > monthAgo).length,
      byAction: analytics.reduce((acc, a) => {
        acc[a.action] = (acc[a.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "admin") return null;

    const analytics = await ctx.db.query("analytics").collect();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Group by day for the last 7 days
    const dailyData: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const day = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = day.toISOString().split("T")[0];
      dailyData[key] = 0;
    }

    analytics
      .filter((a) => a.timestamp > weekAgo)
      .forEach((a) => {
        const key = new Date(a.timestamp).toISOString().split("T")[0];
        if (dailyData[key] !== undefined) {
          dailyData[key]++;
        }
      });

    return {
      dailyData: Object.entries(dailyData)
        .map(([date, count]) => ({ date, count }))
        .reverse(),
      totalEvents: analytics.length,
      weeklyEvents: analytics.filter((a) => a.timestamp > weekAgo).length,
    };
  },
});
