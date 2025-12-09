from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import Dict, Any
from .database import (
    get_budget_settings,
    save_budget_settings,
    get_expenses_by_user,
    get_recurring_costs_by_user,
    get_current_timestamp
)
from .middleware import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/budget", tags=["budget"])


class BudgetSettingsRequest(BaseModel):
    monthly_limit: float


class BudgetSettingsResponse(BaseModel):
    user_id: int
    monthly_limit: float
    updated_at: str


@router.get("", response_model=BudgetSettingsResponse)
async def get_budget(current_user: dict = Depends(get_current_user)):
    """Get budget settings for the authenticated user"""
    user_id = current_user['user_id']
    budget = get_budget_settings(user_id)

    if not budget:
        raise HTTPException(status_code=404, detail="Budget settings not found")

    # Convert monthly_budget to monthly_limit for frontend compatibility
    return {
        'user_id': budget['user_id'],
        'monthly_limit': budget.get('monthly_budget', budget.get('monthly_limit', 0)),
        'updated_at': budget['updated_at']
    }


@router.put("", response_model=BudgetSettingsResponse)
async def update_budget(
    budget_data: BudgetSettingsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update budget settings"""
    user_id = current_user['user_id']

    budget = {
        'user_id': user_id,
        'monthly_budget': budget_data.monthly_limit,
        'monthly_limit': budget_data.monthly_limit,  # Store both for compatibility
        'updated_at': get_current_timestamp()
    }

    saved_budget = save_budget_settings(budget)

    return {
        'user_id': saved_budget['user_id'],
        'monthly_limit': budget_data.monthly_limit,
        'updated_at': saved_budget['updated_at']
    }


@router.get("/summary/{year}/{month}")
async def get_spending_summary(
    year: int,
    month: int,
    current_user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get spending summary for a specific month"""
    user_id = current_user['user_id']

    # Get all expenses for the user
    expenses = get_expenses_by_user(user_id)

    # Filter expenses for the specified month
    month_expenses = []
    for expense in expenses:
        expense_date = datetime.fromisoformat(expense['date'].replace('Z', '+00:00'))
        if expense_date.year == year and expense_date.month == month:
            month_expenses.append(expense)

    # Calculate total spending
    total_spent = sum(exp['amount'] for exp in month_expenses)

    # Get budget settings
    budget = get_budget_settings(user_id)
    monthly_budget = budget.get('monthly_budget', budget.get('monthly_limit', 0)) if budget else 0

    # Calculate category breakdown
    category_totals = {}
    for expense in month_expenses:
        category = expense['category']
        category_totals[category] = category_totals.get(category, 0) + expense['amount']

    # Get recurring costs
    recurring_costs = get_recurring_costs_by_user(user_id)

    # Calculate monthly recurring total
    monthly_recurring = 0
    for cost in recurring_costs:
        if cost['frequency'] == 'monthly':
            monthly_recurring += cost['amount']
        elif cost['frequency'] == 'annual':
            monthly_recurring += cost['amount'] / 12

    # Calculate daily spending for chart
    daily_spending = {}
    for expense in month_expenses:
        expense_date = datetime.fromisoformat(expense['date'].replace('Z', '+00:00'))
        day = expense_date.day
        daily_spending[day] = daily_spending.get(day, 0) + expense['amount']

    # Build daily data for chart
    import calendar
    days_in_month = calendar.monthrange(year, month)[1]
    daily_data = []
    for day in range(1, days_in_month + 1):
        daily_data.append({
            'day': day,
            'amount': daily_spending.get(day, 0)
        })

    return {
        'total_spent': total_spent,
        'monthly_budget': monthly_budget,
        'remaining': monthly_budget - total_spent if monthly_budget else 0,
        'percentage_used': (total_spent / monthly_budget * 100) if monthly_budget > 0 else 0,
        'category_breakdown': category_totals,
        'monthly_recurring': monthly_recurring,
        'expense_count': len(month_expenses),
        'daily_spending': daily_data,
        'expenses': month_expenses,
        'recurring_costs': recurring_costs
    }
