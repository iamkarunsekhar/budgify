export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Expense {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface RecurringCost {
  id: number;
  user_id: number;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  category: string;
  start_date: string;
  created_at: string;
}

export interface BudgetSetting {
  id: number;
  user_id: number;
  monthly_limit: number;
  updated_at: string;
}

export interface SpendingSummary {
  total_spent: number;
  recurring_costs: number;
  total_with_recurring: number;
  budget_limit: number;
  remaining: number;
  percentage_used: number;
  transaction_count: number;
  is_over_budget: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
