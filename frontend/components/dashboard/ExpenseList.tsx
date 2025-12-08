'use client';

import React, { useState } from 'react';
import { Expense } from '@/types';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { CATEGORY_COLORS } from '@/utils/categories';

interface Props {
  expenses: Expense[];
  onUpdate: () => void;
}

export const ExpenseList: React.FC<Props> = ({ expenses, onUpdate }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    setDeletingId(id);
    try {
      await api.deleteExpense(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No expenses yet. Add your first expense to get started!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[expense.category] || '#64748b' }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{expense.category}</span>
                <span className="text-sm text-gray-500">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </span>
              </div>
              {expense.description && (
                <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-900">
              ${expense.amount.toFixed(2)}
            </span>
            <button
              onClick={() => handleDelete(expense.id)}
              disabled={deletingId === expense.id}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
            >
              {deletingId === expense.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
