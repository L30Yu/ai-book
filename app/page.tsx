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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner"

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const [bookId, setBookId] = useState("");

  const createDocument = useMutation(api.documents.createDocument);

  const generateUploadUrl = useMutation(api.books.generateUploadUrl);

  const [loading, setLoading] = useState(false);

  const saveBook = useMutation(api.books.saveBook);
  const books = useQuery(api.books.getBooksByUser); 
  const savedBook = useQuery(api.books.getBookById, {bookId});

  const handleFetchBook = async () => {
    setLoading(true);
    try{
      if(!savedBook){
        const fetchedBookData = await fetchBookContent(bookId);
        if (!fetchedBookData) {

         toast('Can not find book with id:'+bookId);
         return;
        }
        const { content, ...args } = fetchedBookData;

        const url = await generateUploadUrl();
        const blob = new Blob([content], { type: "text/plain" });

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: blob,
        });
        const { storageId } = await result.json();
          
        // Save the book to Convex
        await saveBook({
          bookId,
          fileId: storageId as Id<"_storage">,
          content: content.substring(0, 5000 * 4),
          ...args,
        });
        // Analyze the book text content
        await createDocument({bookId, fileId: storageId, 
          bookContent: content.substring(0, 5000 * 4),})
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center py-4 gap-8">
              {books?.map((book) => (
                <Card key={book.bookId} className="w-[350px]">
                  <CardHeader>
                    <CardTitle>
                      <strong>{book.title}</strong> - {book.bookId}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="space-y-1 m-2">
                        <p className="text-sm font-medium leading-none">
                          Author
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                      <div className="space-y-1 m-2">
                        <p className="text-sm font-medium leading-none">
                        Language
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {book.language}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button>
                    <Link href={`/books/${book.bookId}`}>
                      View Book Content and Text Analyze
                    </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
          : "Please Sign in or Sign up!"
        }
      </main>
    </div>
  );
}
