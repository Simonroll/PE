-- ===================================================
-- SPENDWISE DATABASE SCHEMA & POLICIES
-- ===================================================

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Food', 'Transport', 'Shopping', 'Bills', 'Other')),
    spent_on DATE NOT NULL,
    note VARCHAR(100) DEFAULT '' CHECK (char_length(note) <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- 4. Create Security Policies
-- Authenticated users can only read their own expenses
CREATE POLICY "Users can view own expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can only insert rows with their own user_id
CREATE POLICY "Users can insert own expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can only delete their own expenses
CREATE POLICY "Users can delete own expenses"
ON public.expenses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
