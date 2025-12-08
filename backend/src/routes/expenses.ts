import express, { Response } from 'express';
import db from '../db/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Expense } from '../types';

const router = express.Router();

// Get all expenses for user
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const expenses = db.prepare(
      'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC'
    ).all(req.userId) as Expense[];

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expenses by date range
router.get('/range', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const expenses = db.prepare(
      'SELECT * FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC'
    ).all(req.userId, start_date, end_date) as Expense[];

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses by range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create expense
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }

    const result = db.prepare(
      'INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)'
    ).run(req.userId, amount, category, description || null, date);

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as Expense;

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    // Verify expense belongs to user
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(id, req.userId) as Expense | undefined;

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.prepare(
      'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?'
    ).run(amount, category, description || null, date, id);

    const updatedExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense;

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify expense belongs to user
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(id, req.userId) as Expense | undefined;

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
