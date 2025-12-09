from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import Dict, Any
from .models import BudgetSettings, BudgetResponse
from .database import (
    get_budget_settings,
    save_budget_settings,
    get_expenses_by_user,
    get_recurring_costs_by_user,
    get_current_timestamp
)
from .middleware import get_current_user

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/settings", response_model=BudgetResponse)
async def get_budget(current_user: dict = Depends(get_current_user)):
    """Get budget settings for the authenticated user"""
    user_id = current_user['user_id']
    budget = get_budget_settings(user_id)

    if not budget:
        raise HTTPException(status_code=404, detail="Budget settings not found")

    return budget


@router.post("/settings", response_model=BudgetResponse)
async def update_budget(
    budget_data: BudgetSettings,
    current_user: dict = Depends(get_current_user)
):
    """Update budget settings"""
    user_id = current_user['user_id']

    budget = {
        'user_id': user_id,
        'monthly_budget': budget_data.monthly_budget,
        'updated_at': get_current_timestamp()
    }

    return save_budget_settings(budget)


@router.get("/spending/{year}/{month}")
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
    monthly_budget = budget['monthly_budget'] if budget else 0

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
