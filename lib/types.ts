export type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: Category;
  spent_on: string;
  note: string;
  created_at: string;
}
