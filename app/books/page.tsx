"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from "@/contexts/BooksContext";
import { Book, BookStatus, STATUSES } from "@/lib/types";

type Errors = {
  title?: string;
  author?: string;
  pages?: string;
  status?: string;
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const advanceLabel: Record<BookStatus, string> = {
  "To Read": "Start reading",
  Reading: "Mark finished",
  Finished: "",
};

function validate(title: string, author: string, pages: string, status: string): Errors {
  const errors: Errors = {};

  if (!title.trim()) errors.title = "Title is required";
  else if (title.trim().length > 80) errors.title = "Title must be at most 80 characters";

  if (!author.trim()) errors.author = "Author is required";
  else if (author.trim().length > 60) errors.author = "Author must be at most 60 characters";

  const p = pages.trim();
  if (!p) errors.pages = "Pages is required";
  else if (!/^\d+$/.test(p) || Number(p) < 1 || Number(p) > 5000)
    errors.pages = "Pages must be a whole number between 1 and 5000";

  if (!status) errors.status = "Please choose a status";

  return errors;
}

export default function BooksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { books, loading, addBook, advanceStatus, deleteBook } = useBooks();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [bookError, setBookError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (submitted) setErrors(validate(title, author, pages, status));
  }, [submitted, title, author, pages, status]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      if (filterStatus && b.status !== filterStatus) return false;
      if (!q) return true;
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    });
  }, [books, filterStatus, search]);

  const totalPages = shown.reduce((sum, b) => sum + b.pages, 0);

  const breakdown = STATUSES.map((s) => ({
    name: s,
    count: shown.filter((b) => b.status === s).length,
  }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || STATUSES.indexOf(a.name) - STATUSES.indexOf(b.name));

  if (authLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBookError("");
    setSuccess("");

    const errs = validate(title, author, pages, status);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const { error } = await addBook({
      title: title.trim(),
      author: author.trim(),
      pages: Number(pages.trim()),
      status: status as BookStatus,
    });
    setSaving(false);

    if (error) {
      setBookError(error);
      return;
    }

    setTitle("");
    setAuthor("");
    setPages("");
    setStatus("");
    setSubmitted(false);
    setErrors({});
    setSuccess("Book added");
  };

  const handleAdvance = async (book: Book) => {
    setBookError("");
    const { error } = await advanceStatus(book);
    if (error) setBookError(error);
  };

  const handleDelete = async (id: string) => {
    setBookError("");
    const { error } = await deleteBook(id);
    if (error) setBookError(error);
  };

  return (
    <div data-testid="books-page" className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Books</h1>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add a book</CardTitle>
            </CardHeader>
            <CardContent>
              <form data-testid="book-form" onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && (
                    <p data-testid="error-title" className="text-sm text-red-500">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    data-testid="input-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                  {errors.author && (
                    <p data-testid="error-author" className="text-sm text-red-500">
                      {errors.author}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pages">Number of pages</Label>
                  <Input
                    id="pages"
                    inputMode="numeric"
                    data-testid="input-pages"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                  />
                  {errors.pages && (
                    <p data-testid="error-pages" className="text-sm text-red-500">
                      {errors.pages}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    data-testid="select-status"
                    className={selectClass}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Choose status</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p data-testid="error-status" className="text-sm text-red-500">
                      {errors.status}
                    </p>
                  )}
                </div>

                {bookError && (
                  <p data-testid="error-book" className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                    {bookError}
                  </p>
                )}
                {success && (
                  <p data-testid="book-success" className="rounded-md bg-green-50 p-2 text-sm text-green-700">
                    {success}
                  </p>
                )}

                <Button type="submit" data-testid="btn-add-book" className="w-full" disabled={saving}>
                  {saving ? "Adding..." : "Add book"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Books</span>
                <span data-testid="book-count" className="font-semibold">
                  {shown.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total pages</span>
                <span data-testid="total-pages" className="font-semibold">
                  {totalPages}
                </span>
              </div>
              <div data-testid="status-breakdown" className="space-y-1 border-t pt-3">
                {breakdown.map((row) => (
                  <div key={row.name} data-testid="breakdown-row" className="flex justify-between">
                    <span data-testid="breakdown-name">{row.name}</span>
                    <span data-testid="breakdown-count">{row.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="filter-status">Status</Label>
                <select
                  id="filter-status"
                  data-testid="filter-status"
                  className={selectClass}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  data-testid="search-input"
                  placeholder="Title or author"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                data-testid="btn-clear-filters"
                onClick={() => {
                  setFilterStatus("");
                  setSearch("");
                }}
              >
                Clear
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <p className="text-sm text-gray-500">Loading books...</p>
          ) : shown.length === 0 ? (
            <p data-testid="books-empty" className="rounded-md border bg-white p-6 text-center text-gray-500">
              No books found
            </p>
          ) : (
            <ul data-testid="book-list" className="space-y-3">
              {shown.map((book) => (
                <li
                  key={book.id}
                  data-testid="book-item"
                  className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p data-testid="book-title" className="break-words font-semibold">
                      {book.title}
                    </p>
                    <p data-testid="book-author" className="break-words text-sm text-gray-600">
                      {book.author}
                    </p>
                    <div className="mt-1 flex gap-3 text-sm">
                      <span data-testid="book-pages">{book.pages} pages</span>
                      <span data-testid="book-status" className="rounded bg-gray-100 px-2">
                        {book.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {book.status !== "Finished" && (
                      <Button size="sm" data-testid="btn-advance-status" onClick={() => handleAdvance(book)}>
                        {advanceLabel[book.status]}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      data-testid="btn-delete-book"
                      onClick={() => handleDelete(book.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
