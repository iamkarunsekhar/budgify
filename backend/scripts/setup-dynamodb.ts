import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'budgify-users',
  EXPENSES: process.env.DYNAMODB_EXPENSES_TABLE || 'budgify-expenses',
  RECURRING_COSTS: process.env.DYNAMODB_RECURRING_TABLE || 'budgify-recurring-costs',
  BUDGET_SETTINGS: process.env.DYNAMODB_BUDGET_TABLE || 'budgify-budget-settings',
};

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch {
    return false;
  }
}

async function createUsersTable() {
  if (await tableExists(TABLES.USERS)) {
    console.log(`✅ Table ${TABLES.USERS} already exists`);
    return;
  }

  console.log(`Creating table ${TABLES.USERS}...`);

  await client.send(new CreateTableCommand({
    TableName: TABLES.USERS,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'N' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
      {
        IndexName: 'username-index',
        KeySchema: [
          { AttributeName: 'username', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  }));

  console.log(`✅ Created table ${TABLES.USERS}`);
}

async function createExpensesTable() {
  if (await tableExists(TABLES.EXPENSES)) {
    console.log(`✅ Table ${TABLES.EXPENSES} already exists`);
    return;
  }

  console.log(`Creating table ${TABLES.EXPENSES}...`);

  await client.send(new CreateTableCommand({
    TableName: TABLES.EXPENSES,
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'id', KeyType: 'RANGE' },      // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'N' },
      { AttributeName: 'id', AttributeType: 'N' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  }));

  console.log(`✅ Created table ${TABLES.EXPENSES}`);
}

async function createRecurringCostsTable() {
  if (await tableExists(TABLES.RECURRING_COSTS)) {
    console.log(`✅ Table ${TABLES.RECURRING_COSTS} already exists`);
    return;
  }

  console.log(`Creating table ${TABLES.RECURRING_COSTS}...`);

  await client.send(new CreateTableCommand({
    TableName: TABLES.RECURRING_COSTS,
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'id', KeyType: 'RANGE' },      // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'N' },
      { AttributeName: 'id', AttributeType: 'N' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  }));

  console.log(`✅ Created table ${TABLES.RECURRING_COSTS}`);
}

async function createBudgetSettingsTable() {
  if (await tableExists(TABLES.BUDGET_SETTINGS)) {
    console.log(`✅ Table ${TABLES.BUDGET_SETTINGS} already exists`);
    return;
  }

  console.log(`Creating table ${TABLES.BUDGET_SETTINGS}...`);

  await client.send(new CreateTableCommand({
    TableName: TABLES.BUDGET_SETTINGS,
    KeySchema: [
      { AttributeName: 'user_id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'user_id', AttributeType: 'N' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  }));

  console.log(`✅ Created table ${TABLES.BUDGET_SETTINGS}`);
}

async function setupDynamoDB() {
  console.log('🚀 Setting up DynamoDB tables...\n');

  try {
    await createUsersTable();
    await createExpensesTable();
    await createRecurringCostsTable();
    await createBudgetSettingsTable();

    console.log('\n✅ All tables created successfully!');
    console.log('\n⏳ Note: Tables may take a few moments to become fully active.');
    console.log('You can check their status in the AWS DynamoDB console.');
  } catch (error) {
    console.error('❌ Error setting up DynamoDB:', error);
    process.exit(1);
  }
}

setupDynamoDB();
