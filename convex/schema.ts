import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    tokenIdentifier: v.string(),
    bookId: v.string(),
    content: v.string(),
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
    fileId: v.id("_storage"),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_bookId", ["bookId"])
    .index("by_tokenIdentifier_and_bookId", ["tokenIdentifier", "bookId"]),

  documents: defineTable({
    bookId: v.string(),
    content: v.string(),
    tokenIdentifier: v.string(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_bookId", ["bookId"])
    .index("by_tokenIdentifier_and_bookId", ["tokenIdentifier", "bookId"]),
});
