"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { Book, BookStatus } from "@/lib/types";

type NewBook = {
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
};

type Result = { error?: string };

type BooksContextType = {
  books: Book[];
  loading: boolean;
  addBook: (book: NewBook) => Promise<Result>;
  advanceStatus: (book: Book) => Promise<Result>;
  deleteBook: (id: string) => Promise<Result>;
};

const BooksContext = createContext<BooksContextType | undefined>(undefined);

const nextStatus: Record<BookStatus, BookStatus | null> = {
  "To Read": "Reading",
  Reading: "Finished",
  Finished: null,
};

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBooks([]);
    if (!userId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setBooks((data as Book[]) ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const addBook = async (book: NewBook): Promise<Result> => {
    if (!userId) return { error: "You must be logged in" };

    const { data, error } = await supabase
      .from("books")
      .insert({ ...book, user_id: userId })
      .select()
      .single();

    if (error) return { error: error.message };
    setBooks((prev) => [data as Book, ...prev]);
    return {};
  };

  const advanceStatus = async (book: Book): Promise<Result> => {
    const status = nextStatus[book.status];
    if (!status) return {};

    const { error } = await supabase.from("books").update({ status }).eq("id", book.id);
    if (error) return { error: error.message };

    setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, status } : b)));
    return {};
  };

  const deleteBook = async (id: string): Promise<Result> => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) return { error: error.message };

    setBooks((prev) => prev.filter((b) => b.id !== id));
    return {};
  };

  return (
    <BooksContext.Provider value={{ books, loading, addBook, advanceStatus, deleteBook }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error("useBooks must be used within a BooksProvider");
  }
  return context;
}
