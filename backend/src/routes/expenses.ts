import express, { Response } from 'express';
import { docClient, TABLES, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, generateId, getCurrentTimestamp } from '../db/dynamodb';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Expense } from '../types';

const router = express.Router();

// Get all expenses for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.EXPENSES,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId,
      },
    }));

    // Sort by date descending
    const expenses = (result.Items || []) as Expense[];
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expenses by date range
router.get('/range', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.EXPENSES,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId,
      },
    }));

    // Filter by date range in application code
    const expenses = (result.Items || []) as Expense[];
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Sort by date descending
    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(filteredExpenses);
  } catch (error) {
    console.error('Get expenses by range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create expense
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }

    const expenseId = generateId();
    const timestamp = getCurrentTimestamp();

    const expense: Expense = {
      id: expenseId,
      user_id: req.userId!,
      amount,
      category,
      description: description || undefined,
      date,
      created_at: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.EXPENSES,
      Item: expense,
    }));

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    // Verify expense belongs to user
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.EXPENSES,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updatedExpense = await docClient.send(new UpdateCommand({
      TableName: TABLES.EXPENSES,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
      UpdateExpression: 'SET amount = :amount, category = :category, description = :description, #date = :date',
      ExpressionAttributeNames: {
        '#date': 'date', // 'date' is a reserved keyword in DynamoDB
      },
      ExpressionAttributeValues: {
        ':amount': amount,
        ':category': category,
        ':description': description || null,
        ':date': date,
      },
      ReturnValues: 'ALL_NEW',
    }));

    res.json(updatedExpense.Attributes);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify expense belongs to user
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.EXPENSES,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLES.EXPENSES,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
    }));

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
