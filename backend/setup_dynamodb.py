#!/usr/bin/env python3
"""
Setup script for DynamoDB tables for Budgify application.
This script creates all required tables with proper indexes.
"""

import os
import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize DynamoDB client
client = boto3.client(
    'dynamodb',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

# Table names
TABLES = {
    'users': os.getenv('DYNAMODB_USERS_TABLE', 'budgify-users'),
    'expenses': os.getenv('DYNAMODB_EXPENSES_TABLE', 'budgify-expenses'),
    'recurring': os.getenv('DYNAMODB_RECURRING_TABLE', 'budgify-recurring-costs'),
    'budget': os.getenv('DYNAMODB_BUDGET_TABLE', 'budgify-budget-settings'),
}


def create_users_table():
    """Create the users table with email and username indexes"""
    try:
        client.create_table(
            TableName=TABLES['users'],
            KeySchema=[
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'N'},
                {'AttributeName': 'email', 'AttributeType': 'S'},
                {'AttributeName': 'username', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'email-index',
                    'KeySchema': [
                        {'AttributeName': 'email', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'username-index',
                    'KeySchema': [
                        {'AttributeName': 'username', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"✓ Created table: {TABLES['users']}")
    except client.exceptions.ResourceInUseException:
        print(f"⚠ Table already exists: {TABLES['users']}")


def create_expenses_table():
    """Create the expenses table"""
    try:
        client.create_table(
            TableName=TABLES['expenses'],
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'},
                {'AttributeName': 'id', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'N'},
                {'AttributeName': 'id', 'AttributeType': 'N'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"✓ Created table: {TABLES['expenses']}")
    except client.exceptions.ResourceInUseException:
        print(f"⚠ Table already exists: {TABLES['expenses']}")


def create_recurring_table():
    """Create the recurring costs table"""
    try:
        client.create_table(
            TableName=TABLES['recurring'],
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'},
                {'AttributeName': 'id', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'N'},
                {'AttributeName': 'id', 'AttributeType': 'N'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"✓ Created table: {TABLES['recurring']}")
    except client.exceptions.ResourceInUseException:
        print(f"⚠ Table already exists: {TABLES['recurring']}")


def create_budget_table():
    """Create the budget settings table"""
    try:
        client.create_table(
            TableName=TABLES['budget'],
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'N'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"✓ Created table: {TABLES['budget']}")
    except client.exceptions.ResourceInUseException:
        print(f"⚠ Table already exists: {TABLES['budget']}")


def main():
    """Main function to create all tables"""
    print("Setting up DynamoDB tables for Budgify...")
    print(f"Region: {os.getenv('AWS_REGION', 'us-east-1')}\n")

    create_users_table()
    create_expenses_table()
    create_recurring_table()
    create_budget_table()

    print("\n✓ DynamoDB setup complete!")
    print("\nNote: Tables may take a few moments to become active.")
    print("You can check their status in the AWS Console.")


if __name__ == '__main__':
    main()
