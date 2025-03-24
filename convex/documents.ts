import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import Groq from "groq-sdk";
import { internal } from "./_generated/api";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groqModel = "llama-3.3-70b-versatile";

export async function getChatCompletion(bookContent: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Here is the Book content: ${bookContent}`,
      },
      {
        role: "user",
        content: `analyze above book content and tell me following answer:
            - Identify key characters
            - Language Detection
            - Sentiment Analysis
            - Plot Summary
            - Something else?`,
      },
    ],
    model: groqModel,
  });
}

export const getDocuments = query({
  async handler(ctx) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;

    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", userId))
      .collect();
  },
});

export const getDocumentByBookId = query({
  args: {
    bookId: v.string(),
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;

    if (!userId) {
      return null;
    }

    const document = await ctx.db
      .query("documents")
      .withIndex("by_tokenIdentifier_and_bookId", (q) =>
        q.eq("tokenIdentifier", userId).eq("bookId", args.bookId)
      )
      .first();
    return document;
  },
});

export const createDocument = mutation({
  args: {
    bookId: v.string(),
    fileId: v.id("_storage"),
    bookContent: v.string(),
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;

    if (!userId) {
      throw new ConvexError("Not authenticated");
    }
    const { bookId, bookContent } = args;

    const documentId = await ctx.db.insert("documents", {
      tokenIdentifier: userId,
      bookId,
      content: "",
    });

    await ctx.scheduler.runAfter(0, internal.documents.generateTextAnalyze, {
      bookContent,
      documentId,
    });
  },
});

export const generateTextAnalyze = internalAction({
  args: {
    bookContent: v.string(),
    documentId: v.id("documents"),
  },
  async handler(ctx, args) {
    const chatCompletion = await getChatCompletion(args.bookContent);
    const data = chatCompletion.choices[0]?.message?.content || "";
    console.log("chatCompletion", data);

    await ctx.runMutation(internal.documents.updateDocument, {
      documentId: args.documentId,
      content: data,
    });
  },
});

export const updateDocument = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.documentId, {
      content: args.content,
    });
  },
});
