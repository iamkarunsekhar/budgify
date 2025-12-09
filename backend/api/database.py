import os
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal
import time
import random

# Initialize DynamoDB client
dynamodb = boto3.resource(
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

# Get table references
users_table = dynamodb.Table(TABLES['users'])
expenses_table = dynamodb.Table(TABLES['expenses'])
recurring_table = dynamodb.Table(TABLES['recurring'])
budget_table = dynamodb.Table(TABLES['budget'])


def python_to_dynamodb(obj: Any) -> Any:
    """Convert Python types to DynamoDB compatible types (float -> Decimal)"""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: python_to_dynamodb(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [python_to_dynamodb(v) for v in obj]
    return obj


def dynamodb_to_python(obj: Any) -> Any:
    """Convert DynamoDB types to Python types (Decimal -> float)"""
    if isinstance(obj, Decimal):
        # Convert to float for JSON serialization
        return float(obj)
    elif isinstance(obj, dict):
        return {k: dynamodb_to_python(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [dynamodb_to_python(v) for v in obj]
    return obj


def generate_id() -> int:
    """Generate a unique ID using timestamp and random number"""
    return int(time.time() * 1000) + random.randint(0, 999)


def get_current_timestamp() -> str:
    """Get current ISO timestamp"""
    return datetime.utcnow().isoformat() + 'Z'


# User operations
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email using GSI"""
    response = users_table.query(
        IndexName='email-index',
        KeyConditionExpression=Key('email').eq(email),
        Limit=1
    )
    items = response.get('Items', [])
    return dynamodb_to_python(items[0]) if items else None


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Get user by username using GSI"""
    response = users_table.query(
        IndexName='username-index',
        KeyConditionExpression=Key('username').eq(username),
        Limit=1
    )
    items = response.get('Items', [])
    return dynamodb_to_python(items[0]) if items else None


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    response = users_table.get_item(Key={'id': user_id})
    item = response.get('Item')
    return dynamodb_to_python(item) if item else None


def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user"""
    dynamodb_data = python_to_dynamodb(user_data)
    users_table.put_item(Item=dynamodb_data)
    return user_data


# Expense operations
def get_expenses_by_user(user_id: int) -> List[Dict[str, Any]]:
    """Get all expenses for a user"""
    response = expenses_table.query(
        KeyConditionExpression=Key('user_id').eq(user_id)
    )
    expenses = response.get('Items', [])
    # Sort by date descending
    expenses.sort(key=lambda x: x.get('date', ''), reverse=True)
    return dynamodb_to_python(expenses)


def get_expense(user_id: int, expense_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific expense"""
    response = expenses_table.get_item(
        Key={'user_id': user_id, 'id': expense_id}
    )
    item = response.get('Item')
    return dynamodb_to_python(item) if item else None


def create_expense(expense_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new expense"""
    dynamodb_data = python_to_dynamodb(expense_data)
    expenses_table.put_item(Item=dynamodb_data)
    return expense_data


def update_expense(user_id: int, expense_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update an expense"""
    update_expr = "SET "
    expr_values = {}
    expr_names = {}

    # Convert updates to DynamoDB types
    updates_dynamodb = python_to_dynamodb(updates)

    for i, (key, value) in enumerate(updates_dynamodb.items()):
        if key in ['date', 'name']:  # Reserved keywords
            attr_name = f"#attr{i}"
            attr_value = f":val{i}"
            expr_names[attr_name] = key
            update_expr += f"{attr_name} = {attr_value}, "
        else:
            attr_value = f":val{i}"
            update_expr += f"{key} = {attr_value}, "
        expr_values[attr_value] = value

    update_expr = update_expr.rstrip(', ')

    kwargs = {
        'Key': {'user_id': user_id, 'id': expense_id},
        'UpdateExpression': update_expr,
        'ExpressionAttributeValues': expr_values,
        'ReturnValues': 'ALL_NEW'
    }

    if expr_names:
        kwargs['ExpressionAttributeNames'] = expr_names

    response = expenses_table.update_item(**kwargs)
    return dynamodb_to_python(response.get('Attributes', {}))


def delete_expense(user_id: int, expense_id: int) -> None:
    """Delete an expense"""
    expenses_table.delete_item(Key={'user_id': user_id, 'id': expense_id})


# Recurring cost operations
def get_recurring_costs_by_user(user_id: int) -> List[Dict[str, Any]]:
    """Get all recurring costs for a user"""
    response = recurring_table.query(
        KeyConditionExpression=Key('user_id').eq(user_id)
    )
    return dynamodb_to_python(response.get('Items', []))


def get_recurring_cost(user_id: int, recurring_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific recurring cost"""
    response = recurring_table.get_item(
        Key={'user_id': user_id, 'id': recurring_id}
    )
    item = response.get('Item')
    return dynamodb_to_python(item) if item else None


def create_recurring_cost(recurring_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new recurring cost"""
    dynamodb_data = python_to_dynamodb(recurring_data)
    recurring_table.put_item(Item=dynamodb_data)
    return recurring_data


def update_recurring_cost(user_id: int, recurring_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update a recurring cost"""
    update_expr = "SET "
    expr_values = {}
    expr_names = {}

    # Convert updates to DynamoDB types
    updates_dynamodb = python_to_dynamodb(updates)

    for i, (key, value) in enumerate(updates_dynamodb.items()):
        if key in ['name']:  # Reserved keywords
            attr_name = f"#attr{i}"
            attr_value = f":val{i}"
            expr_names[attr_name] = key
            update_expr += f"{attr_name} = {attr_value}, "
        else:
            attr_value = f":val{i}"
            update_expr += f"{key} = {attr_value}, "
        expr_values[attr_value] = value

    update_expr = update_expr.rstrip(', ')

    kwargs = {
        'Key': {'user_id': user_id, 'id': recurring_id},
        'UpdateExpression': update_expr,
        'ExpressionAttributeValues': expr_values,
        'ReturnValues': 'ALL_NEW'
    }

    if expr_names:
        kwargs['ExpressionAttributeNames'] = expr_names

    response = recurring_table.update_item(**kwargs)
    return dynamodb_to_python(response.get('Attributes', {}))


def delete_recurring_cost(user_id: int, recurring_id: int) -> None:
    """Delete a recurring cost"""
    recurring_table.delete_item(Key={'user_id': user_id, 'id': recurring_id})


# Budget operations
def get_budget_settings(user_id: int) -> Optional[Dict[str, Any]]:
    """Get budget settings for a user"""
    response = budget_table.get_item(Key={'user_id': user_id})
    item = response.get('Item')
    return dynamodb_to_python(item) if item else None


def save_budget_settings(budget_data: Dict[str, Any]) -> Dict[str, Any]:
    """Save budget settings"""
    dynamodb_data = python_to_dynamodb(budget_data)
    budget_table.put_item(Item=dynamodb_data)
    return budget_data
