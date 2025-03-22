"use client";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { fetchBookContent } from "@/lib/bookData";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Authenticated, Unauthenticated } from "convex/react"

export default function Home() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const documents = useQuery(api.documents.getDocuments);
  const createDocument = useMutation(api.documents.createDocument);
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<{
    content: string;
    metadata: string;
    title: string;
    author?: string;
    language?: string;
    releaseDate?: string;
  } | null>(null);

  const saveBook = useMutation(api.books.saveBook);
  const books = useQuery(api.books.getBooksByUser); 
  const savedBook = useQuery(api.books.getBookById, {bookId}); 
  console.log('ttt savedBook:',savedBook)

  const handleFetchBook = async () => {
    setLoading(true);
    if(savedBook && savedBook.bookId === bookId) {
      setBookData({ ...savedBook });
    } else {
      const { content, metadata, ...args } = await fetchBookContent(bookId);
      console.log('ttt content', content);
      console.log('ttt metadata', metadata);
      setBookData({ content, metadata, ...args });

      // Save the book to Convex
      const res = await saveBook({
        bookId,
        content,
        metadata,
        ...args,
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen p-20">
      <main className="flex-1 p-6 overflow-y-auto">
        
        {isAuthenticated ? 
          <>
            <h1>Project Gutenberg Book with AI</h1>

            <div className="flex items-center py-4 gap-8">
            <Input
              type="text"
              placeholder="Enter Book ID"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              disabled={loading}
            />
            <Button disabled={loading} onClick={handleFetchBook}>Fetch Book</Button>
            </div>
            <h2>Saved Books</h2>
            <div>
              {books?.map((book) => (
                <Card key={book.bookId} className="w-[350px]">
                  <CardHeader>
                    <CardTitle>
                      <strong>{book.title}</strong> - {book.bookId}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <Button>View</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
          : "Please Sign in or Sign up!"
        }
      </main>
      {bookData && (<div className="w-1/3 bg-gray-50 p-6 border-l overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Book Metadata</h2>
        
          <pre className="whitespace-pre-wrap bg-white p-4 rounded">
            {bookData.content}
          </pre>
          <pre className="whitespace-pre-wrap bg-white p-4 rounded">
            {bookData.metadata}
          </pre>
        
      </div>)}
    </div>
  );
}
