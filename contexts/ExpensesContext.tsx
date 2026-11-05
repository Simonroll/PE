"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { Expense, Category } from "@/lib/types";

interface AddExpenseInput {
  amount: number;
  category: Category;
  spent_on: string;
  note: string;
}

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  addExpense: (data: AddExpenseInput) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshExpenses: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

function sortExpenses(items: Expense[]): Expense[] {
  return [...items].sort((a, b) => {
    // 1. Sort by spent_on DESC
    if (a.spent_on !== b.spent_on) {
      return b.spent_on.localeCompare(a.spent_on);
    }
    // 2. If equal dates, sort by created_at DESC (last added first)
    const timeA = new Date(a.created_at).getTime() || 0;
    const timeB = new Date(b.created_at).getTime() || 0;
    return timeB - timeA;
  });
}

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("spent_on", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchErr) {
        setError(fetchErr.message);
      } else if (data) {
        setExpenses(sortExpenses(data as Expense[]));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch expenses");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    } else {
      // Clear previous user data from memory and screen after logout
      setExpenses([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchExpenses]);

  const addExpense = async (input: AddExpenseInput) => {
    if (!user) {
      return { success: false, error: "User not logged in" };
    }

    try {
      const rowToInsert = {
        user_id: user.id,
        amount: input.amount,
        category: input.category,
        spent_on: input.spent_on,
        note: input.note || "",
      };

      const { data, error: insertError } = await supabase
        .from("expenses")
        .insert([rowToInsert])
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      if (data) {
        setExpenses((prev) => sortExpenses([data as Expense, ...prev]));
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error adding expense",
      };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error: delError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (delError) {
        return { success: false, error: delError.message };
      }

      setExpenses((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error deleting expense",
      };
    }
  };

  const refreshExpenses = async () => {
    if (user?.id) {
      await fetchExpenses(user.id);
    }
  };

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        loading,
        error,
        addExpense,
        deleteExpense,
        refreshExpenses,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpensesProvider");
  }
  return context;
}
