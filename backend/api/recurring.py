from fastapi import APIRouter, HTTPException, Depends
from typing import List
from .models import RecurringCostCreate, RecurringCostUpdate, RecurringCost
from .database import (
    get_recurring_costs_by_user,
    get_recurring_cost,
    create_recurring_cost,
    update_recurring_cost,
    delete_recurring_cost,
    generate_id,
    get_current_timestamp
)
from .middleware import get_current_user

router = APIRouter(prefix="/recurring", tags=["recurring"])


@router.get("/", response_model=List[RecurringCost])
async def get_all_recurring_costs(current_user: dict = Depends(get_current_user)):
    """Get all recurring costs for the authenticated user"""
    user_id = current_user['user_id']
    recurring_costs = get_recurring_costs_by_user(user_id)
    return recurring_costs


@router.get("/{recurring_id}", response_model=RecurringCost)
async def get_recurring_cost_by_id(recurring_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific recurring cost"""
    user_id = current_user['user_id']
    recurring_cost = get_recurring_cost(user_id, recurring_id)

    if not recurring_cost:
        raise HTTPException(status_code=404, detail="Recurring cost not found")

    return recurring_cost


@router.post("/", response_model=RecurringCost)
async def create_new_recurring_cost(
    recurring_data: RecurringCostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new recurring cost"""
    user_id = current_user['user_id']

    recurring = {
        'id': generate_id(),
        'user_id': user_id,
        'name': recurring_data.name,
        'amount': recurring_data.amount,
        'category': recurring_data.category,
        'frequency': recurring_data.frequency,
        'created_at': get_current_timestamp()
    }

    return create_recurring_cost(recurring)


@router.put("/{recurring_id}", response_model=RecurringCost)
async def update_recurring_cost_by_id(
    recurring_id: int,
    recurring_data: RecurringCostUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a recurring cost"""
    user_id = current_user['user_id']

    # Check if recurring cost exists
    existing_recurring = get_recurring_cost(user_id, recurring_id)
    if not existing_recurring:
        raise HTTPException(status_code=404, detail="Recurring cost not found")

    # Build updates dict
    updates = {}
    if recurring_data.name is not None:
        updates['name'] = recurring_data.name
    if recurring_data.amount is not None:
        updates['amount'] = recurring_data.amount
    if recurring_data.category is not None:
        updates['category'] = recurring_data.category
    if recurring_data.frequency is not None:
        updates['frequency'] = recurring_data.frequency

    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    return update_recurring_cost(user_id, recurring_id, updates)


@router.delete("/{recurring_id}")
async def delete_recurring_cost_by_id(recurring_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a recurring cost"""
    user_id = current_user['user_id']

    # Check if recurring cost exists
    existing_recurring = get_recurring_cost(user_id, recurring_id)
    if not existing_recurring:
        raise HTTPException(status_code=404, detail="Recurring cost not found")

    delete_recurring_cost(user_id, recurring_id)

    return {"message": "Recurring cost deleted successfully"}
