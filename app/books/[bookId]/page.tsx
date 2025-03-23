"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { use } from "react";

export default function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const unwrappedParams = use(params);
  const bookId = unwrappedParams.bookId;

  const bookData = useQuery(api.books.getBookById, {
    bookId,
  });

  const document = useQuery(api.documents.getDocumentByBookId, {
    bookId,
  });

  if (!bookData || !document) {
    return null;
  }
  const { book, fileUrl } = bookData;
  return (
    <main className="p-24 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{book.title}</h1>
      </div>

      <div className="flex gap-12">
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="document">Text Analyze</TabsTrigger>
            <TabsTrigger value="book">Book</TabsTrigger>
          </TabsList>

          <TabsContent value="document">
            <ReactMarkdown>{document.content}</ReactMarkdown>
          </TabsContent>
          <TabsContent value="book">
            <div className="bg-gray-100 p-4 rounded-xl flex-1 h-[500px]">
              {fileUrl && <iframe className="w-full h-full" src={fileUrl} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
