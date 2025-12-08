import React, { useState } from 'react';
import { RecurringCost } from '../types';
import { api } from '../services/api';
import { format } from 'date-fns';
import { CATEGORY_COLORS } from '../utils/categories';

interface Props {
  costs: RecurringCost[];
  onUpdate: () => void;
}

export const RecurringCostsList: React.FC<Props> = ({ costs, onUpdate }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recurring cost?')) return;

    setDeletingId(id);
    try {
      await api.deleteRecurringCost(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete recurring cost:', error);
      alert('Failed to delete recurring cost');
    } finally {
      setDeletingId(null);
    }
  };

  if (costs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No recurring costs yet. Add your first recurring cost to track subscriptions and regular expenses!
      </div>
    );
  }

  const monthlyTotal = costs
    .filter((c) => c.frequency === 'monthly')
    .reduce((sum, c) => sum + c.amount, 0);

  const annualTotal = costs
    .filter((c) => c.frequency === 'annual')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalMonthlyImpact = monthlyTotal + annualTotal / 12;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-semibold">Monthly Costs</p>
          <p className="text-2xl font-bold text-blue-900">${monthlyTotal.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-semibold">Annual Costs</p>
          <p className="text-2xl font-bold text-purple-900">${annualTotal.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-semibold">Monthly Impact</p>
          <p className="text-2xl font-bold text-green-900">${totalMonthlyImpact.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {costs.map((cost) => (
          <div
            key={cost.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cost.category] || '#64748b' }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{cost.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    cost.frequency === 'monthly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {cost.frequency}
                  </span>
                  <span className="text-sm text-gray-500">{cost.category}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Started: {format(new Date(cost.start_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  ${cost.amount.toFixed(2)}
                </span>
                {cost.frequency === 'annual' && (
                  <p className="text-xs text-gray-500">
                    ${(cost.amount / 12).toFixed(2)}/mo
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(cost.id)}
                disabled={deletingId === cost.id}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition disabled:opacity-50"
              >
                {deletingId === cost.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
