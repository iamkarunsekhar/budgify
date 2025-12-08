import express, { Response } from 'express';
import db from '../db/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { BudgetSetting } from '../types';

const router = express.Router();

// Get budget settings
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const budgetSetting = db.prepare(
      'SELECT * FROM budget_settings WHERE user_id = ?'
    ).get(req.userId) as BudgetSetting | undefined;

    if (!budgetSetting) {
      return res.status(404).json({ error: 'Budget settings not found' });
    }

    res.json(budgetSetting);
  } catch (error) {
    console.error('Get budget settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget settings
router.put('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { monthly_limit } = req.body;

    if (monthly_limit === undefined || monthly_limit === null) {
      return res.status(400).json({ error: 'Monthly limit is required' });
    }

    db.prepare(
      'UPDATE budget_settings SET monthly_limit = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(monthly_limit, req.userId);

    const budgetSetting = db.prepare('SELECT * FROM budget_settings WHERE user_id = ?').get(req.userId) as BudgetSetting;

    res.json(budgetSetting);
  } catch (error) {
    console.error('Update budget settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get spending summary for a month
router.get('/summary/:year/:month', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.params;

    // Get total expenses for the month
    const result = db.prepare(`
      SELECT
        COALESCE(SUM(amount), 0) as total_spent,
        COUNT(*) as transaction_count
      FROM expenses
      WHERE user_id = ?
      AND strftime('%Y', date) = ?
      AND strftime('%m', date) = ?
    `).get(req.userId, year, month.padStart(2, '0')) as { total_spent: number; transaction_count: number };

    // Get recurring costs for the month
    const recurringMonthly = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM recurring_costs
      WHERE user_id = ?
      AND frequency = 'monthly'
      AND date(start_date) <= date(?)
    `).get(req.userId, `${year}-${month.padStart(2, '0')}-01`) as { total: number };

    const recurringAnnual = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM recurring_costs
      WHERE user_id = ?
      AND frequency = 'annual'
      AND date(start_date) <= date(?)
    `).get(req.userId, `${year}-${month.padStart(2, '0')}-01`) as { total: number };

    // Get budget limit
    const budgetSetting = db.prepare('SELECT * FROM budget_settings WHERE user_id = ?').get(req.userId) as BudgetSetting;

    const totalRecurring = recurringMonthly.total + (recurringAnnual.total / 12);
    const totalSpent = result.total_spent + totalRecurring;
    const remaining = budgetSetting.monthly_limit - totalSpent;
    const percentageUsed = budgetSetting.monthly_limit > 0 ? (totalSpent / budgetSetting.monthly_limit) * 100 : 0;

    res.json({
      total_spent: result.total_spent,
      recurring_costs: totalRecurring,
      total_with_recurring: totalSpent,
      budget_limit: budgetSetting.monthly_limit,
      remaining,
      percentage_used: percentageUsed,
      transaction_count: result.transaction_count,
      is_over_budget: totalSpent > budgetSetting.monthly_limit
    });
  } catch (error) {
    console.error('Get spending summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
