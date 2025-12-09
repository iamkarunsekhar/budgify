from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date


# Auth models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    token: str
    user: dict


# Expense models
class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = ""
    date: str  # ISO date string


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None


class Expense(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    description: str
    date: str
    created_at: str


# Recurring cost models
class RecurringCostCreate(BaseModel):
    name: str
    amount: float
    category: str
    frequency: str  # 'monthly' or 'annual'
    start_date: Optional[str] = None  # ISO date string


class RecurringCostUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[str] = None


class RecurringCost(BaseModel):
    id: int
    user_id: int
    name: str
    amount: float
    category: str
    frequency: str
    start_date: str
    created_at: str


# Budget models
class BudgetSettings(BaseModel):
    monthly_budget: float


class BudgetResponse(BaseModel):
    user_id: int
    monthly_budget: float
    updated_at: str
