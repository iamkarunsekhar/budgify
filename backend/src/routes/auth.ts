import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { docClient, TABLES, PutCommand, QueryCommand, generateId, getCurrentTimestamp } from '../db/dynamodb';
import { generateToken } from '../middleware/auth';
import { User } from '../types';

const router = express.Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists by email
    const existingUserByEmail = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      Limit: 1,
    }));

    if (existingUserByEmail.Items && existingUserByEmail.Items.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if username already exists
    const existingUserByUsername = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
      Limit: 1,
    }));

    if (existingUserByUsername.Items && existingUserByUsername.Items.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = generateId();
    const timestamp = getCurrentTimestamp();

    // Create user
    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        id: userId,
        username,
        email,
        password: hashedPassword,
        created_at: timestamp,
      },
    }));

    // Create default budget setting
    await docClient.send(new PutCommand({
      TableName: TABLES.BUDGET_SETTINGS,
      Item: {
        user_id: userId,
        monthly_limit: 0,
        updated_at: timestamp,
      },
    }));

    const token = generateToken(userId);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      Limit: 1,
    }));

    if (!result.Items || result.Items.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.Items[0] as User;

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
