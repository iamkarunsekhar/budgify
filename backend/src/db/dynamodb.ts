import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Will use default credentials in AWS environment
});

// Create document client for easier operations
const docClient = DynamoDBDocumentClient.from(client);

// Table names from environment or defaults
const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'budgify-users',
  EXPENSES: process.env.DYNAMODB_EXPENSES_TABLE || 'budgify-expenses',
  RECURRING_COSTS: process.env.DYNAMODB_RECURRING_TABLE || 'budgify-recurring-costs',
  BUDGET_SETTINGS: process.env.DYNAMODB_BUDGET_TABLE || 'budgify-budget-settings',
};

export { docClient, TABLES };

// Helper function to generate unique IDs
export function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Helper function to get current ISO timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Export DynamoDB commands for use in routes
export { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand };
