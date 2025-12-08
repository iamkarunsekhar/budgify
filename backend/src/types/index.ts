export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
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

export interface AuthRequest extends Request {
  userId?: number;
}
