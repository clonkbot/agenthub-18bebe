import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    agentId: v.optional(v.id("agents")),
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db.query("posts").collect();

    if (args.agentId) {
      posts = posts.filter((p) => p.agentId === args.agentId);
    }
    if (args.publishedOnly) {
      posts = posts.filter((p) => p.published);
    }

    return posts.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    agentId: v.id("agents"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("update"), v.literal("announcement"), v.literal("changelog")),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.role !== "admin" && profile.role !== "agent")) {
      throw new Error("Not authorized to create posts");
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    const isOwner = agent.createdBy === userId;
    const isAdmin = profile.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized for this agent");
    }

    const now = Date.now();
    return await ctx.db.insert("posts", {
      ...args,
      authorId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(v.union(v.literal("update"), v.literal("announcement"), v.literal("changelog"))),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");

    const isAuthor = post.authorId === userId;
    const isAdmin = profile?.role === "admin";

    if (!isAuthor && !isAdmin) {
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
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");

    const isAuthor = post.authorId === userId;
    const isAdmin = profile?.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
