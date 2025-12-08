import express, { Response } from 'express';
import db from '../db/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RecurringCost } from '../types';

const router = express.Router();

// Get all recurring costs for user
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const recurringCosts = db.prepare(
      'SELECT * FROM recurring_costs WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.userId) as RecurringCost[];

    res.json(recurringCosts);
  } catch (error) {
    console.error('Get recurring costs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create recurring cost
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, amount, frequency, category, start_date } = req.body;

    if (!name || !amount || !frequency || !category || !start_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (frequency !== 'monthly' && frequency !== 'annual') {
      return res.status(400).json({ error: 'Frequency must be monthly or annual' });
    }

    const result = db.prepare(
      'INSERT INTO recurring_costs (user_id, name, amount, frequency, category, start_date) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.userId, name, amount, frequency, category, start_date);

    const recurringCost = db.prepare('SELECT * FROM recurring_costs WHERE id = ?').get(result.lastInsertRowid) as RecurringCost;

    res.status(201).json(recurringCost);
  } catch (error) {
    console.error('Create recurring cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recurring cost
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, amount, frequency, category, start_date } = req.body;

    // Verify recurring cost belongs to user
    const recurringCost = db.prepare('SELECT * FROM recurring_costs WHERE id = ? AND user_id = ?').get(id, req.userId) as RecurringCost | undefined;

    if (!recurringCost) {
      return res.status(404).json({ error: 'Recurring cost not found' });
    }

    if (frequency && frequency !== 'monthly' && frequency !== 'annual') {
      return res.status(400).json({ error: 'Frequency must be monthly or annual' });
    }

    db.prepare(
      'UPDATE recurring_costs SET name = ?, amount = ?, frequency = ?, category = ?, start_date = ? WHERE id = ?'
    ).run(name, amount, frequency, category, start_date, id);

    const updatedRecurringCost = db.prepare('SELECT * FROM recurring_costs WHERE id = ?').get(id) as RecurringCost;

    res.json(updatedRecurringCost);
  } catch (error) {
    console.error('Update recurring cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete recurring cost
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify recurring cost belongs to user
    const recurringCost = db.prepare('SELECT * FROM recurring_costs WHERE id = ? AND user_id = ?').get(id, req.userId) as RecurringCost | undefined;

    if (!recurringCost) {
      return res.status(404).json({ error: 'Recurring cost not found' });
    }

    db.prepare('DELETE FROM recurring_costs WHERE id = ?').run(id);

    res.json({ message: 'Recurring cost deleted successfully' });
  } catch (error) {
    console.error('Delete recurring cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
