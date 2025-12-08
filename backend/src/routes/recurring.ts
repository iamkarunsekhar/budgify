import express, { Response } from 'express';
import { docClient, TABLES, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, generateId, getCurrentTimestamp } from '../db/dynamodb';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RecurringCost } from '../types';

const router = express.Router();

// Get all recurring costs for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.RECURRING_COSTS,
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId,
      },
    }));

    const recurringCosts = (result.Items || []) as RecurringCost[];
    // Sort by created_at descending
    recurringCosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(recurringCosts);
  } catch (error) {
    console.error('Get recurring costs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create recurring cost
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, amount, frequency, category, start_date } = req.body;

    if (!name || !amount || !frequency || !category || !start_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (frequency !== 'monthly' && frequency !== 'annual') {
      return res.status(400).json({ error: 'Frequency must be monthly or annual' });
    }

    const recurringId = generateId();
    const timestamp = getCurrentTimestamp();

    const recurringCost: RecurringCost = {
      id: recurringId,
      user_id: req.userId!,
      name,
      amount,
      frequency,
      category,
      start_date,
      created_at: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.RECURRING_COSTS,
      Item: recurringCost,
    }));

    res.status(201).json(recurringCost);
  } catch (error) {
    console.error('Create recurring cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recurring cost
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, amount, frequency, category, start_date } = req.body;

    if (frequency && frequency !== 'monthly' && frequency !== 'annual') {
      return res.status(400).json({ error: 'Frequency must be monthly or annual' });
    }

    // Verify recurring cost belongs to user
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.RECURRING_COSTS,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'Recurring cost not found' });
    }

    const updatedRecurringCost = await docClient.send(new UpdateCommand({
      TableName: TABLES.RECURRING_COSTS,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
      UpdateExpression: 'SET #name = :name, amount = :amount, frequency = :frequency, category = :category, start_date = :start_date',
      ExpressionAttributeNames: {
        '#name': 'name', // 'name' is a reserved keyword in DynamoDB
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':amount': amount,
        ':frequency': frequency,
        ':category': category,
        ':start_date': start_date,
      },
      ReturnValues: 'ALL_NEW',
    }));

    res.json(updatedRecurringCost.Attributes);
  } catch (error) {
    console.error('Update recurring cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete recurring cost
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify recurring cost belongs to user
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.RECURRING_COSTS,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'Recurring cost not found' });
    }

    await docClient.send(new DeleteCommand({
      TableName: TABLES.RECURRING_COSTS,
      Key: {
        user_id: req.userId,
        id: parseInt(id),
      },
    }));

    res.json({ message: 'Recurring cost deleted successfully' });
  } catch (error) {
    console.error('Delete recurring cost error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
