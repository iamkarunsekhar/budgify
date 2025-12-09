from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from .models import ExpenseCreate, ExpenseUpdate, Expense
from .database import (
    get_expenses_by_user,
    get_expense,
    create_expense,
    update_expense,
    delete_expense,
    generate_id,
    get_current_timestamp
)
from .middleware import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/range", response_model=List[Expense])
async def get_expenses_by_range(
    start_date: str = Query(..., description="Start date in ISO format"),
    end_date: str = Query(..., description="End date in ISO format"),
    current_user: dict = Depends(get_current_user)
):
    """Get expenses within a date range for the authenticated user"""
    user_id = current_user['user_id']
    all_expenses = get_expenses_by_user(user_id)

    # Filter expenses by date range
    filtered_expenses = []
    for expense in all_expenses:
        expense_date = datetime.fromisoformat(expense['date'].replace('Z', '+00:00'))
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        if start <= expense_date <= end:
            filtered_expenses.append(expense)

    return filtered_expenses


@router.get("/", response_model=List[Expense])
async def get_all_expenses(current_user: dict = Depends(get_current_user)):
    """Get all expenses for the authenticated user"""
    user_id = current_user['user_id']
    expenses = get_expenses_by_user(user_id)
    return expenses


@router.get("/{expense_id}", response_model=Expense)
async def get_expense_by_id(expense_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific expense"""
    user_id = current_user['user_id']
    expense = get_expense(user_id, expense_id)

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return expense


@router.post("/", response_model=Expense)
async def create_new_expense(expense_data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    """Create a new expense"""
    user_id = current_user['user_id']

    expense = {
        'id': generate_id(),
        'user_id': user_id,
        'amount': expense_data.amount,
        'category': expense_data.category,
        'description': expense_data.description or '',
        'date': expense_data.date,
        'created_at': get_current_timestamp()
    }

    return create_expense(expense)


@router.put("/{expense_id}", response_model=Expense)
async def update_expense_by_id(
    expense_id: int,
    expense_data: ExpenseUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an expense"""
    user_id = current_user['user_id']

    # Check if expense exists
    existing_expense = get_expense(user_id, expense_id)
    if not existing_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Build updates dict
    updates = {}
    if expense_data.amount is not None:
        updates['amount'] = expense_data.amount
    if expense_data.category is not None:
        updates['category'] = expense_data.category
    if expense_data.description is not None:
        updates['description'] = expense_data.description
    if expense_data.date is not None:
        updates['date'] = expense_data.date

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    return update_expense(user_id, expense_id, updates)


@router.delete("/{expense_id}")
async def delete_expense_by_id(expense_id: int, current_user: dict = Depends(get_current_user)):
    """Delete an expense"""
    user_id = current_user['user_id']

    # Check if expense exists
    existing_expense = get_expense(user_id, expense_id)
    if not existing_expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    delete_expense(user_id, expense_id)

    return {"message": "Expense deleted successfully"}
