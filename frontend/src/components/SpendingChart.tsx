import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Expense } from '../types';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface Props {
  expenses: Expense[];
  currentDate: Date;
}

export const SpendingChart: React.FC<Props> = ({ expenses, currentDate }) => {
  const chartData = React.useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayExpenses = expenses.filter((e) => e.date === dayStr);
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        date: format(day, 'MMM d'),
        amount: total,
      };
    });
  }, [expenses, currentDate]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Spending</h3>
      <p className="text-sm text-gray-600 mb-4">Total: ${totalSpent.toFixed(2)}</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
