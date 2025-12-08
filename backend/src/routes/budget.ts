import express, { Response } from 'express';
import { docClient, TABLES, GetCommand, UpdateCommand, QueryCommand, getCurrentTimestamp } from '../db/dynamodb';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { BudgetSetting, Expense, RecurringCost } from '../types';

const router = express.Router();

// Get budget settings
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.BUDGET_SETTINGS,
      Key: {
        user_id: req.userId,
      },
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'Budget settings not found' });
    }

    res.json(result.Item);
  } catch (error) {
    console.error('Get budget settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget settings
router.put('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { monthly_limit } = req.body;

    if (monthly_limit === undefined || monthly_limit === null) {
      return res.status(400).json({ error: 'Monthly limit is required' });
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLES.BUDGET_SETTINGS,
      Key: {
        user_id: req.userId,
      },
      UpdateExpression: 'SET monthly_limit = :limit, updated_at = :timestamp',
      ExpressionAttributeValues: {
        ':limit': monthly_limit,
        ':timestamp': getCurrentTimestamp(),
      },
      ReturnValues: 'ALL_NEW',
    }));

    res.json(result.Attributes);
  } catch (error) {
    console.error('Update budget settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get spending summary for a month
router.get('/summary/:year/:month', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.params;
    const paddedMonth = month.padStart(2, '0');
    const monthStart = `${year}-${paddedMonth}-01`;

    // Get all expenses for the user
    const expensesResult = await docClient.send(new QueryCommand({
      TableName: TABLES.EXPENSES,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId,
      },
    }));

    const expenses = (expensesResult.Items || []) as Expense[];

    // Filter expenses for the specific month and calculate total
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === parseInt(year) &&
             expenseDate.getMonth() === parseInt(month) - 1;
    });

    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const transactionCount = monthExpenses.length;

    // Get recurring costs
    const recurringResult = await docClient.send(new QueryCommand({
      TableName: TABLES.RECURRING_COSTS,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId,
      },
    }));

    const recurringCosts = (recurringResult.Items || []) as RecurringCost[];

    // Filter recurring costs that started before or during this month
    const activeRecurringCosts = recurringCosts.filter(cost => {
      const startDate = new Date(cost.start_date);
      const targetDate = new Date(monthStart);
      return startDate <= targetDate;
    });

    // Calculate recurring costs totals
    const recurringMonthly = activeRecurringCosts
      .filter(cost => cost.frequency === 'monthly')
      .reduce((sum, cost) => sum + cost.amount, 0);

    const recurringAnnual = activeRecurringCosts
      .filter(cost => cost.frequency === 'annual')
      .reduce((sum, cost) => sum + cost.amount, 0);

    // Get budget settings
    const budgetResult = await docClient.send(new GetCommand({
      TableName: TABLES.BUDGET_SETTINGS,
      Key: {
        user_id: req.userId,
      },
    }));

    const budgetSetting = budgetResult.Item as BudgetSetting;

    // Calculate summary
    const totalRecurring = recurringMonthly + (recurringAnnual / 12);
    const totalWithRecurring = totalSpent + totalRecurring;
    const remaining = budgetSetting.monthly_limit - totalWithRecurring;
    const percentageUsed = budgetSetting.monthly_limit > 0
      ? (totalWithRecurring / budgetSetting.monthly_limit) * 100
      : 0;

    res.json({
      total_spent: totalSpent,
      recurring_costs: totalRecurring,
      total_with_recurring: totalWithRecurring,
      budget_limit: budgetSetting.monthly_limit,
      remaining,
      percentage_used: percentageUsed,
      transaction_count: transactionCount,
      is_over_budget: totalWithRecurring > budgetSetting.monthly_limit
    });
  } catch (error) {
    console.error('Get spending summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
