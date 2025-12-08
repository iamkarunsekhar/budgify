'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Expense, RecurringCost, SpendingSummary } from '@/types';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { RecurringCostsList } from '@/components/dashboard/RecurringCostsList';
import { BudgetSettings } from '@/components/ui/BudgetSettings';
import { AddExpenseModal } from '@/components/ui/AddExpenseModal';
import { AddRecurringModal } from '@/components/ui/AddRecurringModal';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringCosts, setRecurringCosts] = useState<RecurringCost[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'recurring'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [currentDate, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [expensesData, recurringData, summaryData] = await Promise.all([
        api.getExpensesByRange(
          format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          format(endOfMonth(currentDate), 'yyyy-MM-dd')
        ),
        api.getRecurringCosts(),
        api.getSpendingSummary(year, month),
      ]);

      setExpenses(expensesData);
      setRecurringCosts(recurringData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = () => {
    if (!summary) return 'bg-gray-500';
    if (summary.is_over_budget) return 'bg-red-500';
    if (summary.percentage_used >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!summary) return 'Loading...';
    if (summary.is_over_budget) return 'Over Budget!';
    if (summary.percentage_used >= 80) return 'Warning: Near Limit';
    return 'On Track';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budgify</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.username}! (Your Independent Budget)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Budget Settings
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={handleNextMonth}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Next →
            </button>
            <button
              onClick={handleCurrentMonth}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Today
            </button>
          </div>
        </div>

        {/* Budget Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${summary.total_with_recurring.toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 ${getStatusColor()} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Budget Limit</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${summary.budget_limit.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">🎯</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className={`text-3xl font-bold ${summary.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(summary.remaining).toFixed(2)}
                  </p>
                </div>
                <div className={`w-12 h-12 ${summary.remaining < 0 ? 'bg-red-500' : 'bg-green-500'} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-2xl">{summary.remaining < 0 ? '⚠️' : '✓'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-lg font-bold text-gray-900">{getStatusText()}</p>
                  <p className="text-sm text-gray-600">{summary.percentage_used.toFixed(1)}% used</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor()}`}
                  style={{ width: `${Math.min(summary.percentage_used, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 font-semibold transition ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`pb-4 px-1 font-semibold transition ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`pb-4 px-1 font-semibold transition ${
                activeTab === 'recurring'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recurring Costs ({recurringCosts.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingChart expenses={expenses} currentDate={currentDate} />
              <CategoryChart expenses={expenses} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  + Add Expense
                </button>
              </div>
              <ExpenseList
                expenses={expenses.slice(0, 5)}
                onUpdate={loadData}
              />
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">All Expenses</h3>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Expense
              </button>
            </div>
            <ExpenseList expenses={expenses} onUpdate={loadData} />
          </div>
        )}

        {activeTab === 'recurring' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recurring Costs</h3>
              <button
                onClick={() => setIsRecurringModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Recurring Cost
              </button>
            </div>
            <RecurringCostsList costs={recurringCosts} onUpdate={loadData} />
          </div>
        )}
      </main>

      {/* Modals */}
      {isExpenseModalOpen && (
        <AddExpenseModal
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={() => {
            setIsExpenseModalOpen(false);
            loadData();
          }}
        />
      )}

      {isRecurringModalOpen && (
        <AddRecurringModal
          onClose={() => setIsRecurringModalOpen(false)}
          onSuccess={() => {
            setIsRecurringModalOpen(false);
            loadData();
          }}
        />
      )}

      {isSettingsOpen && (
        <BudgetSettings
          onClose={() => setIsSettingsOpen(false)}
          onSuccess={() => {
            setIsSettingsOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
