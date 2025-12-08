import { User, Expense, RecurringCost, BudgetSetting, SpendingSummary, AuthResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Auth
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    return response.json();
  }

  async getExpensesByRange(startDate: string, endDate: string): Promise<Expense[]> {
    const response = await fetch(`${API_URL}/expenses/range?start_date=${startDate}&end_date=${endDate}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    return response.json();
  }

  async createExpense(expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create expense');
    }

    return response.json();
  }

  async updateExpense(id: number, expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update expense');
    }

    return response.json();
  }

  async deleteExpense(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete expense');
    }
  }

  // Recurring Costs
  async getRecurringCosts(): Promise<RecurringCost[]> {
    const response = await fetch(`${API_URL}/recurring`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring costs');
    }

    return response.json();
  }

  async createRecurringCost(cost: Omit<RecurringCost, 'id' | 'user_id' | 'created_at'>): Promise<RecurringCost> {
    const response = await fetch(`${API_URL}/recurring`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(cost),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create recurring cost');
    }

    return response.json();
  }

  async updateRecurringCost(id: number, cost: Omit<RecurringCost, 'id' | 'user_id' | 'created_at'>): Promise<RecurringCost> {
    const response = await fetch(`${API_URL}/recurring/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(cost),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update recurring cost');
    }

    return response.json();
  }

  async deleteRecurringCost(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/recurring/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete recurring cost');
    }
  }

  // Budget
  async getBudgetSettings(): Promise<BudgetSetting> {
    const response = await fetch(`${API_URL}/budget`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch budget settings');
    }

    return response.json();
  }

  async updateBudgetSettings(monthlyLimit: number): Promise<BudgetSetting> {
    const response = await fetch(`${API_URL}/budget`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ monthly_limit: monthlyLimit }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update budget settings');
    }

    return response.json();
  }

  async getSpendingSummary(year: number, month: number): Promise<SpendingSummary> {
    const response = await fetch(`${API_URL}/budget/summary/${year}/${month}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch spending summary');
    }

    return response.json();
  }
}

export const api = new ApiService();
