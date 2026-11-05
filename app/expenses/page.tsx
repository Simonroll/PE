"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/contexts/ExpensesContext";
import { Category, Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Other"];

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ExpensesPage() {
  const { user, loading: authLoading } = useAuth();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const router = useRouter();

  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorAmount, setErrorAmount] = useState("");
  const [errorCategory, setErrorCategory] = useState("");
  const [errorDate, setErrorDate] = useState("");
  const [errorNote, setErrorNote] = useState("");
  const [errorExpense, setErrorExpense] = useState("");
  const [expenseSuccess, setExpenseSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("");

  // Route Guard: Protected page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Validation functions
  const validateAmount = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Amount is required";
    }
    const num = Number(trimmed);
    if (isNaN(num) || num <= 0) {
      return "Amount must be greater than 0";
    }
    return "";
  };

  const validateCategory = (val: string): string => {
    if (!val) {
      return "Please choose a category";
    }
    return "";
  };

  const validateDate = (val: string): string => {
    if (!val) {
      return "Date is required";
    }
    const today = getLocalDateString();
    if (val > today) {
      return "Date cannot be in the future";
    }
    return "";
  };

  const validateNote = (val: string): string => {
    if (val.length > 100) {
      return "Note must be at most 100 characters";
    }
    return "";
  };

  // Real-time error clearance on input changes
  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (hasSubmitted) {
      setErrorAmount(validateAmount(val));
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (hasSubmitted) {
      setErrorCategory(validateCategory(val));
    }
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    if (hasSubmitted) {
      setErrorDate(validateDate(val));
    }
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    if (hasSubmitted) {
      setErrorNote(validateNote(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorExpense("");
    setExpenseSuccess("");

    const errAmt = validateAmount(amount);
    const errCat = validateCategory(category);
    const errDt = validateDate(date);
    const errNt = validateNote(note);

    setErrorAmount(errAmt);
    setErrorCategory(errCat);
    setErrorDate(errDt);
    setErrorNote(errNt);

    if (errAmt || errCat || errDt || errNt) {
      return;
    }

    setIsSubmitting(true);
    const result = await addExpense({
      amount: Number(amount),
      category: category as Category,
      spent_on: date,
      note: note.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      setAmount("");
      setCategory("");
      setDate("");
      setNote("");
      setHasSubmitted(false);
      setErrorAmount("");
      setErrorCategory("");
      setErrorDate("");
      setErrorNote("");
      setExpenseSuccess("Expense added.");
    } else {
      setErrorExpense(result.error || "Failed to add expense");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
  };

  const handleClearFilters = () => {
    setFilterCategory("All");
    setFilterMonth("");
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item: Expense) => {
      if (filterCategory !== "All" && item.category !== filterCategory) {
        return false;
      }
      if (filterMonth && !item.spent_on.startsWith(filterMonth)) {
        return false;
      }
      return true;
    });
  }, [expenses, filterCategory, filterMonth]);

  // Summary calculations
  const totalAmountNum = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  const formattedTotalAmount = `$${totalAmountNum.toFixed(2)}`;

  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + Number(item.amount);
    });

    return Object.entries(totals)
      .map(([cat, tot]) => ({
        name: cat,
        total: tot,
        formatted: `$${tot.toFixed(2)}`,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  // While checking auth status, render nothing from this page (prevent flash of content)
  if (authLoading || !user) {
    return null;
  }

  return (
    <div
      data-testid="expenses-page"
      className="container mx-auto px-4 py-8 max-w-7xl min-h-[calc(100vh-4rem)]"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Form & Summary (At 1280px sits next to list) */}
        <div className="xl:col-span-5 space-y-6">
          {/* Add Expense Form */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                data-testid="expense-form"
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
              >
                {expenseSuccess ? (
                  <div
                    data-testid="expense-success"
                    className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium"
                  >
                    {expenseSuccess}
                  </div>
                ) : null}

                {errorExpense ? (
                  <div
                    data-testid="error-expense"
                    className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium"
                  >
                    {errorExpense}
                  </div>
                ) : null}

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    data-testid="input-amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                  {errorAmount ? (
                    <p data-testid="error-amount" className="text-sm text-red-500 font-medium">
                      {errorAmount}
                    </p>
                  ) : null}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    data-testid="select-category"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Choose category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errorCategory ? (
                    <p data-testid="error-category" className="text-sm text-red-500 font-medium">
                      {errorCategory}
                    </p>
                  ) : null}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    data-testid="input-date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                  {errorDate ? (
                    <p data-testid="error-date" className="text-sm text-red-500 font-medium">
                      {errorDate}
                    </p>
                  ) : null}
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input
                    id="note"
                    type="text"
                    data-testid="input-note"
                    placeholder="Short description"
                    value={note}
                    onChange={(e) => handleNoteChange(e.target.value)}
                  />
                  {errorNote ? (
                    <p data-testid="error-note" className="text-sm text-red-500 font-medium">
                      {errorNote}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-expense"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span
                  data-testid="total-amount"
                  className="text-lg font-bold text-gray-900"
                >
                  {formattedTotalAmount}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Expense Count:</span>
                <span
                  data-testid="expense-count"
                  className="text-lg font-bold text-gray-900"
                >
                  {filteredExpenses.length}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-sm font-semibold text-gray-700 block mb-2">
                  Category Breakdown
                </span>
                <div data-testid="category-breakdown" className="space-y-2">
                  {categoryBreakdown.map((row) => (
                    <div
                      key={row.name}
                      data-testid="breakdown-row"
                      className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                    >
                      <span data-testid="breakdown-name" className="font-medium text-gray-700">
                        {row.name}
                      </span>
                      <span
                        data-testid="breakdown-amount"
                        className="font-semibold text-gray-900"
                      >
                        {row.formatted}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters & List */}
        <div className="xl:col-span-7 space-y-6">
          {/* Filters Card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5 space-y-1">
                  <Label htmlFor="filterCategory" className="text-xs">Category</Label>
                  <select
                    id="filterCategory"
                    data-testid="filter-category"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="All">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <Label htmlFor="filterMonth" className="text-xs">Month</Label>
                  <Input
                    id="filterMonth"
                    type="month"
                    data-testid="filter-month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="btn-clear-filters"
                    onClick={handleClearFilters}
                    className="w-full h-9"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense List */}
          <div data-testid="expense-list" className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div
                data-testid="expenses-empty"
                className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500 font-medium"
              >
                No expenses found
              </div>
            ) : (
              filteredExpenses.map((item) => (
                <div
                  key={item.id}
                  data-testid="expense-item"
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        data-testid="expense-category"
                        className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {item.category}
                      </span>
                      <span
                        data-testid="expense-amount"
                        className="text-lg font-bold text-gray-900"
                      >
                        {`$${Number(item.amount).toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span data-testid="expense-date">{item.spent_on}</span>
                      {item.note ? <span>•</span> : null}
                      <span data-testid="expense-note" className="text-gray-700">
                        {item.note || ""}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="destructive"
                      size="sm"
                      data-testid="btn-delete-expense"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
