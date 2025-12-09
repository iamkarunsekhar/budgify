from fastapi import APIRouter, HTTPException
from passlib.hash import bcrypt
from .models import UserRegister, UserLogin, Token
from .database import (
    get_user_by_email,
    get_user_by_username,
    create_user,
    generate_id,
    get_current_timestamp
)
from .middleware import generate_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user exists by email
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Check if username is taken
    existing_username = get_user_by_username(user_data.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Hash password
    hashed_password = bcrypt.hash(user_data.password)

    # Create user
    user_id = generate_id()
    user = {
        'id': user_id,
        'username': user_data.username,
        'email': user_data.email,
        'password': hashed_password,
        'created_at': get_current_timestamp()
    }

    create_user(user)

    # Generate token
    token = generate_token(user_id, user_data.email)

    return {
        'token': token,
        'user': {
            'id': user_id,
            'username': user_data.username,
            'email': user_data.email
        }
    }


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user"""
    # Find user by email
    user = get_user_by_email(login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not bcrypt.verify(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate token
    token = generate_token(user['id'], user['email'])

    return {
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    }
