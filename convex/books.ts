import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";

export const saveBook = mutation({
  args: {
    bookId: v.string(),
    content: v.string(),
    fileId: v.id("_storage"),
    title: v.string(),
    author: v.optional(v.string()),
    language: v.optional(v.string()),
    releaseDate: v.optional(v.string()),
    originalPublication: v.optional(v.string()),
    credits: v.optional(v.string()),
    category: v.optional(v.string()),
    eBookNo: v.optional(v.string()),
    copyrightStatus: v.optional(v.string()),
    downloads: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }

    await ctx.db.insert("books", { ...args, tokenIdentifier: userId });
  },
});

export const getBooksByUser = query({
  args: {
  },
  handler: async (ctx, args) => {

    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier

    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("books")
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier',
        userId
      )).collect()
  },
});

export const getBookById = query({
  args: {
    bookId: v.string(),
  },
  handler: async (ctx, args) => {
    if(!args.bookId) {
      return;
    }

    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier
    if (!userId) {
      throw new Error("Unauthenticated call to getBookById");
    }

    const book = await ctx.db
      .query("books")
        .withIndex("by_tokenIdentifier_and_bookId", (q) => 
          q.eq("tokenIdentifier", userId).eq("bookId", args.bookId)
        )
        .first();
    if(!book) {
      return null;
    }
    const fileUrl = await ctx.storage.getUrl(book.fileId);

    return {book, fileUrl};
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
